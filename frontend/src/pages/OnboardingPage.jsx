import React from 'react';
import { ArrowRight, Newspaper, Globe, Sparkles, ShieldCheck } from 'lucide-react';
import AIOrb from '../components/AIOrb';

export default function OnboardingPage({ onComplete }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 24px',
        background: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.12), transparent 70%), var(--bg-primary)',
        position: 'relative'
      }}
    >
      {/* Top Brand Tag */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'var(--gradient-tag)',
            color: '#6366F1',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}
        >
          ⚡ Zero-Token AI Intelligence
        </span>
      </div>

      {/* Hero Visual Area with Glowing AI Orb */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '40px 0', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <AIOrb size="xl" />

          {/* Floating badge icons as specified in UI PRD */}
          <div
            className="floating-element glass-surface"
            style={{
              position: 'absolute',
              top: '-10px',
              left: '-24px',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366F1',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Newspaper size={20} />
          </div>

          <div
            className="floating-element glass-surface"
            style={{
              position: 'absolute',
              bottom: '0px',
              right: '-24px',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EC4899',
              boxShadow: 'var(--shadow-md)',
              animationDelay: '1.5s'
            }}
          >
            <Sparkles size={20} />
          </div>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.3,
            color: 'var(--text-primary)',
            marginTop: '36px',
            maxWidth: '340px'
          }}
        >
          Your <span className="text-gradient">News</span> AI <span className="text-gradient">Assistant</span> for a Smarter Tomorrow
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginTop: '14px',
            lineHeight: 1.55,
            maxWidth: '320px'
          }}
        >
          Live multi-source headlines, instant 3-point AI summaries, and conversational exploration without token fees.
        </p>
      </div>

      {/* Feature Pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Globe size={14} color="#6366F1" />
          <span>Live RSS Feeds</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>100% Free & Fast</span>
        </div>
      </div>

      {/* Primary CTA */}
      <button
        onClick={onComplete}
        className="btn-pressable"
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--gradient-ai)',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 8px 26px rgba(99, 102, 241, 0.45)',
          cursor: 'pointer'
        }}
      >
        <span>Get Started</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
