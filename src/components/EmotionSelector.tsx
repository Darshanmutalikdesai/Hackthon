import { memo } from 'react';
import type { EmotionTag, Trade } from '../types';
import styles from '../styles/Shared.module.css';

const options: Array<{ label: string; value: EmotionTag }> = [
  { label: 'Calm', value: 'calm' },
  { label: 'Anxious', value: 'anxious' },
  { label: 'Greedy', value: 'greedy' },
  { label: 'Fearful', value: 'fearful' },
  { label: 'Neutral', value: 'neutral' },
];

type EmotionSelectorProps = {
  trades: Trade[];
  selections: Record<string, EmotionTag>;
  onChange: (tradeId: string, emotion: EmotionTag) => void;
};

function EmotionSelector({ trades, selections, onChange }: EmotionSelectorProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Emotional Tagging</h2>
      <div style={{ display: 'grid', gap: 18 }}>
        {trades.map((trade) => (
          <div key={trade.tradeId} style={{ display: 'grid', gap: 8 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{trade.asset} • {trade.direction.toUpperCase()}</p>
            <div className={styles.buttonGroup} role="group" aria-label={`Emotion selection for trade ${trade.asset}`}>
              {options.map((option) => {
                const selected = selections[trade.tradeId] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={styles.actionButton}
                    aria-pressed={selected}
                    onClick={() => onChange(trade.tradeId, option.value)}
                    style={{
                      background: selected ? 'rgba(59, 130, 246, 0.18)' : undefined,
                      borderColor: selected ? 'rgba(59, 130, 246, 0.8)' : undefined,
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(EmotionSelector);
