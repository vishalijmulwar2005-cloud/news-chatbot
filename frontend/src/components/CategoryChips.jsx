import React from 'react';

export default function CategoryChips({ categories, selectedCategory, onSelectCategory }) {
  const allOption = { id: 'all', name: 'All News', slug: 'all', icon: '✨' };
  const items = [allOption, ...(categories || [])];

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '6px 0 14px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {items.map((cat) => {
        const isSelected = (selectedCategory || 'all').toLowerCase() === cat.slug.toLowerCase();

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className="btn-pressable"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: isSelected ? 700 : 500,
              whiteSpace: 'nowrap',
              border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
              background: isSelected ? 'var(--gradient-ai)' : 'var(--bg-card)',
              color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
              boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'var(--shadow-sm)',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
