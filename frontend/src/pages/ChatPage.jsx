import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trash2, ArrowLeft, Bot } from 'lucide-react';
import AIOrb from '../components/AIOrb';
import ChatBubble from '../components/ChatBubble';
import ChatComposer from '../components/ChatComposer';
import { sendChatMessage } from '../services/api';

const DEFAULT_WELCOME = {
  id: 1,
  role: 'assistant',
  content: `Hello! I am your **News AI Assistant**. I can help you stay informed without needing paid API tokens.\n\n• **Instant 3-point summaries** of any breaking news story\n• **Topic exploration** across India, World, Tech, Business, Sports\n• **Source citations** linking to original publishers\n\nWhat would you like to know today?`,
  citations: [],
  suggested_questions: [
    'What are the latest technology headlines?',
    'Show me top news from India',
    'Summarize today\'s business developments'
  ]
};

export default function ChatPage({
  initialQuery = '',
  onClearInitialQuery,
  onSelectArticle,
  onBack
}) {
  const [messages, setMessages] = useState([DEFAULT_WELCOME]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle passed initial query if user came from "Ask AI about this"
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendChatMessage({
        sessionId,
        message: text
      });

      if (response && response.message) {
        setMessages((prev) => [...prev, response.message]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, I encountered an issue retrieving the live news for this request. Please try again.',
          citations: [],
          suggested_questions: ['Top news right now', 'Latest technology news']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([DEFAULT_WELCOME]);
    setSessionId(`session_${Date.now()}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--nav-height))',
        background: 'var(--bg-primary)',
        position: 'relative'
      }}
    >
      {/* Header Bar */}
      <div
        className="glass-surface"
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onBack && (
            <button
              onClick={onBack}
              className="btn-pressable"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <AIOrb size="sm" />
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              News AI
            </h2>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              Live • Zero-Token Mode
            </span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="btn-pressable"
          title="Reset conversation"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px'
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Message Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((msg, idx) => (
          <ChatBubble
            key={msg.id || idx}
            message={msg}
            onSelectArticle={onSelectArticle}
            onSelectSuggestion={handleSendMessage}
          />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            <AIOrb size="sm" />
            <div
              className="glass-surface"
              style={{
                padding: '10px 16px',
                borderRadius: '16px',
                borderTopLeftRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366F1', animation: 'orb-pulse 1s infinite alternate' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'orb-pulse 1s infinite alternate 0.2s' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EC4899', animation: 'orb-pulse 1s infinite alternate 0.4s' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>Consulting live news...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input Bar */}
      <ChatComposer onSend={handleSendMessage} loading={loading} />
    </div>
  );
}
