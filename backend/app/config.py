import os
from dotenv import load_dotenv

# Load .env file from backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

class Settings:
    PROJECT_NAME: str = "News Information AI Chatbot"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # SQLite local database (use /tmp on Vercel serverless)
    _default_db = "sqlite:////tmp/news_chatbot.db" if os.getenv("VERCEL") else "sqlite:///./news_chatbot.db"
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db)

    # Gemini AI API Key (Google AI Studio) - enables enhanced LLM responses
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # NewsData.io API Key - enables premium real-time news with full content
    NEWSDATA_API_KEY: str = os.getenv("NEWSDATA_API_KEY", "")

    # Cache / refresh settings
    NEWS_CACHE_TTL_SECONDS: int = int(os.getenv("NEWS_CACHE_TTL_SECONDS", "900"))  # 15 minutes

    # CORS Origins and Regex for Vercel and local dev
    CORS_ORIGIN_REGEX: str = r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app)(:\d+)?$"
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

settings = Settings()
