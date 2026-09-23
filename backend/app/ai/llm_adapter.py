"""
LLM Adapter
-----------
Routes AI requests to:
  1. Google Gemini (gemini-2.0-flash)  — when GEMINI_API_KEY is configured
  2. Built-in Zero-Token NLP engine    — always available as the default / fallback

Gemini is used in a RAG (Retrieval-Augmented Generation) pattern:
  - The Zero-Token engine retrieves the most relevant news articles first.
  - The retrieved article snippets are passed to Gemini as grounding context.
  - Gemini generates a polished, conversational answer citing those sources.
  - This prevents hallucination while still delivering LLM-quality prose.
"""

import json
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
import httpx

from app.config import settings
from app.db.models import NewsArticleModel, ChatMessageModel
from app.ai.zero_token_engine import zero_token_engine

GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)


class LLMAdapter:
    def __init__(self):
        self.gemini_key: str = settings.GEMINI_API_KEY

    # ------------------------------------------------------------------
    # Public entry-point
    # ------------------------------------------------------------------
    async def generate_response(
        self,
        db: Session,
        message: str,
        recent_messages: List[ChatMessageModel],
        category: Optional[str] = None,
    ) -> Tuple[str, List[NewsArticleModel], List[str]]:
        """
        Returns (response_text, cited_articles, suggested_follow_ups).
        Always retrieves fresh articles first via the Zero-Token engine,
        then optionally enhances the answer with Gemini.
        """
        # Step 1 – always run local retrieval (fast, deterministic, free)
        base_text, articles, follow_ups = zero_token_engine.process_query(
            db, message, recent_messages, category
        )

        # Step 2 – if Gemini key is available, enhance the answer
        if self.gemini_key and articles:
            enhanced = await self._call_gemini(message, articles, recent_messages)
            if enhanced:
                return enhanced, articles, follow_ups

        return base_text, articles, follow_ups

    # ------------------------------------------------------------------
    # Gemini RAG call
    # ------------------------------------------------------------------
    async def _call_gemini(
        self,
        user_message: str,
        articles: List[NewsArticleModel],
        recent_messages: List[ChatMessageModel],
    ) -> Optional[str]:
        """
        Calls Gemini with retrieved news snippets as grounding context.
        Returns the enhanced response text, or None if the call fails.
        """
        # Build compact news context (title + description per article)
        news_context = "\n".join(
            f"{i+1}. [{a.source_name}] {a.title}\n   {a.description or ''}"
            for i, a in enumerate(articles)
        )

        # Build recent conversation history for multi-turn context
        history_parts = []
        for msg in recent_messages[-4:]:      # last 4 messages for context window efficiency
            role = "user" if msg.role == "user" else "model"
            history_parts.append({
                "role": role,
                "parts": [{"text": msg.content}]
            })

        system_instruction = (
            "You are a smart, friendly News AI Assistant embedded in a mobile news app.\n"
            "Answer the user's question STRICTLY based on the retrieved news articles below.\n\n"
            "STRICT FORMATTING RULES — follow exactly:\n"
            "1. Start directly with the answer. No preamble.\n"
            "2. For each article referenced, use this EXACT structure:\n"
            "   ### [Article Title]\n"
            "   [One clear sentence summary of what happened.]\n"
            "   **Source:** [Source Name] | **Category:** [Category]\n"
            "   🔗 [Read full article](url)\n\n"
            "3. Use a horizontal rule `---` between articles.\n"
            "4. Use **bold** only for key facts, names, or figures.\n"
            "5. Do NOT invent facts. If context is insufficient, say so clearly.\n"
            "6. End with 2 follow-up suggestions in plain text, prefixed with 💡\n\n"
            f"Retrieved articles:\n{news_context}"
        )

        # Final user turn
        history_parts.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": history_parts,
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 800,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post(
                    GEMINI_ENDPOINT,
                    params={"key": self.gemini_key},
                    json=payload,
                )
            if resp.status_code == 200:
                data = resp.json()
                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                    .strip()
                )
                if text:
                    return text
            else:
                print(
                    f"[LLMAdapter] Gemini returned HTTP {resp.status_code}: "
                    f"{resp.text[:300]}"
                )
        except Exception as exc:
            print(f"[LLMAdapter] Gemini call failed, using Zero-Token fallback: {exc}")

        return None


llm_adapter = LLMAdapter()
