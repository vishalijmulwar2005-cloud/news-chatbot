import json
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import ChatSessionModel, ChatMessageModel, NewsArticleModel
from app.schemas.news import ChatRequest, ChatResponse, ChatMessageSchema, NewsArticleBase
from app.ai.llm_adapter import llm_adapter

router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or f"session_{uuid.uuid4().hex[:12]}"
    
    # 1. Ensure chat session exists
    session = db.query(ChatSessionModel).filter_by(id=session_id).first()
    if not session:
        session = ChatSessionModel(
            id=session_id,
            title=request.message[:40] + ("..." if len(request.message) > 40 else "")
        )
        db.add(session)
        db.commit()

    # 2. Record user message
    user_msg = ChatMessageModel(
        session_id=session_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    db.commit()

    # 3. Retrieve recent session context (last 6 messages)
    recent_msgs = db.query(ChatMessageModel).filter_by(session_id=session_id).order_by(ChatMessageModel.created_at.desc()).limit(6).all()
    recent_msgs.reverse()

    # 4. Generate intelligent AI response (Zero-Token engine by default)
    reply_text, citations, follow_ups = await llm_adapter.generate_response(
        db=db,
        message=request.message,
        recent_messages=recent_msgs,
        category=request.category
    )

    # 5. Serialize citations for storage
    citations_data = [
        {
            "id": art.id,
            "title": art.title,
            "description": art.description,
            "image_url": art.image_url,
            "source_name": art.source_name,
            "source_url": art.source_url,
            "published_at": art.published_at.isoformat() if art.published_at else None,
            "category": art.category
        }
        for art in citations
    ]

    # 6. Save assistant message
    bot_msg = ChatMessageModel(
        session_id=session_id,
        role="assistant",
        content=reply_text,
        citations_json=json.dumps(citations_data),
        suggested_questions_json=json.dumps(follow_ups)
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return ChatResponse(
        session_id=session_id,
        message=ChatMessageSchema(
            id=bot_msg.id,
            role="assistant",
            content=reply_text,
            citations=[NewsArticleBase.model_validate(c) for c in citations],
            suggested_questions=follow_ups,
            created_at=bot_msg.created_at
        )
    )

@router.get("/chats/{session_id}", response_model=List[ChatMessageSchema])
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSessionModel).filter_by(id=session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.query(ChatMessageModel).filter_by(session_id=session_id).order_by(ChatMessageModel.created_at.asc()).all()
    
    result = []
    for msg in messages:
        citations = []
        if msg.citations_json:
            try:
                raw_cites = json.loads(msg.citations_json)
                citations = [NewsArticleBase(**c) for c in raw_cites]
            except Exception:
                pass

        suggested = []
        if msg.suggested_questions_json:
            try:
                suggested = json.loads(msg.suggested_questions_json)
            except Exception:
                pass

        result.append(ChatMessageSchema(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            citations=citations,
            suggested_questions=suggested,
            created_at=msg.created_at
        ))
    return result

@router.get("/chats")
def list_chat_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ChatSessionModel).order_by(ChatSessionModel.updated_at.desc()).limit(20).all()
    return [{"id": s.id, "title": s.title, "updated_at": s.updated_at} for s in sessions]
