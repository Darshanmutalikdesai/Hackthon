import { useEffect, useMemo, useRef } from 'react';
import { useSSE } from '../hooks/useSSE';
import { getCoachingUrl } from '../services/api';
import styles from '../styles/Shared.module.css';

type CoachingStreamProps = {
  sessionId: string;
};

function CoachingStream({ sessionId }: CoachingStreamProps) {
  const url = getCoachingUrl(sessionId);
  const { status, error, events, retry } = useSSE(url);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [events]);

  const message = useMemo(() => {
    if (status === 'connecting') return 'Connecting to AI coaching...';
    if (status === 'reconnecting') return 'Reconnecting...';
    if (status === 'error') return error || 'Stream failed.';
    return 'Live coaching messages will appear here.';
  }, [status, error]);

  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>AI Coaching</h2>
      <div
        ref={contentRef}
        style={{
          minHeight: 180,
          maxHeight: 280,
          overflowY: 'auto',
          padding: 16,
          background: 'rgba(148, 163, 184, 0.04)',
          borderRadius: 16,
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        {events.length === 0 ? (
          <p className={styles.smallText} style={{ margin: 0 }}>{message}</p>
        ) : (
          events.map((chunk, index) => (
            <p key={`${chunk}-${index}`} style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>
              {chunk}
            </p>
          ))
        )}
      </div>

      <div className={styles.buttonGroup} style={{ marginTop: 16 }}>
        <button type="button" className={styles.actionButton} onClick={retry}>
          Retry stream
        </button>
        <span className={styles.smallText} style={{ alignSelf: 'center' }}>
          Status: {status}
        </span>
      </div>
    </div>
  );
}

export default CoachingStream;
