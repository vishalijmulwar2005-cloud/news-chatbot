import re
import hashlib
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Optional
import feedparser
import httpx
from sqlalchemy.orm import Session

from app.db.models import NewsArticleModel

# Category RSS feed mapping (100% Free, Zero-Token)
RSS_FEEDS = {
    "India": [
        {"url": "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en", "source": "Google News India"},
        {"url": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", "source": "Times of India"},
    ],
    "World": [
        {"url": "https://feeds.bbci.co.uk/news/world/rss.xml", "source": "BBC News"},
        {"url": "https://feeds.npr.org/1004/rss.xml", "source": "NPR World"},
    ],
    "Technology": [
        {"url": "https://techcrunch.com/feed/", "source": "TechCrunch"},
        {"url": "https://www.theverge.com/rss/index.xml", "source": "The Verge"},
        {"url": "https://feeds.bbci.co.uk/news/technology/rss.xml", "source": "BBC Tech"},
    ],
    "Business": [
        {"url": "https://feeds.bbci.co.uk/news/business/rss.xml", "source": "BBC Business"},
        {"url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", "source": "CNBC"},
    ],
    "Sports": [
        {"url": "https://feeds.bbci.co.uk/sport/rss.xml", "source": "BBC Sport"},
        {"url": "https://www.espn.com/espn/rss/news", "source": "ESPN"},
    ],
    "Science": [
        {"url": "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", "source": "BBC Science"},
        {"url": "https://www.sciencedaily.com/rss/top/science.xml", "source": "ScienceDaily"},
    ],
    "Entertainment": [
        {"url": "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", "source": "BBC Entertainment"},
    ],
    "Health": [
        {"url": "https://feeds.bbci.co.uk/news/health/rss.xml", "source": "BBC Health"},
    ]
}

CATEGORY_PLACEHOLDER_IMAGES = {
    "India": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    "World": "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80",
    "Technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "Business": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    "Science": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&q=80",
    "Entertainment": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    "Health": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80"
}

def clean_html(raw_html: Optional[str]) -> str:
    if not raw_html:
        return ""
    clean_text = re.sub(r"<[^>]+>", "", raw_html)
    clean_text = clean_text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'")
    return " ".join(clean_text.split())

def extract_image_url(entry: dict, category: str) -> str:
    # 1. Check media_content
    if "media_content" in entry and entry["media_content"]:
        for media in entry["media_content"]:
            if "url" in media and media.get("type", "").startswith("image"):
                return media["url"]
            elif "url" in media:
                return media["url"]

    # 2. Check enclosures
    if "enclosures" in entry and entry["enclosures"]:
        for enc in entry["enclosures"]:
            if "href" in enc and enc.get("type", "").startswith("image"):
                return enc["href"]

    # 3. Check media_thumbnail
    if "media_thumbnail" in entry and entry["media_thumbnail"]:
        return entry["media_thumbnail"][0].get("url", "")

    # 4. Search in description or summary html for img tag
    content = entry.get("summary", "") or entry.get("description", "")
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
    if img_match:
        return img_match.group(1)

    # 5. High-quality curated category fallback
    return CATEGORY_PLACEHOLDER_IMAGES.get(category, "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80")

def compute_hash(title: str, url: str) -> str:
    return hashlib.sha256(f"{title.strip().lower()}_{url.strip().lower()}".encode("utf-8")).hexdigest()

def parse_published_time(entry: dict) -> datetime:
    if "published_parsed" in entry and entry["published_parsed"]:
        try:
            return datetime(*entry["published_parsed"][:6], tzinfo=timezone.utc)
        except Exception:
            pass
    if "updated_parsed" in entry and entry["updated_parsed"]:
        try:
            return datetime(*entry["updated_parsed"][:6], tzinfo=timezone.utc)
        except Exception:
            pass
    return datetime.now(timezone.utc)

async def fetch_feed_articles(feed_config: dict, category: str, client: httpx.AsyncClient) -> List[dict]:
    url = feed_config["url"]
    source = feed_config["source"]
    articles = []
    try:
        response = await client.get(url, timeout=7.0, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        if response.status_code == 200:
            parsed = feedparser.parse(response.text)
            for entry in parsed.entries[:12]:  # Limit top 12 per feed
                title = clean_html(entry.get("title", ""))
                if not title:
                    continue
                link = entry.get("link", "")
                summary = clean_html(entry.get("summary", "") or entry.get("description", ""))
                image_url = extract_image_url(entry, category)
                pub_date = parse_published_time(entry)
                author = clean_html(entry.get("author", "")) or None
                content_hash = compute_hash(title, link)

                articles.append({
                    "title": title,
                    "description": summary or title,
                    "content": summary,
                    "image_url": image_url,
                    "source_name": source,
                    "source_url": link,
                    "author": author,
                    "published_at": pub_date,
                    "category": category,
                    "content_hash": content_hash,
                    "provider_id": "rss"
                })
    except Exception as e:
        print(f"[RSS Provider] Error fetching {url}: {e}")
    return articles

async def sync_all_rss_feeds(db: Session) -> int:
    """Fetch all RSS feeds asynchronously, deduplicate, and persist to SQLite."""
    tasks = []
    headers = {"User-Agent": "NewsAIChatbot/1.0"}
    async with httpx.AsyncClient(headers=headers, timeout=8.0) as client:
        for category, feeds in RSS_FEEDS.items():
            for feed in feeds:
                tasks.append(fetch_feed_articles(feed, category, client))
        results = await asyncio.gather(*tasks, return_exceptions=True)

    new_articles_count = 0
    seen_hashes = set(h[0] for h in db.query(NewsArticleModel.content_hash).all())
    for res in results:
        if isinstance(res, list):
            for item in res:
                h = item["content_hash"]
                if h in seen_hashes:
                    continue
                seen_hashes.add(h)
                article = NewsArticleModel(**item)
                db.add(article)
                new_articles_count += 1

    if new_articles_count > 0:
        db.commit()

    # Seed fallback if database is still empty (e.g. offline mode)
    count = db.query(NewsArticleModel).count()
    if count == 0:
        seed_fallback_articles(db)
        count = db.query(NewsArticleModel).count()

    return count

def seed_fallback_articles(db: Session):
    """Ensure rich, realistic fallback news articles in all categories when offline."""
    seeds = [
        {
            "title": "India's Tech Sector Surges with Next-Gen AI and Semiconductor Advancements",
            "description": "Domestic tech enterprises and startups in India expand AI research initiatives, fueling substantial growth across hardware and cloud infrastructure investments.",
            "content": "India's technological ecosystem is experiencing an unprecedented boom as domestic chip design firms and artificial intelligence accelerators announce new research hubs across Bengaluru and Hyderabad. Industry leaders highlight strong governmental backing and a growing talent pool driving global interest.",
            "image_url": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
            "source_name": "The Hindu Tech",
            "source_url": "https://example.com/india-tech-surge",
            "category": "India",
            "published_at": datetime.now(timezone.utc),
            "content_hash": compute_hash("India's Tech Sector Surges", "https://example.com/india-tech-surge"),
        },
        {
            "title": "Global Climate Summit Concludes with Historic Renewable Energy Accords",
            "description": "Delegates from over 120 nations reached a landmark consensus to double renewable capacity targets by 2030, establishing new green grid partnerships.",
            "content": "International climate negotiations concluded with an ambitious multilateral agreement to phase down emissions and accelerate global investments into solar, offshore wind, and next-generation storage systems.",
            "image_url": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80",
            "source_name": "BBC News",
            "source_url": "https://example.com/climate-summit-accords",
            "category": "World",
            "published_at": datetime.now(timezone.utc),
            "content_hash": compute_hash("Global Climate Summit", "https://example.com/climate-summit-accords"),
        },
        {
            "title": "Breakthrough in Quantum Computing Achieves Error-Mitigated Logical Qubits",
            "description": "Researchers demonstrate physical fault tolerance across hundreds of entangled qubits, paving the way for commercial-scale scientific simulations.",
            "content": "A milestone in computing physics was achieved this week as researchers successfully demonstrated error-corrected quantum calculations lasting orders of magnitude longer than previous records.",
            "image_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
            "source_name": "TechCrunch",
            "source_url": "https://example.com/quantum-computing-milestone",
            "category": "Technology",
            "published_at": datetime.now(timezone.utc),
            "content_hash": compute_hash("Breakthrough in Quantum Computing", "https://example.com/quantum-computing-milestone"),
        },
        {
            "title": "Global Markets Rally as Inflation Figures Cool Ahead of Central Bank Decisions",
            "description": "Equities and global indices surged across European and Asian sessions following benign wholesale price reports and stabilizing trade volumes.",
            "content": "Major indices gained steadily as corporate earnings exceeded consensus estimates, giving market analysts confidence in sustained resilience throughout the upcoming quarters.",
            "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
            "source_name": "CNBC",
            "source_url": "https://example.com/global-markets-rally",
            "category": "Business",
            "published_at": datetime.now(timezone.utc),
            "content_hash": compute_hash("Global Markets Rally", "https://example.com/global-markets-rally"),
        },
        {
            "title": "Championship Finals Deliver Thrilling Extra-Time Victory for Underdogs",
            "description": "An electrifying final concluded with an unforgettable comeback score in the final minute, leaving fans and commentators astonished.",
            "content": "In one of the greatest upsets in modern sports history, the underdogs mounted a thrilling fourth-quarter offensive rally to claim their inaugural national championship title before a capacity crowd.",
            "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
            "source_name": "ESPN",
            "source_url": "https://example.com/championship-finals-victory",
            "category": "Sports",
            "published_at": datetime.now(timezone.utc),
            "content_hash": compute_hash("Championship Finals Deliver", "https://example.com/championship-finals-victory"),
        },
        {
            "title": "Deep Space Telescope Discovers Atmospheric Water Vapor on Earth-Sized Exoplanet",
            "description": "Spectroscopic measurements reveal clouds and atmospheric moisture on a rocky exoplanet orbiting inside its host star's habitable zone.",
            "content": "Astronomers deploying space telescope spectrometers have identified atmospheric water vapor signatures on an exoplanet 120 light-years away, marking a crucial step toward detecting habitable worlds.",
            "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
            "source_name": "ScienceDaily",
            "source_url": "https://example.com/exoplanet-atmosphere-water",
            "category": "Science",
            "published_at": datetime.now(timezone.utc),
            "content_hash": compute_hash("Deep Space Telescope Discovers", "https://example.com/exoplanet-atmosphere-water"),
        },
        {
            "title": "Groundbreaking Medical Study Reveals Key Metabolic Pathway for Longevity",
            "description": "Cellular biology researchers map cellular regeneration pathways that significantly reduce inflammatory markers in clinical trials.",
            "content": "Clinical researchers have identified a pivotal metabolic signaling pathway responsible for mitochondrial renewal and repair, opening exciting therapeutic avenues for age-related therapies.",
            "image_url": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
            "source_name": "BBC Health",
            "source_url": "https://example.com/medical-study-longevity",
            "category": "Health",
            "published_at": datetime.now(timezone.utc),
            "content_hash": compute_hash("Groundbreaking Medical Study", "https://example.com/medical-study-longevity"),
        }
    ]

    for item in seeds:
        db.add(NewsArticleModel(**item))
    db.commit()
