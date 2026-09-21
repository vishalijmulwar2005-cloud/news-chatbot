import React from 'react';
import { Sparkles, ArrowRight, Bell, Flame, RefreshCw } from 'lucide-react';
import AIOrb from '../components/AIOrb';
import CategoryChips from '../components/CategoryChips';
import NewsCard from '../components/NewsCard';

export default function HomePage({
  articles,
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectArticle,
  bookmarkedIds,
  onToggleBookmark,
  onOpenChatWithQuery,
  onRefreshNews,
  refreshing
}) {
  const trendingArticle = articles && articles.length > 0 ? articles[0] : null;
  const regularArticles = articles && articles.length > 1 ? articles.slice(1) : [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ padding: '18px 16px 20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {getGreeting()} 👋
          </span>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Explore Today's World
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onRefreshNews}
            disabled={refreshing}
            className="btn-pressable"
            title="Refresh Live Feeds"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={17} className={refreshing ? 'rotating' : ''} />
          </button>

          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--gradient-tag)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366F1',
              fontWeight: 700,
              fontSize: '14px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}
          >
            AI
          </div>
        </div>
      </div>

      {/* AI Assistant Hero Card (PRD Core requirement) */}
      <div
        onClick={() => onOpenChatWithQuery('')}
        className="glass-surface btn-pressable"
        style={{
          background: 'var(--gradient-card-hero)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ flex: 1, paddingRight: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} color="#8B5CF6" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Zero-Token Assistant
            </span>
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Ask News AI
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Instant summaries, explanations & live topic inquiry
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AIOrb size="sm" />
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--gradient-ai)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
            }}
          >
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* Categories Scroll */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Categories
          </h2>
          <span style={{ fontSize: '12px', color: '#6366F1', fontWeight: 600 }}>
            {selectedCategory === 'all' ? 'All Channels' : selectedCategory}
          </span>
        </div>
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </div>

      {/* Trending Story */}
      {trendingArticle && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Flame size={16} color="#EC4899" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Top Trending Story
            </h2>
          </div>
          <NewsCard
            article={trendingArticle}
            variant="featured"
            onSelect={onSelectArticle}
            isBookmarked={bookmarkedIds.has(trendingArticle.id)}
            onToggleBookmark={onToggleBookmark}
          />
        </div>
      )}

      {/* Latest News Feed */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Latest Headlines
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {regularArticles.length} stories
          </span>
        </div>

        {regularArticles.length === 0 && !trendingArticle ? (
          <div
            className="glass-surface"
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)'
            }}
          >
            <p style={{ fontSize: '14px' }}>Loading latest live reporting...</p>
          </div>
        ) : (
          regularArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              variant="compact"
              onSelect={onSelectArticle}
              isBookmarked={bookmarkedIds.has(article.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))
        )}
      </div>
    </div>
  );
}
