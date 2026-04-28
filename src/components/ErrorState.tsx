import styles from '../styles/Shared.module.css';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.card} role="alert">
      <p style={{ margin: 0, color: '#fecaca', fontWeight: 600 }}>Something went wrong</p>
      <p style={{ margin: '10px 0 0', color: '#cbd5e1' }}>{message}</p>
      <button className={styles.actionButton} onClick={onRetry} style={{ marginTop: 16 }}>
        Retry
      </button>
    </div>
  );
}

export default ErrorState;
