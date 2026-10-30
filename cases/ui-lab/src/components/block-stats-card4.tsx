import { useId } from 'react';
import './block-stats-card4.css';
export interface BlockStatsCard4Props {
  title: string;
  current: number;
  previous: number;
  currentLabel: string;
  previousLabel: string;
  formatValue?: (value: number) => string;
  className?: string;
}
export function BlockStatsCard4({title, current, previous, currentLabel, previousLabel, formatValue = n => n.toLocaleString('en-US'), className = ''}: BlockStatsCard4Props) {
  const titleId = useId();
  return <section data-capture-root className={`block-stats-card4 ${className}`} aria-labelledby={titleId}>
    <h3 id={titleId}>{title}</h3>
    <dl><div><dd>{formatValue(current)}</dd><dt>{currentLabel}</dt></div><div><dd>{formatValue(previous)}</dd><dt>{previousLabel}</dt></div></dl>
  </section>;
}
export default BlockStatsCard4;
