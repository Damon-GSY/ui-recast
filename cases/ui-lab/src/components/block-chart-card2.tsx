import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import './block-chart-card2.css';

export interface ChartCardPoint { label: string; value: number }
export interface ChartCardPeriod { id: string; label: string; points: ChartCardPoint[]; axisMax?: number }
export interface BlockChartCard2Props {
  title: string;
  description?: string;
  periods: ChartCardPeriod[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (period: string) => void;
  seriesLabel?: string;
  formatValue?: (value: number) => string;
  color?: string;
  className?: string;
}
type Point = { x: number; y: number };

// Shape-preserving cubic interpolation, computed from caller-owned numeric points.
function curve(points: Point[]) {
  if (!points.length) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  const slopes = points.slice(1).map((p, i) => (p.y - points[i].y) / (p.x - points[i].x || 1));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === points.length - 1) return slopes[i - 1];
    const a = slopes[i - 1], b = slopes[i];
    const before = points[i].x - points[i - 1].x, after = points[i + 1].x - points[i].x;
    const weighted = (a * after + b * before) / (before + after || 1);
    return a * b <= 0 ? 0 : (Math.sign(a) + Math.sign(b)) * Math.min(Math.abs(a), Math.abs(b), Math.abs(weighted) / 2);
  });
  tangents[0] = (3 * slopes[0] - tangents[1]) / 2;
  tangents[tangents.length - 1] = (3 * slopes[slopes.length - 1] - tangents[tangents.length - 2]) / 2;
  return points.slice(1).reduce((d, p, i) => {
    const a = points[i], h = (p.x - a.x) / 3;
    return `${d}C${a.x + h},${a.y + h * tangents[i]} ${p.x - h},${p.y - h * tangents[i + 1]} ${p.x},${p.y}`;
  }, `M${points[0].x},${points[0].y}`);
}

export function BlockChartCard2({ title, description, periods, period, defaultPeriod, onPeriodChange, seriesLabel = 'Visitors', formatValue = n => n.toLocaleString('en-US'), color = 'oklch(0.646 0.222 41.116)', className = '' }: BlockChartCard2Props) {
  const [localPeriod, setLocalPeriod] = useState(defaultPeriod ?? periods[0]?.id);
  const selected = periods.find(p => p.id === (period ?? localPeriod)) ?? periods[0];
  const plotRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [width, setWidth] = useState(624);
  const [hover, setHover] = useState<{index: number; y: number} | null>(null);
  const [drawing, setDrawing] = useState<Point[]>([]);
  const previous = useRef<Point[]>([]);
  const [reveal, setReveal] = useState(0);
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const points = selected?.points ?? [];
  const maximum = selected?.axisMax ?? Math.max(1, ...points.map(p => p.value)) * 1.1;
  const pointKey = JSON.stringify([selected?.id, points, maximum, width]);
  useLayoutEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const next = points.map((p, i) => ({x:60 + i * (width - 70) / Math.max(1, points.length - 1), y:226 - p.value / maximum * 216}));
    const old = previous.current;
    setHover(null);
    if (reduce) { previous.current = next; setDrawing(next); setReveal(1); return; }
    const initial = !old.length;
    const controls = animate(0, 1, {duration:1.5, delay:.05, ease:[.25,.1,.25,1], onUpdate(t) {
      setReveal(initial ? t : 1);
      const current = next.map((p, i) => {
        if (initial) return p;
        // The public renderer carries a subset of old points forward when the
        // number of observations changes; both coordinates move to the new grid.
        const from = old[Math.min(old.length - 1, Math.floor(i * old.length / next.length))];
        return {x:from.x + (p.x - from.x) * t, y:from.y + (p.y - from.y) * t};
      });
      previous.current = current;
      setDrawing(current);
    }});
    return () => controls.stop();
    // A new period or data set interrupts the current shape from its latest frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointKey, reduce]);
  function choose(next: string) { setLocalPeriod(next); onPeriodChange?.(next); }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % periods.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + periods.length) % periods.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = periods.length - 1;
    else return;
    event.preventDefault(); choose(periods[next].id); tabRefs.current[next]?.focus();
  }
  const line = curve(drawing);
  const area = line && `${line}L${drawing.at(-1)!.x},226L${drawing[0].x},226Z`;
  const active = hover && points[hover.index];
  const activeX = hover ? 60 + hover.index * (width - 70) / Math.max(1, points.length - 1) : 0;
  return <section data-capture-root className={`block-chart-card2 ${className}`} aria-labelledby={`${id}-title`}>
    <header><div><h3 id={`${id}-title`}>{title}</h3>{description && <p>{description}</p>}</div><div role="tablist" aria-label="Time period">{periods.map((p, index) => <button key={p.id} ref={el => {tabRefs.current[index] = el;}} type="button" role="tab" aria-selected={p.id === selected?.id} aria-controls={`${id}-plot`} tabIndex={p.id === selected?.id ? 0 : -1} onClick={() => choose(p.id)} onKeyDown={e => keyDown(e, index)}>{p.label}</button>)}</div></header>
    <div className="block-chart-card2__content"><div ref={plotRef} id={`${id}-plot`} className="block-chart-card2__plot" role="tabpanel" aria-label={`${selected?.label ?? ''} ${title}`} onPointerMove={event => {
      const box = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - box.left;
      if (x < 55 || x > width - 5 || !points.length) { setHover(null); return; }
      setHover({index:Math.max(0, Math.min(points.length - 1, Math.round((x - 60) / (width - 70) * (points.length - 1)))), y:event.clientY - box.top});
    }} onPointerLeave={() => setHover(null)}>
      <svg width="100%" height="256" viewBox={`0 0 ${width} 256`} role="img" aria-label={points.map(p => `${p.label}: ${formatValue(p.value)}`).join(', ')}>
        <defs><linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity=".2"/><stop offset="95%" stopColor={color} stopOpacity="0"/></linearGradient><clipPath id={`${id}-clip`}><rect x="60" y="0" width={Math.max(0, (width - 60) * reveal)} height="230"/></clipPath></defs>
        {[0,1,2,3,4].map(i => <g key={i}><line x1="60" x2={width - 10} y1={226 - i*54} y2={226 - i*54} stroke="#e5e5e580" strokeDasharray="3 3"/><text x="46" y={226 - i*54} dy=".355em" textAnchor="end">{Math.round(maximum*i/4)}</text></g>)}
        {points.map((p,i) => <text key={p.label} x={i === points.length - 1 ? width - Math.max(10,p.label.length*3) : 60+i*(width-70)/Math.max(1,points.length-1)} y="240" dy=".71em" textAnchor="middle">{p.label}</text>)}
        <g clipPath={`url(#${id}-clip)`}><path d={area || undefined} fill={`url(#${id}-fill)`}/><path d={line || undefined} fill="none" stroke={color} strokeWidth="1.5"/></g>
        {active && <g><line x1={activeX} x2={activeX} y1="10" y2="226" stroke="#d4d4d4"/><circle cx={activeX} cy={226-active.value/maximum*216} r="4" fill={color} stroke="white" strokeWidth="2"/></g>}
      </svg>
      {active && <div className="block-chart-card2__tooltip" style={{left:Math.min(width - 132,activeX+10),top:Math.max(4,Math.min(200,hover!.y+10))}}><strong>{active.label}</strong><div><i style={{background:color}}/><span>{seriesLabel}</span><b>{formatValue(active.value)}</b></div></div>}
    </div></div>
  </section>;
}
export default BlockChartCard2;
