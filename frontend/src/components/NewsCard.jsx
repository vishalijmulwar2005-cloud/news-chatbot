import React from 'react';
import { Bookmark, ExternalLink, Sparkles, Clock } from 'lucide-react';

export default function NewsCard({
  article,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
  variant = 'compact'
}) {
  const timeAgo = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      const seconds = Math.floor((new Date() - date) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recent';
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(article.id);
    }
  };

  if (variant === 'featured') {
    return (
      <div
        onClick={() => onSelect(article)}
        className="glass-surface btn-pressable"
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
          <img
            src={article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}
          >
            {article.category}
          </div>
          <button
            onClick={handleBookmarkClick}
            aria-label="Save story"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <Bookmark
              size={18}
              color={isBookmarked ? '#6366F1' : '#64748B'}
              fill={isBookmarked ? '#6366F1' : 'none'}
            />
          </button>
        </div>

        <div style={{ padding: '14px 16px' }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              lineHeight: 1.35,
              color: 'var(--text-primary)',
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {article.title}
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              {article.source_name}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {timeAgo(article.published_at)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Compact default card (Mobile list standard)
  return (
    <div
      onClick={() => onSelect(article)}
      className="glass-surface btn-pressable"
      style={{
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        marginBottom: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      <div
        style={{
          width: '78px',
          height: '78px',
          borderRadius: '12px',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'var(--bg-secondary)'
        }}
      >
        <img
          src={article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-tag)',
              color: '#6366F1',
              textTransform: 'uppercase',
              letterSpacing: '0.3px'
            }}
          >
            {article.category}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {timeAgo(article.published_at)}
          </span>
        </div>

        <h4
          style={{
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: 1.35,
            color: 'var(--text-primary)',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {article.title}
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {article.source_name}
          </span>
          <button
            onClick={handleBookmarkClick}
            aria-label="Save story"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: isBookmarked ? '#6366F1' : 'var(--text-muted)'
            }}
          >
            <Bookmark size={15} fill={isBookmarked ? '#6366F1' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}
