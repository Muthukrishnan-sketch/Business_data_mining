"""
Live Scraper (Data Collection MCP)
------------------------------------
Real Selenium-based scraper skeleton for collecting business data
from a public business directory.

This is a working scraper template — point TARGET_URL and the CSS
selectors below at a real directory site's search results page.
Includes:
  - Headless Chrome setup
  - Pagination handling
  - Basic error logging
  - Duplicate prevention (by business name + phone)

NOTE: Always check a site's robots.txt and terms of service before
scraping. This skeleton is provided for educational/demo purposes.
"""

import logging
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logging.basicConfig(
    filename="scraper_errors.log",
    level=logging.ERROR,
    format="%(asctime)s %(levelname)s %(message)s",
)

# ---- Configure these for the target site ----
TARGET_URL = "https://example.com/search?category={category}&page={page}"
MAX_PAGES = 3

SELECTORS = {
    "listing_card": "div.listing-card",       # container for each business
    "name": "h2.business-name",
    "phone": "span.phone",
    "address": "div.address",
    "category": "span.category",
    "website": "a.website-link",
    "next_page": "a.pagination-next",
}
# ------------------------------------------------


def get_driver(headless: bool = True):
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )
    driver = webdriver.Chrome(options=options)
    return driver


def scrape_category(category: str, max_pages: int = MAX_PAGES):
    """
    Scrape business listings for a given category across multiple pages.
    Returns a list of dicts with raw scraped fields.
    Duplicate prevention is done via a (name, phone) seen-set.
    """
    driver = get_driver()
    results = []
    seen = set()

    try:
        for page in range(1, max_pages + 1):
            url = TARGET_URL.format(category=category, page=page)
            try:
                driver.get(url)
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, SELECTORS["listing_card"]))
                )
            except TimeoutException:
                logging.error(f"Timeout loading page {page} for category '{category}' at {url}")
                break

            cards = driver.find_elements(By.CSS_SELECTOR, SELECTORS["listing_card"])
            if not cards:
                break

            for card in cards:
                record = _extract_record(card, category)
                if record is None:
                    continue

                dedup_key = (record["name"].strip().lower(), record["phone"].strip())
                if dedup_key in seen:
                    continue
                seen.add(dedup_key)
                results.append(record)

            time.sleep(1)  # polite delay between pages

    finally:
        driver.quit()

    return results


def _extract_record(card, category: str):
    """Extract a single business record from a listing card element."""
    try:
        name = _safe_text(card, SELECTORS["name"])
        phone = _safe_text(card, SELECTORS["phone"])
        address = _safe_text(card, SELECTORS["address"])
        website = _safe_attr(card, SELECTORS["website"], "href")

        if not name:
            return None

        return {
            "name": name,
            "category": category,
            "phone": phone or "",
            "address": address or "",
            "website": website,
        }
    except NoSuchElementException as e:
        logging.error(f"Failed to extract record: {e}")
        return None


def _safe_text(card, selector):
    try:
        return card.find_element(By.CSS_SELECTOR, selector).text
    except NoSuchElementException:
        return None


def _safe_attr(card, selector, attr):
    try:
        return card.find_element(By.CSS_SELECTOR, selector).get_attribute(attr)
    except NoSuchElementException:
        return None


if __name__ == "__main__":
    data = scrape_category("restaurants")
    for d in data:
        print(d)