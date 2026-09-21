import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Bookmark, Share2, Sparkles, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { fetchArticleDetail } from '../services/api';

export default function ArticleModal({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onAskAI
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!article) return;
    let isMounted = true;
    setLoading(true);

    fetchArticleDetail(article.id)
      .then((data) => {
        if (isMounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [article]);

  if (!article) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: article.source_url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(article.source_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const keyPoints = detail?.key_points?.length ? detail.key_points : [
    article.description || article.title,
    `Published by ${article.source_name} under ${article.category}.`,
    "Tap 'Ask AI about this' below to explore more details or related stories."
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-primary)',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Hero Image */}
        <div style={{ position: 'relative', width: '100%', height: '220px', background: 'var(--bg-secondary)' }}>
          <img
            src={article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="btn-pressable"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '16px',
              background: 'var(--gradient-ai)',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}
          >
            {article.category}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 18px 40px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Metadata Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366F1' }}>
              {article.source_name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} />
              {new Date(article.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)' }}>
            {article.title}
          </h2>

          {/* AI 3-Bullet Summary Box */}
          <div
            className="glass-surface"
            style={{
              background: 'var(--gradient-card-hero)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--gradient-ai)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Sparkles size={13} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px', color: 'var(--text-primary)' }}>
                AI KEY TAKEAWAYS (0-TOKEN INTEL)
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton-shimmer" style={{ height: '14px', width: '90%' }} />
                <div className="skeleton-shimmer" style={{ height: '14px', width: '95%' }} />
                <div className="skeleton-shimmer" style={{ height: '14px', width: '80%' }} />
              </div>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {keyPoints.map((pt, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#8B5CF6', fontWeight: 700 }}>•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Action Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={() => onAskAI && onAskAI(article)}
              className="btn-pressable"
              style={{
                background: 'var(--gradient-ai)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(99, 102, 241, 0.35)',
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={16} />
              <span>Ask AI About This</span>
            </button>

            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pressable"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <ExternalLink size={15} />
              <span>Read Original</span>
            </a>
          </div>

          {/* Sub-actions: Bookmark & Share */}
          <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => onToggleBookmark(article.id)}
              className="btn-pressable"
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: isBookmarked ? '#6366F1' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px 12px'
              }}
            >
              <Bookmark size={17} fill={isBookmarked ? '#6366F1' : 'none'} />
              <span>{isBookmarked ? 'Saved' : 'Save Story'}</span>
            </button>

            <button
              onClick={handleShare}
              className="btn-pressable"
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: copied ? '#10B981' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px 12px'
              }}
            >
              {copied ? <CheckCircle2 size={17} /> : <Share2 size={17} />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
