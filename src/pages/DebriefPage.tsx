import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DebriefFlowController from '../components/DebriefFlowController';
import styles from '../styles/Shared.module.css';

function DebriefPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionInput, setSessionInput] = useState(sessionId || '');

  useEffect(() => {
    setSessionInput(sessionId || '');
  }, [sessionId]);

  const handleLoadSession = () => {
    const trimmed = sessionInput.trim();
    if (!trimmed) return;
    navigate(`/debrief/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section className={styles.card}>
        <h1 className={styles.sectionTitle}>Session Debrief</h1>
        <p className={styles.smallText}>
          Walk through the trade replay, emotional tagging, plan adherence rating, AI coaching, and final takeaway.
        </p>
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          <label htmlFor="session-id-input" className={styles.smallText} style={{ fontWeight: 600 }}>
            Session ID
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              id="session-id-input"
              value={sessionInput}
              onChange={(event) => setSessionInput(event.target.value)}
              placeholder="Paste a session ID to load its stats"
              aria-label="Session ID"
              style={{
                flex: '1 1 320px',
                minWidth: 0,
                borderRadius: 14,
                border: '1px solid rgba(148, 163, 184, 0.18)',
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.92)',
                color: '#f8fafc',
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleLoadSession();
                }
              }}
            />
            <button type="button" className={styles.actionButton} onClick={handleLoadSession}>
              Load Session
            </button>
          </div>
          <p className={styles.smallText} style={{ margin: 0 }}>
            Enter any valid session ID to open the full statistics and debrief flow for that session.
          </p>
        </div>
      </section>
      {sessionId ? <DebriefFlowController sessionId={sessionId} /> : (
        <div className={styles.card}>
          <p className={styles.smallText}>No session ID provided. Return to the dashboard and select a session.</p>
        </div>
      )}
    </div>
  );
}

export default DebriefPage;
