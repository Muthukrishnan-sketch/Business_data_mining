"""
Data Cleaning MCP
------------------
Validates and normalizes business records.

Responsibilities:
  - Validate email format
  - Validate phone format
  - Detect duplicates (same name + city)
  - Normalize category text
"""

import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^\+?\d[\d\s-]{7,15}$")


def is_valid_email(email):
    if not email:
        return False
    return bool(EMAIL_REGEX.match(email))


def is_valid_phone(phone):
    if not phone:
        return False
    return bool(PHONE_REGEX.match(phone))


def normalize_category(category):
    if not category:
        return category
    return category.strip().title()


def clean_business(business):
    """
    Takes a Business ORM object, validates/normalizes its fields
    in-place, and returns it. Does not commit to DB.
    """
    business.has_valid_email = is_valid_email(business.email)
    business.has_valid_phone = is_valid_phone(business.phone)
    business.category = normalize_category(business.category)
    return business


def mark_duplicates(businesses):
    """
    Marks duplicate records (same name + city, case-insensitive)
    by setting is_duplicate=True on all but the first occurrence.
    Takes a list of Business ORM objects.
    """
    seen = set()
    for b in businesses:
        key = (b.name.strip().lower(), b.city.strip().lower())
        if key in seen:
            b.is_duplicate = True
        else:
            seen.add(key)
            b.is_duplicate = False
    return businesses