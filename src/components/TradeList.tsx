import { memo } from 'react';
import type { Trade } from '../types';
import { formatCurrency } from '../utils/format';
import styles from '../styles/Shared.module.css';

type TradeListProps = {
  trades: Trade[];
};

function TradeList({ trades }: TradeListProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.sectionTitle}>Trade Replay</h2>
      <ul className={styles.listReset}>
        {trades.map((trade) => (
          <li key={trade.tradeId} style={{ padding: '16px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{trade.asset} • {trade.direction.toUpperCase()}</p>
                <p className={styles.smallText} style={{ margin: '6px 0 0' }}>{new Date(trade.entryAt).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{trade.pnl ? formatCurrency(trade.pnl) : 'Open'}</p>
                <p className={styles.smallText} style={{ margin: '6px 0 0' }}>
                  Entry {formatCurrency(trade.entryPrice)} {trade.exitPrice && `• Exit ${formatCurrency(trade.exitPrice)}`}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(TradeList);
