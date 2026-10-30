import { useId, type CSSProperties } from 'react';
import './block-stats-card3.css';

export interface BlockStatsCard3Props {
  title: string;
  value: number;
  target: number;
  formatValue?: (value: number) => string;
  className?: string;
}

/** Goal values belong to the caller. A zero target has no measurable progress. */
export function BlockStatsCard3({ title, value, target, formatValue = n => n.toLocaleString('en-US'), className = '' }: BlockStatsCard3Props) {
  const titleId = useId();
  const percent = target > 0 ? Math.max(0, value / target * 100) : 0;
  return <section data-capture-root className={`block-stats-card3 ${className}`} aria-labelledby={titleId}>
    <h3 id={titleId}>{title}</h3>
    <div className="block-stats-card3__content">
      <div className="block-stats-card3__value">{formatValue(value)}</div>
      <div className="block-stats-card3__progress-group">
        <div className="block-stats-card3__progress" role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, percent)} aria-valuetext={`${Math.round(percent)}% complete`}>
          <div style={{ '--progress': `${Math.min(100, percent)}%` } as CSSProperties} />
        </div>
        <div className="block-stats-card3__labels"><span>{Math.round(percent)}% complete</span><span>Target: {formatValue(target)}</span></div>
      </div>
    </div>
  </section>;
}
export default BlockStatsCard3;
