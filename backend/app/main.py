from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import io

from . import models
from .database import engine, get_db
from .scraper.mock_scraper import generate_mock_businesses
from .analysis.data_cleaning import clean_business, mark_duplicates
from .analysis.opportunity_analyzer import analyze_opportunities
from .analysis.lead_scoring import calculate_lead_score
from .reports.report_generator import generate_report

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Business Data Mining Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "business-data-mining-hnvm3o6ir-snmak2.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Admin credentials (demo) ──────────────────────────────────────────────────
ADMIN_CREDENTIALS = {
    "admin": "datamine123"
}


class LoginRequest(BaseModel):
    username: str
    password: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Business Data Mining Platform API is running"}


@app.post("/auth/login")
def login(req: LoginRequest):
    """Admin Authentication endpoint."""
    expected_password = ADMIN_CREDENTIALS.get(req.username)
    if expected_password and req.password == expected_password:
        return {"success": True, "user": {"username": req.username, "role": "admin"}}
    return {"success": False, "message": "Invalid username or password."}


@app.get("/businesses")
def get_businesses(db: Session = Depends(get_db)):
    return db.query(models.Business).all()


@app.post("/scrape/run")
def run_scraper(count: int = 50, db: Session = Depends(get_db)):
    """Data Collection MCP — generates mock business records."""
    records = generate_mock_businesses(count)
    inserted = 0
    for r in records:
        business = models.Business(**r)
        db.add(business)
        inserted += 1
    db.commit()
    return {"message": f"{inserted} businesses inserted", "count": inserted}


@app.post("/process/run")
def run_processing(db: Session = Depends(get_db)):
    """
    Full processing pipeline:
    1. Data Cleaning MCP
    2. Opportunity Analyzer MCP
    3. Lead Scoring MCP
    """
    businesses = db.query(models.Business).all()
    for b in businesses:
        clean_business(b)
    mark_duplicates(businesses)
    for b in businesses:
        analyze_opportunities(b)
    for b in businesses:
        calculate_lead_score(b)
    db.commit()
    return {"message": f"Processed {len(businesses)} businesses", "count": len(businesses)}


@app.get("/reports/generate")
def generate_pdf_report(db: Session = Depends(get_db)):
    """Reporting MCP — generates and downloads a PDF business intelligence report."""
    businesses = db.query(models.Business).all()
    if not businesses:
        return {"error": "No businesses in database. Run scraper first."}
    pdf_bytes = generate_report(businesses)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=business_report.pdf"}
    )