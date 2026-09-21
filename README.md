# 🌐 News AI Chatbot

A modern, full-stack **News Information AI Aggregator & Conversational Chatbot** built with a **FastAPI** backend, **SQLite** database, and a glassmorphic **React + Vite** frontend.

Features a **Zero-Token Local NLP Engine** that operates completely free without requiring third-party LLM API quotas, with optional **Google Gemini (RAG)** and **NewsData.io** integration.

---

## ✨ Features

- **📰 Live Multi-Source News Ingestion**: Automatically fetches, cleans, deduplicates, and caches breaking stories from major publishers across 8 categories (*India, World, Technology, Business, Sports, Science, Entertainment, Health*).
- **🧠 Zero-Token NLP Engine**: Instant 3-point key takeaways, sentence extraction, category routing, and ordinal follow-up analysis (*"Explain the 2nd story"*) without needing paid API keys.
- **⚡ Hybrid Architecture**: Works 100% offline/zero-token out-of-the-box, with seamless upgrade paths for Google Gemini 1.5 Flash (RAG) and NewsData.io.
- **🎨 Glassmorphic Mobile-First UI**: Dark mode UI with fluid micro-animations, bottom navigation bar, categorized chips, article modal with full publisher links, and bookmark management.
- **🔍 Full-Text Search & Bookmarks**: Fast search by keywords, category filtering, and local bookmark persistence.

---

## 🏗️ Architecture

```
[News Sources]
  ├── Live RSS Feeds (BBC, Reuters, NDTV, TechCrunch, CNBC...)
  └── NewsData.io API (Optional)
         │
         ▼
[FastAPI Backend] (Port 8000)
  ├── News Ingestion & Deduplication
  ├── SQLite Database (SQLAlchemy)
  ├── Zero-Token Local NLP Engine
  └── Optional Gemini 1.5 Flash (RAG Grounding)
         │
         ▼
[React + Vite Frontend] (Port 5173)
  ├── Glassmorphic Dark UI & Bottom Navigation
  ├── Live News Feed & Category Filtering
  ├── AI Chat with React-Markdown Formatting
  └── Bookmarks & Settings Management
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### Quick Start (Windows)
Double-click `start_app.bat` to automatically launch both the backend and frontend servers simultaneously:
```cmd
start_app.bat
```

---

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Activate venv:
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Backend will start at `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will start at `http://localhost:5173`.

---

## ⚙️ Configuration (.env)

Copy `backend/.env.example` to `backend/.env` to configure optional features:

```env
# Optional: Google Gemini API key for enhanced RAG answers
GEMINI_API_KEY=

# Optional: NewsData.io API key for additional live feeds
NEWSDATA_API_KEY=

# Database & Cache settings
DATABASE_URL=sqlite:///./news_chatbot.db
NEWS_CACHE_TTL_SECONDS=900
```

---

## 🛡️ License
MIT License. Free to use, modify, and distribute.
