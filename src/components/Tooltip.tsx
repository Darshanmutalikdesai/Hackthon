import styles from '../styles/Shared.module.css';

type TooltipProps = {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  description: string;
};

function Tooltip({ visible, x, y, title, description }: TooltipProps) {
  if (!visible) return null;

  return (
    <div
      className={styles.card}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        top: y,
        left: x,
        transform: 'translate(-50%, -115%)',
        minWidth: 220,
        zIndex: 30,
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>{title}</p>
      <p style={{ margin: '8px 0 0', color: '#cbd5e1', fontSize: '0.92rem' }}>{description}</p>
    </div>
  );
}

export default Tooltip;
