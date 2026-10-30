import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import './number-ticker.css';

export interface NumberTickerProps {
  /** Current finite value. The initial value is rendered immediately. */
  value: number;
  /** Use for search results and other values that must not interpolate. */
  immediate?: boolean;
  duration?: number;
  decimalPlaces?: number;
  locale?: string;
  formatValue?: (value: number) => string;
  label?: string;
  className?: string;
}

/** Interpolates later, low-frequency value changes; never flips individual digits. */
export function NumberTicker({ value, immediate = false, duration = .65, decimalPlaces = 0,
  locale = 'en-US', formatValue, label, className = '' }: NumberTickerProps) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const current = useRef(value);
  const instant = immediate || reducedMotion || duration <= 0;
  useEffect(() => {
    if (instant) { current.current = value; setDisplay(value); return; }
    if (current.current === value) return;
    const playback = animate(current.current, value, {
      duration, ease: [.22, 1, .36, 1],
      onUpdate: next => { current.current = next; setDisplay(next); },
      onComplete: () => { current.current = value; setDisplay(value); },
    });
    return () => playback.stop();
  }, [value, instant, duration]);
  const format = formatValue ?? ((number: number) => number.toLocaleString(locale, {
    minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces,
  }));
  return <span className={`mf-number-ticker ${className}`} data-number-target={value}>
    <span aria-hidden="true" data-ticker-value>{format(instant ? value : display)}</span>
    <span className="mf-number-ticker__accessible">{label ? `${label}: ` : ''}{format(value)}</span>
  </span>;
}
