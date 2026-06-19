"""
Mock Scraper (Data Collection MCP)
-----------------------------------
Simulates the output of a real scraping run by generating realistic
sample business records. Used for demo/testing without depending on
a live website.

Each record matches the schema used by the Business model and
mirrors the fields a real scraper (see live_scraper.py) would collect:
name, category, phone, email, website, address, city, state, social links,
rating, reviews_count.
"""

import random

CATEGORIES = [
    "Restaurant", "School", "Clinic", "Salon", "Gym",
    "Retail Store", "Auto Repair", "Bakery", "Electronics Shop", "Pharmacy",
]

CITIES = [
    ("Chennai", "Tamil Nadu"),
    ("Coimbatore", "Tamil Nadu"),
    ("Bengaluru", "Karnataka"),
    ("Hyderabad", "Telangana"),
    ("Madurai", "Tamil Nadu"),
]

FIRST_WORDS = [
    "Royal", "Sunrise", "Golden", "Green", "City", "Prime", "Star",
    "Elite", "Modern", "Classic", "Sri", "New", "Metro", "Smart",
]

SECOND_WORDS = {
    "Restaurant": ["Kitchen", "Dine", "Restaurant", "Foods"],
    "School": ["Academy", "School", "Vidyalaya", "Public School"],
    "Clinic": ["Clinic", "Hospital", "Health Care", "Medical Center"],
    "Salon": ["Salon", "Beauty Parlour", "Hair Studio"],
    "Gym": ["Gym", "Fitness Center", "Fitness Studio"],
    "Retail Store": ["Mart", "Store", "Supermarket", "Shoppe"],
    "Auto Repair": ["Auto Works", "Garage", "Motors", "Auto Care"],
    "Bakery": ["Bakery", "Cakes & More", "Sweets"],
    "Electronics Shop": ["Electronics", "Digital Store", "Mobile Shop"],
    "Pharmacy": ["Pharmacy", "Medicals", "Drug Store"],
}


def _random_phone():
    return f"+91 {random.randint(70000, 99999)}{random.randint(10000, 99999)}"


def _random_email(name: str):
    # ~30% chance of invalid/missing email to simulate real-world data
    if random.random() < 0.15:
        return None
    if random.random() < 0.1:
        return "invalid-email-format"  # intentionally malformed for cleaning module
    slug = name.lower().replace(" ", "").replace("'", "")[:15]
    domain = random.choice(["gmail.com", "yahoo.com", "outlook.com", "business.in"])
    return f"contact@{slug}.{domain.split('.')[0]}.com" if random.random() < 0.3 else f"{slug}@{domain}"


def _random_website(name: str):
    # ~40% have no website, ~10% have a "broken" placeholder, rest active
    r = random.random()
    if r < 0.40:
        return None, "missing"
    slug = name.lower().replace(" ", "").replace("'", "")[:20]
    if r < 0.50:
        return f"http://www.{slug}-broken-link.com", "broken"
    return f"https://www.{slug}.com", "active"


def _random_social(name: str):
    slug = name.lower().replace(" ", "")[:15]
    facebook = f"https://facebook.com/{slug}" if random.random() < 0.55 else None
    instagram = f"https://instagram.com/{slug}" if random.random() < 0.45 else None
    return facebook, instagram


def generate_mock_businesses(count: int = 50):
    """
    Generate a list of mock business records as dictionaries,
    ready to be inserted into the database.
    """
    records = []
    for _ in range(count):
        category = random.choice(CATEGORIES)
        name = f"{random.choice(FIRST_WORDS)} {random.choice(SECOND_WORDS[category])}"
        city, state = random.choice(CITIES)
        website, website_status = _random_website(name)
        facebook, instagram = _random_social(name)

        record = {
            "name": name,
            "category": category,
            "phone": _random_phone(),
            "email": _random_email(name),
            "website": website,
            "address": f"{random.randint(1, 200)}, {random.choice(['Main Road', 'Anna Nagar', 'Gandhi Street', 'MG Road', '2nd Cross Street'])}",
            "city": city,
            "state": state,
            "facebook": facebook,
            "instagram": instagram,
            "rating": round(random.uniform(2.5, 5.0), 1),
            "reviews_count": random.randint(0, 500),
            "has_website": website is not None,
            "website_status": website_status,
        }
        records.append(record)

    return records


if __name__ == "__main__":
    # Quick test
    for r in generate_mock_businesses(5):
        print(r)