import React, { useState, useEffect } from 'react';
import BottomNavigation from './components/BottomNavigation';
import ArticleModal from './components/ArticleModal';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ChatPage from './pages/ChatPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';
import { fetchNews, fetchCategories, fetchBookmarks, toggleBookmark } from './services/api';

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('news_ai_onboarded') === 'true';
  });

  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('news_ai_theme') || 'light';
  });

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);

  const [chatInitialQuery, setChatInitialQuery] = useState('');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('news_ai_theme', theme);
  }, [theme]);

  // Initial data loading
  useEffect(() => {
    loadCategories();
    loadNews(selectedCategory);
    loadBookmarks();
  }, []);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const loadNews = async (cat = 'all') => {
    setRefreshing(true);
    const data = await fetchNews({ category: cat, limit: 25 });
    setArticles(data.articles || []);
    setRefreshing(false);
  };

  const loadBookmarks = async () => {
    const data = await fetchBookmarks();
    const ids = new Set(data.map((b) => b.article_id));
    setBookmarkedIds(ids);
    setBookmarkedArticles(data.map((b) => b.article));
  };

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    loadNews(slug);
  };

  const handleToggleBookmark = async (articleId) => {
    const isCurrently = bookmarkedIds.has(articleId);
    const updated = new Set(bookmarkedIds);
    if (isCurrently) {
      updated.delete(articleId);
      setBookmarkedArticles((prev) => prev.filter((a) => a.id !== articleId));
    } else {
      updated.add(articleId);
      const art = articles.find((a) => a.id === articleId) || selectedArticle;
      if (art) setBookmarkedArticles((prev) => [art, ...prev]);
    }
    setBookmarkedIds(updated);
    await toggleBookmark(articleId, isCurrently);
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('news_ai_onboarded', 'true');
    setHasOnboarded(true);
    setActiveTab('home');
  };

  const handleOpenChatWithQuery = (query) => {
    setChatInitialQuery(query);
    setActiveTab('chat');
  };

  const handleAskAIAboutArticle = (article) => {
    setSelectedArticle(null);
    handleOpenChatWithQuery(`Summarize this article and explain its key points: "${article.title}"`);
  };

  if (!hasOnboarded) {
    return <OnboardingPage onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="app-viewport">
      {/* Active Tab Screen */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomePage
            articles={articles}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onSelectArticle={setSelectedArticle}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenChatWithQuery={handleOpenChatWithQuery}
            onRefreshNews={() => loadNews(selectedCategory)}
            refreshing={refreshing}
          />
        )}

        {activeTab === 'explore' && (
          <ExplorePage
            categories={categories}
            onSelectArticle={setSelectedArticle}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onAskAI={(art) => handleAskAIAboutArticle(art)}
          />
        )}

        {activeTab === 'chat' && (
          <ChatPage
            initialQuery={chatInitialQuery}
            onSelectArticle={setSelectedArticle}
            onBack={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'saved' && (
          <SavedPage
            bookmarkedArticles={bookmarkedArticles}
            onSelectArticle={setSelectedArticle}
            onToggleBookmark={handleToggleBookmark}
            onNavigateExplore={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage theme={theme} setTheme={setTheme} />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Detailed Article Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          isBookmarked={bookmarkedIds.has(selectedArticle.id)}
          onToggleBookmark={handleToggleBookmark}
          onAskAI={handleAskAIAboutArticle}
        />
      )}
    </div>
  );
}
