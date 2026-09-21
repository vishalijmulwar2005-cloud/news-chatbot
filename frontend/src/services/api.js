const API_BASE = '/api';

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Categories fetch failed, using defaults', err);
    return [
      { id: 'india', name: 'India', slug: 'India', icon: '🇮🇳', count: 24 },
      { id: 'world', name: 'World', slug: 'World', icon: '🌍', count: 32 },
      { id: 'tech', name: 'Technology', slug: 'Technology', icon: '💻', count: 45 },
      { id: 'business', name: 'Business', slug: 'Business', icon: '📈', count: 28 },
      { id: 'sports', name: 'Sports', slug: 'Sports', icon: '⚽', count: 19 },
      { id: 'science', name: 'Science', slug: 'Science', icon: '🔬', count: 18 },
      { id: 'entertainment', name: 'Entertainment', slug: 'Entertainment', icon: '🎬', count: 15 },
      { id: 'health', name: 'Health', slug: 'Health', icon: '🩺', count: 14 },
    ];
  }
}

export async function fetchNews({ category = '', page = 1, limit = 20 } = {}) {
  try {
    const params = new URLSearchParams({ page, limit });
    if (category && category.toLowerCase() !== 'all') {
      params.append('category', category);
    }
    const res = await fetch(`${API_BASE}/news?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] News fetch error', err);
    return { total: 0, category, articles: [] };
  }
}

export async function fetchArticleDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/news/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Article detail error', err);
    return null;
  }
}

export async function searchNews(query, category = '') {
  try {
    const params = new URLSearchParams({ q: query });
    if (category && category.toLowerCase() !== 'all') {
      params.append('category', category);
    }
    const res = await fetch(`${API_BASE}/search?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Search error', err);
    return { total: 0, category, articles: [] };
  }
}

export async function sendChatMessage({ sessionId, message, category }) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        category: category || null
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[API] Chat error', err);
    throw err;
  }
}

export async function fetchBookmarks() {
  try {
    const res = await fetch(`${API_BASE}/bookmarks`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Bookmarks fetch error', err);
    return [];
  }
}

export async function toggleBookmark(articleId, isCurrentlyBookmarked) {
  try {
    if (isCurrentlyBookmarked) {
      await fetch(`${API_BASE}/bookmarks/${articleId}`, { method: 'DELETE' });
      return false;
    } else {
      await fetch(`${API_BASE}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId })
      });
      return true;
    }
  } catch (err) {
    console.error('[API] Toggle bookmark error', err);
    return isCurrentlyBookmarked;
  }
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', zero_token_mode: true, articles_cached: 0 };
  }
}
