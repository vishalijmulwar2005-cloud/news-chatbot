from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.db.models import NewsArticleModel, BookmarkModel
from app.schemas.news import NewsListResponse, NewsArticleBase, ArticleDetailResponse, CategorySchema
from app.ai.zero_token_engine import extract_bullet_points
from app.providers.rss_provider import sync_all_rss_feeds

router = APIRouter(prefix="/api", tags=["News"])

CATEGORIES_META = [
    {"id": "india", "name": "India", "slug": "India", "icon": "🇮🇳"},
    {"id": "world", "name": "World", "slug": "World", "icon": "🌍"},
    {"id": "tech", "name": "Technology", "slug": "Technology", "icon": "💻"},
    {"id": "business", "name": "Business", "slug": "Business", "icon": "📈"},
    {"id": "sports", "name": "Sports", "slug": "Sports", "icon": "⚽"},
    {"id": "science", "name": "Science", "slug": "Science", "icon": "🔬"},
    {"id": "entertainment", "name": "Entertainment", "slug": "Entertainment", "icon": "🎬"},
    {"id": "health", "name": "Health", "slug": "Health", "icon": "🩺"},
]

@router.get("/categories", response_model=List[CategorySchema])
def get_categories(db: Session = Depends(get_db)):
    result = []
    for cat in CATEGORIES_META:
        count = db.query(NewsArticleModel).filter(NewsArticleModel.category == cat["slug"]).count()
        result.append(CategorySchema(
            id=cat["id"],
            name=cat["name"],
            slug=cat["slug"],
            icon=cat["icon"],
            count=count
        ))
    return result

@router.get("/news", response_model=NewsListResponse)
async def get_news(
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(NewsArticleModel)
    if category and category.lower() != "all":
        query = query.filter(NewsArticleModel.category.ilike(category))

    total = query.count()
    if total == 0:
        try:
            from app.providers.rss_provider import seed_fallback_articles
            seed_fallback_articles(db)
            total = query.count()
        except Exception as e:
            print(f"[AutoSeed Error] {e}")

    articles = query.order_by(NewsArticleModel.published_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return NewsListResponse(
        total=total,
        category=category,
        articles=[NewsArticleBase.model_validate(a) for a in articles]
    )

@router.get("/news/{article_id}", response_model=ArticleDetailResponse)
def get_article_detail(
    article_id: int,
    user_id: str = "default_user",
    db: Session = Depends(get_db)
):
    article = db.query(NewsArticleModel).filter(NewsArticleModel.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    is_bookmarked = db.query(BookmarkModel).filter_by(article_id=article_id, user_id=user_id).first() is not None
    
    # Zero-token AI summary & key points
    summary_source = article.content or article.description or article.title
    key_points = extract_bullet_points(summary_source, max_points=3)
    
    ai_summary = f"This article from {article.source_name} discusses key developments in {article.category}. " + " ".join(key_points[:2])

    return ArticleDetailResponse(
        article=NewsArticleBase.model_validate(article),
        ai_summary=ai_summary,
        key_points=key_points,
        is_bookmarked=is_bookmarked
    )

@router.get("/search", response_model=NewsListResponse)
def search_news(
    q: str = Query(..., min_length=1),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(NewsArticleModel).filter(
        or_(
            NewsArticleModel.title.ilike(f"%{q}%"),
            NewsArticleModel.description.ilike(f"%{q}%"),
            NewsArticleModel.source_name.ilike(f"%{q}%")
        )
    )
    if category and category.lower() != "all":
        query = query.filter(NewsArticleModel.category.ilike(category))

    articles = query.order_by(NewsArticleModel.published_at.desc()).limit(30).all()
    return NewsListResponse(
        total=len(articles),
        category=category,
        articles=[NewsArticleBase.model_validate(a) for a in articles]
    )

@router.post("/news/refresh")
async def refresh_news_feeds(db: Session = Depends(get_db)):
    """Trigger background refresh of all live RSS feeds."""
    new_count = await sync_all_rss_feeds(db)
    return {"message": "News feeds refreshed successfully", "total_articles": new_count}
