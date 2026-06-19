"""
Reporting MCP
--------------
Generates a professional PDF business intelligence report using ReportLab.

Report Sections:
  1. Cover Page - Title, date, summary stats
  2. Data Summary - Total businesses, categories, cities breakdown
  3. Opportunity Analysis - Website, social media, software, mobile app gaps
  4. Top 10 Leads - Highest scoring businesses with lead category
  5. Business Insights - Auto-generated insight statements
  6. Recommendations - Actionable next steps
"""

import io
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)


# ── Color Palette ──────────────────────────────────────────────────────────────
NAVY      = colors.HexColor("#1e3a5f")
TEAL      = colors.HexColor("#0ea5e9")
LIGHT_BG  = colors.HexColor("#f0f7ff")
BORDER    = colors.HexColor("#cbd5e1")
RED       = colors.HexColor("#ef4444")
ORANGE    = colors.HexColor("#f97316")
YELLOW    = colors.HexColor("#eab308")
GRAY      = colors.HexColor("#6b7280")
WHITE     = colors.white
TEXT      = colors.HexColor("#1e293b")


def _styles():
    base = getSampleStyleSheet()
    custom = {
        "cover_title": ParagraphStyle(
            "cover_title", fontSize=28, fontName="Helvetica-Bold",
            textColor=WHITE, alignment=TA_CENTER, spaceAfter=8,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub", fontSize=13, fontName="Helvetica",
            textColor=colors.HexColor("#bfdbfe"), alignment=TA_CENTER, spaceAfter=6,
        ),
        "section_heading": ParagraphStyle(
            "section_heading", fontSize=15, fontName="Helvetica-Bold",
            textColor=NAVY, spaceBefore=18, spaceAfter=8,
            borderPad=4,
        ),
        "body": ParagraphStyle(
            "body", fontSize=10, fontName="Helvetica",
            textColor=TEXT, spaceAfter=6, leading=15,
        ),
        "insight": ParagraphStyle(
            "insight", fontSize=10, fontName="Helvetica",
            textColor=TEXT, spaceAfter=8, leading=15,
            leftIndent=12, borderPad=6,
        ),
        "label": ParagraphStyle(
            "label", fontSize=9, fontName="Helvetica-Bold",
            textColor=GRAY, spaceAfter=2,
        ),
    }
    return custom


def _stat_table(stats: list):
    """
    Renders a row of stat boxes: [(label, value, color), ...]
    """
    s = _styles()
    cells = []
    for label, value, color in stats:
        cell = Table(
            [[Paragraph(str(value), ParagraphStyle("sv", fontSize=22, fontName="Helvetica-Bold", textColor=color, alignment=TA_CENTER))],
             [Paragraph(label, ParagraphStyle("sl", fontSize=9, fontName="Helvetica", textColor=GRAY, alignment=TA_CENTER))]],
            colWidths=[3.8 * cm]
        )
        cell.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
            ("ROUNDEDCORNERS", [6, 6, 6, 6]),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        cells.append(cell)

    row_table = Table([cells], colWidths=[4.2 * cm] * len(cells))
    row_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return row_table


