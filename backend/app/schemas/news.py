from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class NewsArticleBase(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    source_name: str
    source_url: str
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    category: str
    language: str = "en"
    provider_id: str = "rss"

    class Config:
        from_attributes = True

class NewsListResponse(BaseModel):
    total: int
    category: Optional[str] = None
    articles: List[NewsArticleBase]

class CategorySchema(BaseModel):
    id: str
    name: str
    slug: str
    icon: str
    count: int = 0

class BookmarkCreate(BaseModel):
    article_id: int
    user_id: Optional[str] = "default_user"

class BookmarkResponse(BaseModel):
    id: int
    article_id: int
    user_id: str
    created_at: datetime
    article: NewsArticleBase

    class Config:
        from_attributes = True

class ArticleDetailResponse(BaseModel):
    article: NewsArticleBase
    ai_summary: Optional[str] = None
    key_points: List[str] = []
    is_bookmarked: bool = False

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    category: Optional[str] = None
    user_id: Optional[str] = "default_user"

class ChatMessageSchema(BaseModel):
    id: Optional[int] = None
    role: str
    content: str
    citations: Optional[List[NewsArticleBase]] = []
    suggested_questions: Optional[List[str]] = []
    created_at: Optional[datetime] = None

class ChatResponse(BaseModel):
    session_id: str
    message: ChatMessageSchema

class HealthResponse(BaseModel):
    status: str
    version: str
    zero_token_mode: bool
    articles_cached: int
    timestamp: datetime
