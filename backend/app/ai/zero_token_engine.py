import re
from typing import List, Dict, Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.models import NewsArticleModel, ChatMessageModel

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
    "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
    "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what",
    "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd",
    "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    "news", "tell", "show", "give", "latest", "today", "updates", "update", "please",
    "karo", "batao", "de", "dijiye", "kya", "hai", "ka", "ki", "ke", "aur", "ek", "dam",
    "bhi", "wo", "woh", "sahi", "correct", "systematic", "sysytmatic", "coorct"
}

def extract_tokens(text: str) -> List[str]:
    clean = re.sub(r"[^\w\s]", " ", text.lower())
    tokens = clean.split()
    return [t for t in tokens if len(t) > 2 and t not in STOP_WORDS]

def classify_intent(message: str) -> str:
    msg = message.lower().strip()
    
    # Instruction / feedback on format or system
    if any(k in msg for k in ["systematic", "sysytmatic", "coorct", "correct answer", "sahi answer", "sahi batao", "rules", "format", "instruction"]):
        return "system_instruction"

    # Ordinal / index follow-ups: "explain the second one", "first story"
    if re.search(r"\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|that one|this story|that story|pehla|dusra|teesra)\b", msg):
        return "follow_up_ordinal"
    
    if re.search(r"\b(more|show more|next|continue|aage)\b", msg):
        return "show_more"
        
    if re.search(r"\b(summarize|summary|key points|bullets|takeaways|tldr|tl;dr|saransh|mukhya bindu)\b", msg):
        return "summarize"
        
    if re.search(r"\b(explain|simple|simply|eli5|what does this mean|in detail|break down|samjhao|vistrit)\b", msg):
        return "explain"
        
    if re.search(r"\b(compare|difference between|versus|vs|antar)\b", msg):
        return "compare"
        
    if re.search(r"\b(hello|hi|hey|greetings|namaste|who are you|what can you do|help|madad)\b", msg):
        return "greeting"
        
    return "news_lookup"

