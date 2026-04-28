import { useParams } from 'react-router-dom';
import DebriefFlowController from '../components/DebriefFlowController';
import styles from '../styles/Shared.module.css';

function DebriefPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section className={styles.card}>
        <h1 className={styles.sectionTitle}>Session Debrief</h1>
        <p className={styles.smallText}>
          Walk through the trade replay, emotional tagging, plan adherence rating, AI coaching, and final takeaway.
        </p>
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
