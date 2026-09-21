import React, { useState } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

export default function ChatComposer({ onSend, loading, disabled }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || loading || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Voice speech recognition failed to start:', e);
      setListening(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-glass)',
        position: 'relative'
      }}
    >
      <button
        type="button"
        onClick={toggleVoice}
        className="btn-pressable"
        aria-label="Voice input"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: 'none',
          background: listening ? '#EF4444' : 'var(--bg-secondary)',
          color: listening ? '#FFFFFF' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        {listening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={listening ? 'Listening to your question...' : 'Ask anything about news...'}
        disabled={loading || disabled}
        style={{
          flex: 1,
          height: '42px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          padding: '0 16px',
          fontSize: '14px',
          outline: 'none',
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-sm)'
        }}
      />

      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="btn-pressable"
        aria-label="Send message"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: 'none',
          background: text.trim() ? 'var(--gradient-ai)' : 'var(--bg-secondary)',
          color: text.trim() ? '#FFFFFF' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: text.trim() ? 'pointer' : 'default',
          flexShrink: 0,
          boxShadow: text.trim() ? '0 4px 14px rgba(99, 102, 241, 0.4)' : 'none'
        }}
      >
        <Send size={18} />
      </button>
    </form>
  );
}
