from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func

from .database import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)

    # Core info
    name = Column(String, index=True)
    category = Column(String, index=True)
    phone = Column(String)
    email = Column(String)
    website = Column(String, nullable=True)
    address = Column(String)
    city = Column(String, index=True)
    state = Column(String, index=True)

    # Social media
    facebook = Column(String, nullable=True)
    instagram = Column(String, nullable=True)

    # Reviews
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)

    # Cleaning / validation flags
    has_valid_phone = Column(Boolean, default=True)
    has_valid_email = Column(Boolean, default=True)
    is_duplicate = Column(Boolean, default=False)

    # Website status (for opportunity analysis)
    has_website = Column(Boolean, default=False)
    website_status = Column(String, default="missing")  # "active", "broken", "missing"

    # Opportunity flags
    website_opportunity = Column(Boolean, default=False)
    digital_marketing_opportunity = Column(Boolean, default=False)
    software_opportunity = Column(Boolean, default=False)
    mobile_app_opportunity = Column(Boolean, default=False)

    # Lead scoring
    lead_score = Column(Float, default=0.0)
    lead_category = Column(String, default="Low Priority")  # Hot/Warm/Potential/Low Priority

    scraped_at = Column(DateTime(timezone=True), server_default=func.now())