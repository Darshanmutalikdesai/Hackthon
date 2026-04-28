import { Link } from 'react-router-dom';
import styles from '../styles/Shared.module.css';

function NotFoundPage() {
  return (
    <div className={styles.card} style={{ textAlign: 'center' }}>
      <h1 className={styles.sectionTitle}>Page not found</h1>
      <p className={styles.smallText}>The route you requested does not exist.</p>
      <Link to="/" className={styles.actionButton} style={{ display: 'inline-block', marginTop: 18 }}>
        Return to dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
