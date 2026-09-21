from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import BookmarkModel, NewsArticleModel
from app.schemas.news import BookmarkCreate, BookmarkResponse, NewsArticleBase

router = APIRouter(prefix="/api", tags=["Bookmarks"])

@router.get("/bookmarks", response_model=List[BookmarkResponse])
def get_bookmarks(user_id: str = "default_user", db: Session = Depends(get_db)):
    bookmarks = db.query(BookmarkModel).filter_by(user_id=user_id).order_by(BookmarkModel.created_at.desc()).all()
    return [
        BookmarkResponse(
            id=b.id,
            article_id=b.article_id,
            user_id=b.user_id,
            created_at=b.created_at,
            article=NewsArticleBase.model_validate(b.article)
        )
        for b in bookmarks if b.article
    ]

@router.post("/bookmarks", response_model=BookmarkResponse)
def add_bookmark(data: BookmarkCreate, db: Session = Depends(get_db)):
    article = db.query(NewsArticleModel).filter_by(id=data.article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    existing = db.query(BookmarkModel).filter_by(article_id=data.article_id, user_id=data.user_id).first()
    if existing:
        return BookmarkResponse(
            id=existing.id,
            article_id=existing.article_id,
            user_id=existing.user_id,
            created_at=existing.created_at,
            article=NewsArticleBase.model_validate(article)
        )

    bookmark = BookmarkModel(article_id=data.article_id, user_id=data.user_id)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)

    return BookmarkResponse(
        id=bookmark.id,
        article_id=bookmark.article_id,
        user_id=bookmark.user_id,
        created_at=bookmark.created_at,
        article=NewsArticleBase.model_validate(article)
    )

@router.delete("/bookmarks/{article_id}")
def remove_bookmark(article_id: int, user_id: str = "default_user", db: Session = Depends(get_db)):
    bookmark = db.query(BookmarkModel).filter_by(article_id=article_id, user_id=user_id).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()
    return {"message": "Bookmark removed successfully", "article_id": article_id}
