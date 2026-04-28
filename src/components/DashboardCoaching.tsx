import { useEffect, useRef, useState } from 'react';
import { useSSE } from '../hooks/useSSE';
import { getCoachingUrl } from '../services/api';
import styles from '../styles/Shared.module.css';

type DashboardCoachingProps = {
  sessionId: string;
};

const MOCK_COACHING_MESSAGE = `You showed strong discipline today in your trading session. Your plan adherence was solid at 80%, which demonstrates your ability to stick to your strategy even when emotions run high. 

Remember to focus on quality entries over quantity. The setup you took around 2:15 PM was textbook perfect - great risk-to-reward ratio. Keep building on that pattern recognition.

One area to improve: When you felt uncertain after the third trade, you took an impulsive short position that broke your plan. In the future, when doubt creeps in, take a step back rather than forcing another trade. Confidence should guide your decisions, not desperation.

Your overall mood during this session was neutral leaning anxious. This is good self-awareness. Consider using that energy to fuel more deliberate decision-making rather than reactive trading.`;

function DashboardCoaching({ sessionId }: DashboardCoachingProps) {
  const url = getCoachingUrl(sessionId);
  const { status, error, events, retry } = useSSE(url);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState('');
  const [useMockData, setUseMockData] = useState(false);

  // Reconstruct message from streaming tokens
  useEffect(() => {
    let fullMessage = '';
    for (const event of events) {
      try {
        const data = JSON.parse(event);
        if (data.token) {
          fullMessage += data.token;
        }
      } catch {
        // Parse error, skip
      }
    }
    setMessage(fullMessage);
  }, [events]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [message]);

  // Use mock data on auth failure
  useEffect(() => {
    if (status === 'error' && error?.includes('Authentication')) {
      setUseMockData(true);
    }
  }, [status, error]);

  const statusIndicator = {
    connecting: { color: '#fbbf24', text: '⏳ Connecting...' },
    open: { color: '#10b981', text: '🟢 Live' },
    reconnecting: { color: '#f87171', text: '🔄 Reconnecting...' },
    error: { color: '#ef4444', text: '❌ Limited' },
  };

  const current = statusIndicator[status];
  const displayMessage = useMockData ? MOCK_COACHING_MESSAGE : message;

  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
          💡 AI Coaching
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: current.color,
              animation: status === 'connecting' ? 'pulse 1.5s infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '0.85rem', color: current.color }}>{current.text}</span>
        </div>
      </div>

      <div
        ref={contentRef}
        style={{
          minHeight: 120,
          maxHeight: 240,
          overflowY: 'auto',
          padding: 16,
          background: 'rgba(148, 163, 184, 0.04)',
          borderRadius: 16,
          border: '1px solid rgba(148, 163, 184, 0.1)',
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        {displayMessage.length === 0 && status === 'connecting' ? (
          <p className={styles.smallText} style={{ margin: 0, color: '#94a3b8' }}>
            Connecting to AI coaching...
          </p>
        ) : displayMessage.length === 0 && status === 'error' && !useMockData ? (
          <p className={styles.smallText} style={{ margin: 0, color: '#ef4444' }}>
            {error || 'Failed to load coaching message'}
          </p>
        ) : (
          <p style={{ margin: 0, color: '#f8fafc', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {displayMessage}
            {status === 'open' && displayMessage.length > 0 && !useMockData && <span style={{ animation: 'blink 1s infinite' }}>▌</span>}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => {
            setUseMockData(false);
            retry();
          }}
          style={{
            border: '1px solid rgba(148, 163, 184, 0.24)',
            background: 'rgba(148, 163, 184, 0.06)',
            color: '#e2e8f0',
            padding: '8px 12px',
            borderRadius: 12,
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.24)';
          }}
        >
          🔄 Retry
        </button>
        <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>
          {useMockData ? '📋 Sample coaching' : displayMessage.length > 0 && `${displayMessage.length} characters`}
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default DashboardCoaching;
