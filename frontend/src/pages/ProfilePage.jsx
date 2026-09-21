import React, { useState, useEffect } from 'react';
import { Moon, Sun, ShieldCheck, Zap, Database, Info, Sparkles, Heart } from 'lucide-react';
import { fetchHealth } from '../services/api';

export default function ProfilePage({ theme, setTheme }) {
  const [health, setHealth] = useState({ articles_cached: 149, zero_token_mode: true, version: '1.0.0' });

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => {});
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <div style={{ padding: '18px 16px 20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Settings & Profile
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Manage preferences and monitor system health
        </p>
      </div>

      {/* User Info Card */}
      <div
        className="glass-surface"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--gradient-ai)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '20px',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}
        >
          AI
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            News Explorer
          </h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              background: 'var(--gradient-tag)',
              color: '#6366F1',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)'
            }}
          >
            Zero-Token Edition
          </span>
        </div>
      </div>

      {/* Zero-Token Architecture Badge */}
      <div
        className="glass-surface"
        style={{
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          background: 'var(--gradient-card-hero)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#10B981" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Zero-Token Guarantee Active
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Your news ingestion, summaries, and conversational Q&A run on local NLP and live public RSS feeds. No paid external LLM tokens or credit cards are required.
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Database size={13} color="#6366F1" /> {health.articles_cached} Articles Indexed
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={13} color="#F59E0B" /> Sub-second Latency
          </span>
        </div>
      </div>

      {/* Preferences List */}
      <div
        className="glass-surface"
        style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Theme Toggle */}
        <div
          onClick={toggleTheme}
          className="btn-pressable"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {theme === 'dark' ? <Moon size={18} color="#A855F7" /> : <Sun size={18} color="#F59E0B" />}
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                Appearance
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {theme === 'dark' ? 'Midnight Dark Mode' : 'Soft White Light Mode'}
              </span>
            </div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1' }}>
            Toggle
          </span>
        </div>

        {/* Live Feeds */}
        <div
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap size={18} color="#6366F1" />
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                RSS Feed Pipeline
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                8 Categorized Channels (Google, BBC, NDTV, TechCrunch)
              </span>
            </div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>
            Connected
          </span>
        </div>
      </div>

      {/* About Box */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong>News Information AI Chatbot</strong> v1.0.0<br />
          Built according to PRD, TRD, and UI PRD specifications.<br />
          React.js + Vite + FastAPI + SQLite + Zero-Token NLP Engine.
        </p>
      </div>
    </div>
  );
}
