import { useMemo, useRef, useState } from 'react';
import Tooltip from './Tooltip';
import styles from '../styles/Heatmap.module.css';
import type { SessionScore } from '../types';

type HeatmapProps = {
  scores: SessionScore[];
  onDayClick: (sessionId: string) => void;
};

const columns = 18;
const rows = 5;
const cellSize = 18;
const cellGap = 6;

function Heatmap({ scores, onDayClick }: HeatmapProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<{ x: number; y: number; content: SessionScore } | null>(null);

  const cells = useMemo(() => {
    const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
    const missing = Math.max(0, columns * rows - sorted.length);
    return [...sorted, ...Array.from({ length: missing }, (_, index) => ({
      date: '',
      score: 0,
      sessionId: `empty-${index}`,
      sessionName: 'No session',
      summary: 'No data',
    }))];
  }, [scores]);

  const palette = (value: number) => {
    if (value === 0) return '#1e293b';
    if (value < 0.3) return '#334155';
    if (value < 0.6) return '#2563eb';
    if (value < 0.85) return '#0ea5e9';
    return '#22c55e';
  };

  return (
    <div className={styles.heatmapShell} ref={wrapperRef}>
      <h2 className={styles.sectionTitle}>90-Day Heatmap</h2>
      <div className={styles.heatmapViewport}>
        <div className={styles.heatmapGrid}>
        <svg width={(cellSize + cellGap) * columns} height={(cellSize + cellGap) * rows}>
          {cells.map((item, index) => {
            const x = (index % columns) * (cellSize + cellGap);
            const y = Math.floor(index / columns) * (cellSize + cellGap);
            const color = palette(item.score);
            const isEmpty = item.date === '';

            return (
              <g key={item.sessionId}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={6}
                  ry={6}
                  fill={isEmpty ? '#0f172a' : color}
                  opacity={isEmpty ? 0.65 : 1}
                  role="button"
                  tabIndex={isEmpty ? -1 : 0}
                  aria-label={isEmpty ? 'Empty date' : `Session ${item.sessionName} score ${Math.round(item.score * 100)}`}
                  onClick={() => !isEmpty && onDayClick(item.sessionId)}
                  onKeyDown={(event) => {
                    if ((event.key === 'Enter' || event.key === ' ') && !isEmpty) {
                      event.preventDefault();
                      onDayClick(item.sessionId);
                    }
                  }}
                  onMouseEnter={(event) => {
                    if (isEmpty) return;
                    const bounds = wrapperRef.current?.getBoundingClientRect();
                    setHovered({
                      x: bounds ? event.clientX - bounds.left : x,
                      y: bounds ? event.clientY - bounds.top : y,
                      content: item,
                    });
                  }}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            );
          })}
        </svg>
        {hovered && hovered.content && (
          <Tooltip
            visible
            x={hovered.x + cellSize / 2}
            y={hovered.y}
            title={hovered.content.sessionName || 'Session'}
            description={`${hovered.content.date || 'Unknown date'} • ${Math.round((hovered.content.score || 0) * 100)}%`}
          />
        )}
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
