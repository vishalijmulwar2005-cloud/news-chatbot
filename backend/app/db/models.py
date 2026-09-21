from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class NewsArticleModel(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(512), nullable=False, index=True)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    image_url = Column(String(1024), nullable=True)
    source_name = Column(String(128), nullable=False, index=True)
    source_url = Column(String(1024), nullable=False)
    author = Column(String(256), nullable=True)
    published_at = Column(DateTime, default=datetime.utcnow, index=True)
    category = Column(String(64), nullable=False, index=True)
    language = Column(String(10), default="en")
    provider_id = Column(String(64), default="rss")
    content_hash = Column(String(64), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookmarks = relationship("BookmarkModel", back_populates="article", cascade="all, delete-orphan")


class BookmarkModel(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(128), default="default_user", index=True)
    article_id = Column(Integer, ForeignKey("news_articles.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    article = relationship("NewsArticleModel", back_populates="bookmarks")


class ChatSessionModel(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(256), default="New Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessageModel", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessageModel.created_at")


class ChatMessageModel(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role = Column(String(32), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=True)  # JSON array of article references
    suggested_questions_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSessionModel", back_populates="messages")


class UserPreferenceModel(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(128), unique=True, index=True)
    theme = Column(String(32), default="light")
    language = Column(String(32), default="en")
    categories_json = Column(Text, default='["India", "World", "Technology", "Business", "Sports"]')
    notifications_enabled = Column(Boolean, default=True)
