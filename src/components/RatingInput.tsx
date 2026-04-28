import { memo } from 'react';
import styles from '../styles/Shared.module.css';

type RatingInputProps = {
  value: number;
  onChange: (value: number) => void;
};

function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Plan Adherence</h2>
      <p className={styles.smallText}>Select how closely you stayed with your trading plan.</p>
      <div className={styles.buttonGroup} role="radiogroup" aria-label="Plan adherence rating">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            type="button"
            key={rating}
            className={styles.actionButton}
            aria-pressed={value === rating}
            onClick={() => onChange(rating)}
            style={{
              background: value === rating ? 'rgba(16, 185, 129, 0.18)' : undefined,
              borderColor: value === rating ? 'rgba(16, 185, 129, 0.8)' : undefined,
            }}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(RatingInput);