def generate_report(businesses: list) -> bytes:
    """
    Takes a list of Business ORM objects (or dicts), generates a PDF report,
    and returns it as bytes (for FastAPI StreamingResponse).
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title="Business Data Mining Report",
        author="DataMine Platform",
    )

    s = _styles()
    story = []
    now = datetime.now().strftime("%d %B %Y, %I:%M %p")

    # Helper: access dict or ORM object
    def g(obj, key, default=None):
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    # ── COVER PAGE ─────────────────────────────────────────────────────────────
    cover_bg = Table(
        [[Paragraph("Business Data Mining Platform", s["cover_title"])],
         [Paragraph("Intelligence Report", s["cover_sub"])],
         [Paragraph(f"Generated on {now}", s["cover_sub"])]],
        colWidths=[17 * cm],
    )
    cover_bg.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("TOPPADDING", (0, 0), (-1, -1), 28),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 28),
        ("LEFTPADDING", (0, 0), (-1, -1), 24),
        ("RIGHTPADDING", (0, 0), (-1, -1), 24),
        ("ROUNDEDCORNERS", [10, 10, 10, 10]),
    ]))
    story.append(cover_bg)
    story.append(Spacer(1, 0.6 * cm))

    # ── SECTION 1: SUMMARY STATS ───────────────────────────────────────────────
    story.append(Paragraph("1. Data Summary", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=10))

    total = len(businesses)
    categories = list(set(g(b, "category", "") for b in businesses))
    cities = list(set(g(b, "city", "") for b in businesses))
    hot = sum(1 for b in businesses if g(b, "lead_category") == "Hot Lead")
    warm = sum(1 for b in businesses if g(b, "lead_category") == "Warm Lead")
    potential = sum(1 for b in businesses if g(b, "lead_category") == "Potential Lead")
    no_website = sum(1 for b in businesses if not g(b, "has_website"))

    story.append(_stat_table([
        ("Total Businesses", total, NAVY),
        ("Categories", len(categories), TEAL),
        ("Cities", len(cities), TEAL),
        ("Hot Leads", hot, RED),
        ("Warm Leads", warm, ORANGE),
    ]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        f"The platform collected data from <b>{total}</b> businesses across <b>{len(cities)}</b> cities "
        f"and <b>{len(categories)}</b> business categories. A total of <b>{hot + warm}</b> businesses "
        f"are identified as high-priority leads (Hot + Warm).",
        s["body"]
    ))

    # ── SECTION 2: OPPORTUNITY ANALYSIS ────────────────────────────────────────
    story.append(Paragraph("2. Opportunity Analysis", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=10))

    web_opp = sum(1 for b in businesses if g(b, "website_opportunity"))
    dm_opp = sum(1 for b in businesses if g(b, "digital_marketing_opportunity"))
    sw_opp = sum(1 for b in businesses if g(b, "software_opportunity"))
    app_opp = sum(1 for b in businesses if g(b, "mobile_app_opportunity"))

    opp_data = [
        ["Opportunity Type", "Businesses Affected", "% of Total", "Action"],
        ["Website (Missing/Broken)", str(web_opp), f"{round(web_opp/total*100) if total else 0}%", "Web development"],
        ["Digital Marketing (No Social)", str(dm_opp), f"{round(dm_opp/total*100) if total else 0}%", "Social media setup"],
        ["Software Development", str(sw_opp), f"{round(sw_opp/total*100) if total else 0}%", "Custom software"],
        ["Mobile App", str(app_opp), f"{round(app_opp/total*100) if total else 0}%", "App development"],
    ]

    opp_table = Table(opp_data, colWidths=[5.5*cm, 4*cm, 3*cm, 4.5*cm])
    opp_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("BACKGROUND", (0, 2), (-1, 2), LIGHT_BG),
        ("BACKGROUND", (0, 4), (-1, 4), LIGHT_BG),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(opp_table)

    # ── SECTION 3: TOP 10 LEADS ─────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("3. Top 10 Leads", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=10))
    story.append(Paragraph(
        "The following businesses have the highest lead scores, indicating the most significant "
        "digital service opportunities.",
        s["body"]
    ))
    story.append(Spacer(1, 0.3 * cm))

    sorted_businesses = sorted(businesses, key=lambda b: g(b, "lead_score", 0), reverse=True)[:10]

    leads_data = [["#", "Business Name", "Category", "City", "Score", "Lead Type"]]
    for i, b in enumerate(sorted_businesses, 1):
        leads_data.append([
            str(i),
            g(b, "name", ""),
            g(b, "category", ""),
            g(b, "city", ""),
            str(int(g(b, "lead_score", 0))),
            g(b, "lead_category", ""),
        ])

    leads_table = Table(leads_data, colWidths=[1*cm, 5*cm, 3.5*cm, 3*cm, 1.8*cm, 3.2*cm])
    leads_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("ALIGN", (1, 0), (1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(leads_table)

    # ── SECTION 4: INSIGHTS ─────────────────────────────────────────────────────
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph("4. Business Insights", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=10))

    insights = []
    if total > 0:
        no_web_pct = round(no_website / total * 100)
        no_social = sum(1 for b in businesses if not g(b, "facebook") and not g(b, "instagram"))
        no_social_pct = round(no_social / total * 100)
        hot_pct = round(hot / total * 100)
        restaurants = [b for b in businesses if g(b, "category") == "Restaurant"]
        rest_no_web = sum(1 for b in restaurants if not g(b, "has_website"))

        insights = [
            f"&#8226; {no_web_pct}% of businesses ({no_website} out of {total}) do not have an active website, representing a significant web development opportunity.",
            f"&#8226; {no_social_pct}% of businesses have no social media presence on either Facebook or Instagram — a prime digital marketing opportunity.",
            f"&#8226; {hot_pct}% of all businesses qualify as Hot Leads (score 90+), signalling urgent and high-value service gaps.",
            f"&#8226; {rest_no_web} out of {len(restaurants)} restaurants lack a website — restaurants are among the highest-value targets for online ordering integrations.",
            f"&#8226; {app_opp} businesses operate in mobile-app-relevant categories (Schools, Clinics, Restaurants, Salons, Gyms) and could benefit from a custom app.",
            f"&#8226; {sw_opp} businesses show indicators of large manual operations (high review count, no website) — strong candidates for custom software solutions.",
        ]

    for insight in insights:
        box = Table(
            [[Paragraph(insight, s["insight"])]],
            colWidths=[17 * cm]
        )
        box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("BOX", (0, 0), (-1, -1), 0.5, TEAL),
        ]))
        story.append(box)
        story.append(Spacer(1, 0.25 * cm))

    # ── SECTION 5: RECOMMENDATIONS ──────────────────────────────────────────────
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph("5. Recommendations", s["section_heading"]))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=10))

    recs = [
        ("Priority 1 — Website Development", f"Target the {web_opp} businesses without an active website. Offer affordable landing page packages to convert these leads quickly."),
        ("Priority 2 — Digital Marketing", f"{dm_opp} businesses have zero social media presence. Offer social media setup and management packages."),
        ("Priority 3 — Mobile Apps", f"Focus on the {app_opp} service-based businesses (clinics, schools, restaurants). Appointment booking and ordering apps are high-value and recurring revenue."),
        ("Priority 4 — Software Solutions", f"{sw_opp} large businesses operate without digital infrastructure. Custom CRM, billing, or inventory software could be a premium offering."),
    ]

    for title, detail in recs:
        story.append(Paragraph(f"<b>{title}</b>", s["body"]))
        story.append(Paragraph(detail, s["insight"]))
        story.append(Spacer(1, 0.2 * cm))

    # ── FOOTER NOTE ─────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.8 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        f"Report generated by DataMine Business Intelligence Platform &nbsp;|&nbsp; {now}",
        ParagraphStyle("footer", fontSize=8, textColor=GRAY, alignment=TA_CENTER)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()