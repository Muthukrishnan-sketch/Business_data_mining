"""
Insight / Opportunity Analyzer MCP
------------------------------------
Rule-based engine that flags business opportunities:
  - Website Opportunity
  - Digital Marketing Opportunity
  - Software Development Opportunity
  - Mobile App Opportunity
"""

# Categories considered "service-based" for mobile app opportunity
MOBILE_APP_CATEGORIES = {"School", "Clinic", "Restaurant", "Salon", "Gym", "Pharmacy"}


def analyze_opportunities(business):
    """
    Takes a Business ORM object, sets opportunity flags in-place,
    and returns it. Does not commit to DB.
    """
    # Website Opportunity: missing or broken website
    business.website_opportunity = (
        not business.has_website or business.website_status == "broken"
    )

    # Digital Marketing Opportunity: no Facebook AND no Instagram
    business.digital_marketing_opportunity = (
        business.facebook is None and business.instagram is None
    )

    # Software Development Opportunity: large operation (many reviews)
    # but no website -> likely manual processes, no online booking
    business.software_opportunity = (
        business.reviews_count > 200 and not business.has_website
    )

    # Mobile App Opportunity: service-based category
    business.mobile_app_opportunity = business.category in MOBILE_APP_CATEGORIES

    return business