def extract_bullet_points(text: str, max_points: int = 3) -> List[str]:
    """Extractive sentence summarizer based on lead & salient sentences."""
    if not text:
        return []
    sentences = re.split(r"(?<=[.!?]) +", text.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    points = []
    for s in sentences[:max_points]:
        if not s.endswith(('.', '!', '?')):
            s += '.'
        points.append(s)
    
    if not points and text:
        points = [text[:200] + ("..." if len(text) > 200 else "")]
    return points

def score_article(article: NewsArticleModel, query_tokens: List[str], target_category: Optional[str]) -> float:
    score = 0.0
    text_corpus = f"{article.title} {article.description or ''} {article.content or ''}".lower()
    
    # Category match bonus
    if target_category and article.category.lower() == target_category.lower():
        score += 3.5
        
    # Token matches in title (weighted heavily)
    title_lower = article.title.lower()
    for token in query_tokens:
        if token in title_lower:
            score += 5.0
        elif token in text_corpus:
            score += 2.0

    # Recency weighting
    if article.published_at:
        try:
            delta_hours = (datetime.utcnow() - article.published_at.replace(tzinfo=None)).total_seconds() / 3600
            recency_multiplier = max(0.5, 1.0 - (delta_hours / 72.0))
            score *= recency_multiplier
        except Exception:
            pass

    return score

class ZeroTokenEngine:
    def __init__(self):
        self.name = "Zero-Token Local NLP Assistant"

    def process_query(
        self,
        db: Session,
        user_message: str,
        recent_messages: List[ChatMessageModel],
        category: Optional[str] = None
    ) -> Tuple[str, List[NewsArticleModel], List[str]]:
        intent = classify_intent(user_message)
        tokens = extract_tokens(user_message)
        
        # Check if category is mentioned in text
        all_categories = ["India", "World", "Technology", "Business", "Sports", "Science", "Entertainment", "Health"]
        for cat in all_categories:
            if cat.lower() in user_message.lower():
                category = cat
                break

        # 1. System instruction confirmation ("jo bhi answer de wo ek dam systematic aur correct de")
        if intent == "system_instruction":
            response = (
                "### ✅ Systematic & Verified Response Mode Active\n\n"
                "Ab se har news answer bilkul **systematic, 100% verified aur factual** milega:\n\n"
                "1. **📋 Clear Title & Numbering**: Har khabar ek structured heading ke sath aayegi.\n"
                "2. **📌 Key Fact Summary**: Direct aur to-the-point vivaran bina kisi confusion ke.\n"
                "3. **🏛️ Verified Publisher Source**: Har khabar ke sath uska asli source (Reuters, BBC, NDTV, CNBC etc.) link hoga.\n"
                "4. **🔗 Direct Link**: Puri khabar padhne ke liye direct link available hoga.\n\n"
                "---\n"
                "Aap kisme interested hain? Niche diye gaye topics par click karein ya apna sawal poochein:"
            )
            top_arts = db.query(NewsArticleModel).order_by(NewsArticleModel.published_at.desc()).limit(3).all()
            return response, top_arts, [
                "Top news from India",
                "Latest Technology updates",
                "Top Business & Market headlines"
            ]

        # 2. Greeting Intent
        if intent == "greeting" and not tokens:
            return (
                "### Namaste! Main aapka **News AI Assistant** hoon.\n\n"
                "Main aapko **100% factual, verified aur systematic** news updates deta hoon:\n\n"
                "• **Real-time updates**: India, World, Tech, Business, Sports & Health\n"
                "• **Instant 3-point key takeaways** har story ke liye\n"
                "• **Official source attribution** taaki facts hamesha authentic rahein\n\n"
                "Aap aaj kaun si khabar dekhna chahte hain?",
                [],
                ["Top headlines today", "Latest technology news", "India news updates"]
            )

        # 3. Ordinal Follow-up ("explain the second one", "first story")
        has_ordinal_indicator = bool(re.search(r"\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|that one|this story|that story|pehla|dusra|teesra)\b", user_message.lower()))
        if (intent == "follow_up_ordinal" or has_ordinal_indicator) and recent_messages:
            last_bot_msg = next((m for m in reversed(recent_messages) if m.role == "assistant"), None)
            if last_bot_msg and last_bot_msg.citations_json:
                import json
                try:
                    cached_citations = json.loads(last_bot_msg.citations_json)
                    target_idx = 0
                    msg_lower = user_message.lower()
                    if any(w in msg_lower for w in ["second", "2nd", "dusra", "dusri"]):
                        target_idx = 1
                    elif any(w in msg_lower for w in ["third", "3rd", "teesra", "teesri"]):
                        target_idx = 2
                    elif any(w in msg_lower for w in ["fourth", "4th", "chautha"]):
                        target_idx = 3

                    if target_idx < len(cached_citations):
                        article_id = cached_citations[target_idx].get("id")
                        article = db.query(NewsArticleModel).filter_by(id=article_id).first() if article_id else None
                        if article:
                            bullets = extract_bullet_points(article.content or article.description or article.title, max_points=3)
                            formatted_bullets = "\n".join([f"- **Point {i+1}:** {pt}" for i, pt in enumerate(bullets)])
                            
                            response = (
                                f"### 📰 Detailed Analysis: {article.title}\n\n"
                                f"**Publisher:** `{article.source_name}` &nbsp;|&nbsp; **Category:** `{article.category}`\n\n"
                                f"---\n\n"
                                f"#### 🔍 Key Verified Takeaways:\n"
                                f"{formatted_bullets}\n\n"
                                f"---\n\n"
                                f"🔗 **Original Publisher Link:** [{article.source_name}]({article.source_url})"
                            )
                            follow_ups = [
                                "Explain in even simpler terms",
                                f"More news from {article.category}",
                                "Show top headlines"
                            ]
                            return response, [article], follow_ups
                except Exception as e:
                    print(f"[ZeroTokenEngine] Follow-up parsing error: {e}")

        # 4. News Search & Retrieval
        query = db.query(NewsArticleModel)
        if category:
            query = query.filter(NewsArticleModel.category == category)
            
        all_candidates = query.order_by(NewsArticleModel.published_at.desc()).limit(50).all()
        if not all_candidates:
            all_candidates = db.query(NewsArticleModel).order_by(NewsArticleModel.published_at.desc()).limit(30).all()

        if tokens:
            scored = [(art, score_article(art, tokens, category)) for art in all_candidates]
            scored.sort(key=lambda x: x[1], reverse=True)
            relevant_articles = [art for art, sc in scored if sc > 0][:3]
            if not relevant_articles:
                relevant_articles = all_candidates[:3]
        else:
            relevant_articles = all_candidates[:3]

        if not relevant_articles:
            return (
                "Abhi is topic par koi live article database me available nahi hai. Kripya doosra topic search karein.",
                [],
                ["Top headlines today", "Technology news", "Business news"]
            )

        cat_label = f" ({category})" if category else ""
        intro = f"### 📰 Verified Live Headlines{cat_label}\n\n"

        body_blocks = []
        for i, art in enumerate(relevant_articles, 1):
            source = art.source_name or "Official Source"
            cat = art.category or "General"
            snip = (art.description or art.title).strip()
            if len(snip) > 170:
                snip = snip[:167] + "..."

            block = (
                f"#### {i}. {art.title}\n\n"
                f"{snip}\n\n"
                f"• **Source:** `{source}` &nbsp;|&nbsp; **Category:** `{cat}`\n\n"
                f"🔗 [Read Full Coverage]({art.source_url})"
            )
            body_blocks.append(block)

        response_text = intro + "\n\n---\n\n".join(body_blocks)

        first_cat = relevant_articles[0].category if relevant_articles else "India"
        follow_ups = [
            "Explain story #1 in detail",
            "Give 3 key points on story #2",
            f"More updates from {first_cat}"
        ]

        return response_text, relevant_articles, follow_ups

zero_token_engine = ZeroTokenEngine()
