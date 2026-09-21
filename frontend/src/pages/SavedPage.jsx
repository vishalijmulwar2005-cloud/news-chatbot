import React from 'react';
import { Bookmark, Compass } from 'lucide-react';
import NewsCard from '../components/NewsCard';

export default function SavedPage({
  bookmarkedArticles,
  onSelectArticle,
  onToggleBookmark,
  onNavigateExplore
}) {
  return (
    <div style={{ padding: '18px 16px 20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Saved Stories
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Your bookmarked articles for offline reading & reference
          </p>
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            background: 'var(--gradient-tag)',
            color: '#6366F1',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)'
          }}
        >
          {bookmarkedArticles.length} Saved
        </span>
      </div>

      {bookmarkedArticles.length === 0 ? (
        <div
          className="glass-surface"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--gradient-tag)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366F1'
            }}
          >
            <Bookmark size={28} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            No saved articles yet
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.5 }}>
            Bookmark stories you find while exploring or chatting to save them here for quick access.
          </p>
          <button
            onClick={onNavigateExplore}
            className="btn-pressable"
            style={{
              marginTop: '8px',
              background: 'var(--gradient-ai)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '10px 22px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              cursor: 'pointer'
            }}
          >
            <Compass size={16} />
            <span>Discover News</span>
          </button>
        </div>
      ) : (
        <div>
          {bookmarkedArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              variant="compact"
              onSelect={onSelectArticle}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
