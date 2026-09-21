import asyncio
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import engine, Base, SessionLocal
from app.db.models import NewsArticleModel
from app.providers.rss_provider import sync_all_rss_feeds
from app.providers.newsdata_provider import sync_newsdata_feeds
from app.api.news_routes import router as news_router
from app.api.chat_routes import router as chat_router
from app.api.bookmark_routes import router as bookmark_router
from app.schemas.news import HealthResponse

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        gemini_status = "Gemini AI ENABLED" if settings.GEMINI_API_KEY else "Zero-Token mode"
        newsdata_status = "NewsData.io ENABLED" if settings.NEWSDATA_API_KEY else "RSS-only"
        print(f"[Startup] Initializing: {gemini_status} | News source: {newsdata_status}")
        # Run both providers in parallel at startup
        asyncio.create_task(sync_all_rss_feeds(db))
        if settings.NEWSDATA_API_KEY:
            asyncio.create_task(sync_newsdata_feeds(db))
    except Exception as e:
        print(f"[Startup Error] {e}")
    yield
    print("[Shutdown] News AI Chatbot shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Zero-Token AI News Aggregator & Chatbot API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(news_router)
app.include_router(chat_router)
app.include_router(bookmark_router)

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    db = SessionLocal()
    try:
        count = db.query(NewsArticleModel).count()
    finally:
        db.close()

    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        zero_token_mode=not bool(settings.GEMINI_API_KEY),
        articles_cached=count,
        timestamp=datetime.now(timezone.utc)
    )

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "gemini_enabled": bool(settings.GEMINI_API_KEY),
        "newsdata_enabled": bool(settings.NEWSDATA_API_KEY),
        "docs": "/docs"
    }
