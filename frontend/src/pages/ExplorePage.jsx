import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, AlertCircle } from 'lucide-react';
import CategoryChips from '../components/CategoryChips';
import NewsCard from '../components/NewsCard';
import { searchNews } from '../services/api';

const TRENDING_TOPICS = [
  'Artificial Intelligence', 'Semiconductors', 'Space Exploration',
  'Cricket', 'Electric Vehicles', 'Markets', 'Climate Accords', 'Startups'
];

export default function ExplorePage({
  categories,
  onSelectArticle,
  bookmarkedIds,
  onToggleBookmark,
  onAskAI
}) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = (searchTerm, cat = selectedCategory) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    searchNews(searchTerm, cat)
      .then((data) => {
        setResults(data.articles || []);
        setLoading(false);
      })
      .catch(() => {
        setResults([]);
        setLoading(false);
      });
  };

  const handleTopicClick = (topic) => {
    setQuery(topic);
    performSearch(topic, selectedCategory);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (query.trim()) {
      performSearch(query, cat);
    }
  };

  return (
    <div style={{ padding: '18px 16px 20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Explore & Search
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Discover verified reporting across global publishers
        </p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length > 2) {
              performSearch(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') performSearch(query);
          }}
          placeholder="Search by topic, keyword, or publisher..."
          style={{
            width: '100%',
            height: '46px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            padding: '0 44px 0 46px',
            fontSize: '14px',
            outline: 'none',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setHasSearched(false);
            }}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div>
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />
      </div>

      {/* Trending Search Topics */}
      {!hasSearched && (
        <div style={{ marginTop: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '10px' }}>
            Trending Search Topics
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TRENDING_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleTopicClick(topic)}
                className="btn-pressable"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      {hasSearched && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Search Results ({results.length})
          </h2>
          {results.length > 0 && (
            <button
              onClick={() => onAskAI && onAskAI({ title: query, description: `News search query for ${query}` })}
              className="btn-pressable"
              style={{
                background: 'var(--gradient-tag)',
                border: 'none',
                color: '#6366F1',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={12} />
              <span>Ask AI About "{query}"</span>
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-shimmer" style={{ height: '90px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      )}

      {/* Results List */}
      {!loading && hasSearched && results.length > 0 && (
        <div>
          {results.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              variant="compact"
              onSelect={onSelectArticle}
              isBookmarked={bookmarkedIds.has(article.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && hasSearched && results.length === 0 && (
        <div
          className="glass-surface"
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={32} color="#94A3B8" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            No matching news found
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
            Try searching for broader keywords or pick one of the trending topics above.
          </p>
        </div>
      )}
    </div>
  );
}
