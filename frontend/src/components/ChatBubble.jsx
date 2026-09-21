import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, ExternalLink } from 'lucide-react';
import AIOrb from './AIOrb';

/* ─────────────────────────────────────────────
   Custom markdown component overrides
   Ensures every element matches our design system
   ───────────────────────────────────────────── */
const mdComponents = {
  /* Headings */
  h1: ({ node, ...p }) => (
    <h1 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '12px 0 6px' }} {...p} />
  ),
  h2: ({ node, ...p }) => (
    <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 5px' }} {...p} />
  ),
  h3: ({ node, ...p }) => (
    <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '10px 0 4px' }} {...p} />
  ),

  /* Paragraph */
  p: ({ node, ...p }) => (
    <p style={{ margin: '4px 0 8px', lineHeight: 1.55, color: 'var(--text-secondary)', fontSize: '13.5px' }} {...p} />
  ),

  /* Bold */
  strong: ({ node, ...p }) => (
    <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }} {...p} />
  ),

  /* Horizontal rule — used as section separator */
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '8px 0 12px' }} />
  ),

  /* Blockquote — shown as a subtle left-bordered callout */
  blockquote: ({ node, ...p }) => (
    <blockquote
      style={{
        margin: '6px 0 8px',
        paddingLeft: '12px',
        borderLeft: '3px solid #6366F1',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        fontSize: '13px',
      }}
      {...p}
    />
  ),

  /* Clickable link — opens in new tab, styled in accent color */
  a: ({ node, href, children, ...p }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: '#818CF8',
        fontWeight: 600,
        textDecoration: 'none',
        borderBottom: '1px solid rgba(129,140,248,0.35)',
        paddingBottom: '1px',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.target.style.color = '#A5B4FC')}
      onMouseLeave={e => (e.target.style.color = '#818CF8')}
      {...p}
    >
      {children}
    </a>
  ),

  /* Unordered list */
  ul: ({ node, ...p }) => (
    <ul style={{ margin: '4px 0 8px', paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '13.5px' }} {...p} />
  ),

  /* Ordered list */
  ol: ({ node, ...p }) => (
    <ol style={{ margin: '4px 0 8px', paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '13.5px' }} {...p} />
  ),

  /* List item */
  li: ({ node, ...p }) => (
    <li style={{ marginBottom: '4px', lineHeight: 1.5 }} {...p} />
  ),

  /* Inline code */
  code: ({ node, inline, ...p }) =>
    inline ? (
      <code
        style={{
          background: 'rgba(99,102,241,0.12)',
          color: '#A5B4FC',
          borderRadius: '4px',
          padding: '1px 5px',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}
        {...p}
      />
    ) : (
      <pre
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          padding: '10px 12px',
          overflowX: 'auto',
          fontSize: '12px',
          margin: '6px 0',
        }}
      >
        <code {...p} />
      </pre>
    ),
};

/* ─────────────────────────────────────────────
   ChatBubble — renders user and assistant messages
   ───────────────────────────────────────────── */
export default function ChatBubble({ message, onSelectArticle, onSelectSuggestion }) {
  const isUser = message.role === 'user';

  /* ── User bubble ── */
  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div
          style={{
            maxWidth: '82%',
            background: 'var(--gradient-user-bubble)',
            color: '#FFFFFF',
            padding: '11px 16px',
            borderRadius: '18px',
            borderBottomRightRadius: '4px',
            fontSize: '14px',
            lineHeight: 1.45,
            boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  /* ── Assistant bubble ── */
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        <AIOrb size="sm" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Main bubble */}
        <div
          className="glass-surface"
          style={{
            background: 'var(--bg-card-elevated)',
            borderRadius: '18px',
            borderTopLeftRadius: '4px',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Markdown-rendered content */}
          <div style={{ marginBottom: message.citations?.length ? '14px' : '0' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={mdComponents}
            >
              {message.content || ''}
            </ReactMarkdown>
          </div>

          {/* Referenced articles */}
          {message.citations && message.citations.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#6366F1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={12} /> Referenced Verified Articles:
              </span>

              {message.citations.map((art) => (
                <div
                  key={art.id || art.title}
                  onClick={() => onSelectArticle && onSelectArticle(art)}
                  className="btn-pressable"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={
                      art.image_url ||
                      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=80&q=80'
                    }
                    alt=""
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        margin: 0,
                      }}
                    >
                      {art.title}
                    </h5>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {art.source_name} • {art.category}
                    </span>
                  </div>
                  <ExternalLink size={13} color="#94A3B8" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested follow-up chips */}
        {message.suggested_questions && message.suggested_questions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {message.suggested_questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion && onSelectSuggestion(q)}
                className="btn-pressable"
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6366F1',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {q} →
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
