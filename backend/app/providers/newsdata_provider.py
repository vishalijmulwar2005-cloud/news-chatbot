"""
NewsData.io Provider
Uses the official NewsData.io REST API (https://newsdata.io) with the configured
API key to fetch full-content, categorized, multi-language news articles.

API Docs: https://newsdata.io/documentation
Free tier: 200 requests/day, up to 10 articles per request.
"""

import asyncio
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
import httpx
from sqlalchemy.orm import Session

from app.db.models import NewsArticleModel
from app.config import settings

NEWSDATA_BASE_URL = "https://newsdata.io/api/1/news"

# Maps our internal category names to newsdata.io category slugs
CATEGORY_MAP = {
    "Technology": "technology",
    "Business":   "business",
    "Sports":     "sports",
    "Science":    "science",
    "Health":     "health",
    "Entertainment": "entertainment",
    "India":      "top",       # top news filtered by country=in
    "World":      "world",
}

COUNTRY_MAP = {
    "India": "in",
}

PLACEHOLDER_IMAGES = {
    "technology":    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "business":      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "sports":        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    "science":       "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&q=80",
    "health":        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    "entertainment": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    "top":           "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    "world":         "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80",
}


def _compute_hash(title: str, url: str) -> str:
    return hashlib.sha256(f"{title.strip().lower()}_{url.strip().lower()}".encode()).hexdigest()


def _parse_date(date_str: Optional[str]) -> datetime:
    if not date_str:
        return datetime.now(timezone.utc)
    try:
        # NewsData returns format: "2026-09-21 07:30:00"
        return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


async def fetch_newsdata_category(
    category_internal: str,
    client: httpx.AsyncClient,
) -> List[dict]:
    """Fetch articles from NewsData.io for a single category."""
    api_category = CATEGORY_MAP.get(category_internal, "top")
    country = COUNTRY_MAP.get(category_internal, None)

    params: dict = {
        "apikey": settings.NEWSDATA_API_KEY,
        "language": "en",
        "category": api_category,
    }
    if country:
        params["country"] = country

    articles = []
    try:
        response = await client.get(NEWSDATA_BASE_URL, params=params, timeout=10.0)
        if response.status_code == 200:
            data = response.json()
            for item in (data.get("results") or []):
                title = (item.get("title") or "").strip()
                link  = (item.get("link") or "").strip()
                if not title or not link:
                    continue

                description = (item.get("description") or "").strip()
                content     = (item.get("content") or description).strip()
                image_url   = item.get("image_url") or PLACEHOLDER_IMAGES.get(api_category, "")
                source_name = item.get("source_name") or item.get("source_id") or "NewsData"
                author_list = item.get("creator") or []
                author      = ", ".join(author_list) if isinstance(author_list, list) else str(author_list)
                pub_date    = _parse_date(item.get("pubDate"))

                articles.append({
                    "title":        title,
                    "description":  description or title,
                    "content":      content,
                    "image_url":    image_url or PLACEHOLDER_IMAGES.get(api_category, ""),
                    "source_name":  source_name,
                    "source_url":   link,
                    "author":       author or None,
                    "published_at": pub_date,
                    "category":     category_internal,
                    "content_hash": _compute_hash(title, link),
                    "provider_id":  "newsdata",
                    "language":     "en",
                })
        else:
            print(f"[NewsData] Non-200 for {category_internal}: HTTP {response.status_code} — {response.text[:200]}")
    except Exception as exc:
        print(f"[NewsData] Error fetching category '{category_internal}': {exc}")

    return articles


async def sync_newsdata_feeds(db: Session) -> int:
    """Fetch all categories from NewsData.io and persist new articles to SQLite."""
    if not settings.NEWSDATA_API_KEY:
        print("[NewsData] API key not set — skipping NewsData.io sync.")
        return 0

    categories = list(CATEGORY_MAP.keys())
    tasks = []
    async with httpx.AsyncClient(
        headers={"User-Agent": "NewsAIChatbot/1.0"},
        timeout=12.0,
    ) as client:
        for cat in categories:
            tasks.append(fetch_newsdata_category(cat, client))
        results = await asyncio.gather(*tasks, return_exceptions=True)

    seen_hashes = set(h[0] for h in db.query(NewsArticleModel.content_hash).all())
    new_count = 0

    for res in results:
        if not isinstance(res, list):
            continue
        for item in res:
            h = item["content_hash"]
            if h in seen_hashes:
                continue
            seen_hashes.add(h)
            db.add(NewsArticleModel(**item))
            new_count += 1

    if new_count:
        db.commit()
        print(f"[NewsData] Persisted {new_count} new articles to database.")

    return new_count
