"""
Lead Scoring MCP
-----------------
Calculates a 0-100 lead score and maps it to a lead category.

Scoring rules (per spec):
  Website Missing/Broken   = 40 points
  No Social Media          = 20 points
  No SEO Presence          = 20 points (proxy: website not active)
  Poor Reviews             = 20 points (rating < 3.5 or reviews_count < 50)

Lead Categories:
  90-100 = Hot Lead
  70-89  = Warm Lead
  50-69  = Potential Lead
  <50    = Low Priority
"""


def calculate_lead_score(business):
    """
    Takes a Business ORM object, sets lead_score and lead_category
    in-place, and returns it. Does not commit to DB.

    Note: This score represents "opportunity size" - higher score
    means the business has more gaps (website, social, SEO, reviews)
    that the agency/developer could help fill, i.e. a "hotter" lead
    for sales outreach.
    """
    score = 0

    # Website missing or broken
    if not business.has_website or business.website_status == "broken":
        score += 40

    # No social media presence at all
    if business.facebook is None and business.instagram is None:
        score += 20

    # No SEO presence (proxy: website not active)
    if business.website_status != "active":
        score += 20

    # Poor reviews
    if business.rating < 3.5 or business.reviews_count < 50:
        score += 20

    business.lead_score = float(score)

    if score >= 90:
        business.lead_category = "Hot Lead"
    elif score >= 70:
        business.lead_category = "Warm Lead"
    elif score >= 50:
        business.lead_category = "Potential Lead"
    else:
        business.lead_category = "Low Priority"

    return business