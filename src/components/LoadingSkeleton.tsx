import styles from '../styles/Shared.module.css';

function LoadingSkeleton() {
  return (
    <div className={styles.card} aria-busy="true" aria-label="Loading">
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ height: 16, width: '70%', background: 'rgba(148, 163, 184, 0.12)', borderRadius: 8 }} />
        <div style={{ height: 90, width: '100%', background: 'rgba(148, 163, 184, 0.08)', borderRadius: 18 }} />
        <div style={{ height: 16, width: '40%', background: 'rgba(148, 163, 184, 0.12)', borderRadius: 8 }} />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
