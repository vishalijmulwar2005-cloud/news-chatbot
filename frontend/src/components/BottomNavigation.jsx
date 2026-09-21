import React from 'react';
import { Home, Compass, Bookmark, User, Sparkles } from 'lucide-react';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'chat', label: 'News AI', isCenter: true },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        height: 'var(--nav-height)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        padding: '0 12px',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.04)'
      }}
      aria-label="Bottom Navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (tab.isCenter) {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab('chat')}
              className="btn-pressable"
              aria-label="Open AI Assistant"
              style={{
                position: 'relative',
                top: '-18px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--gradient-ai)',
                border: '4px solid var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.5)',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={24} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
            </button>
          );
        }

        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn-pressable"
            aria-label={tab.label}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? '#6366F1' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.2px'
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
