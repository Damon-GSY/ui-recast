'use client';

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type ComponentProps, type ReactNode } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { motion } from 'motion/react';
import './segmented-control.css';

export type SegmentOption = {
  value: string;
  label?: string;
  icon?: ReactNode;
  count?: number;
  badge?: string;
  disabled?: boolean;
  ariaLabel?: string;
  controls?: string;
};

export type SegmentedControlProps = {
  options: SegmentOption[];
  label?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: 'buttons' | 'tray' | 'underline';
  appearance?: 'clean' | 'classic';
  size?: 'sm' | 'md' | 'lg';
  kind?: 'radio' | 'tabs';
  fullWidth?: boolean;
  disabled?: boolean;
  reduceMotion?: boolean;
  className?: string;
};

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
const getServerReducedMotion = () => false;

function SegmentCount({ count, instant, duration }: { count?: number; instant: boolean; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(count);
  useLayoutEffect(() => {
    const changed = previous.current !== count;
    previous.current = count;
    if (!changed || instant) return;
    // Animate only the new count; never keep a second, accessible old count.
    const animation = ref.current?.animate(
      [{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)' }],
      { duration: duration * 1000, easing: 'ease-out' },
    );
    return () => animation?.cancel();
  }, [count, instant, duration]);
  return count === undefined ? null : <span ref={ref} className="sc-count">{count}</span>;
}

/** One state owner; measured geometry drives an interruptible two-edge indicator. */
export function SegmentedControl({
  options, label, value, defaultValue, onValueChange, variant = 'buttons',
  appearance = 'clean', size = 'md', disabled = false, reduceMotion = false, className = '',
  kind = 'radio', fullWidth = false, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby,
}: SegmentedControlProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? options.find(o => !o.disabled)?.value);
  const selected = value ?? internalValue;
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<{ left: number; right: number; direction: number; resizing: boolean } | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const systemReduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const instant = reduceMotion || systemReduced;
  const timing = appearance === 'classic'
    ? { lead: .27, follow: .4, neutral: .38, ease: [.22, 1, .36, 1] as const }
    : { lead: .16, follow: .22, neutral: .2, ease: [.25, .9, .3, 1] as const };
  const pointer = useRef<{ id: number; x: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const tabStop = options.find(o => o.value === selected && !o.disabled)?.value
    ?? options.find(o => !o.disabled)?.value;

  function choose(next: string) {
    const option = options.find(o => o.value === next);
    if (disabled || next === selected || !option || option.disabled) return;
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

  function updateEdges() {
    const el = scrollRef.current;
    if (el) {
      const left = el.scrollLeft > 1;
      const right = el.scrollWidth - el.clientWidth - el.scrollLeft > 1;
      setEdges(current => current.left === left && current.right === right ? current : { left, right });
    }
  }

  useLayoutEffect(() => {
    const track = trackRef.current;
    const scroller = scrollRef.current;
    if (!track || !scroller) return;
    const measure = () => {
      const buttons = [...track.querySelectorAll<HTMLButtonElement>('[data-segment]')];
      const nextWidths = Object.fromEntries(buttons.map(button => {
        const style = getComputedStyle(button);
        const content = button.querySelector<HTMLElement>('.sc-content')!;
        // Keep integer layout widths: client rects include the pressed/demo scale.
        return [button.dataset.segment!, Math.round(content.offsetWidth + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight))];
      }));
      if (fullWidth && buttons.length) {
        const scrollStyle = getComputedStyle(scroller);
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const available = scroller.clientWidth - parseFloat(scrollStyle.paddingLeft) - parseFloat(scrollStyle.paddingRight);
        const equalWidth = Math.max(...Object.values(nextWidths), (available - gap * (buttons.length - 1)) / buttons.length);
        buttons.forEach(button => { nextWidths[button.dataset.segment!] = equalWidth; });
      }
      setWidths(current => Object.keys(current).length === buttons.length && Object.entries(nextWidths).every(([key, width]) => current[key] === width) ? current : nextWidths);
      const resizing = buttons.some(button => button.offsetWidth !== Math.round(nextWidths[button.dataset.segment!]));
      const active = buttons
        .find(el => el.dataset.segment === selected);
      if (!active) { setGeometry(null); updateEdges(); return; }
      const inset = variant === 'underline' ? 2 : 0;
      const left = active.offsetLeft + inset;
      const right = active.offsetLeft + active.offsetWidth - inset;
      // Compare with the visible pill, not an interrupted animation's old target.
      const direction = Math.sign(left - (indicatorRef.current?.offsetLeft ?? left));
      setGeometry(current => current?.left === left && current.right === right && current.resizing === resizing ? current : { left, right, direction, resizing });
      // Scroll only this control, never the surrounding document.
      const start = track.offsetLeft + active.offsetLeft;
      const end = start + active.offsetWidth;
      if (start < scroller.scrollLeft) scroller.scrollLeft = start;
      else if (end > scroller.scrollLeft + scroller.clientWidth) scroller.scrollLeft = end - scroller.clientWidth;
      updateEdges();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(scroller);
    track.querySelectorAll('[data-segment]').forEach(el => observer.observe(el));
    track.querySelectorAll('.sc-content').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selected, options, variant, appearance, size, kind, fullWidth, instant]);

  // Radio keeps Radix's semantics; both kinds share the documented selection keys
  // and pointer handling. Tab buttons deliberately leave Up/Down to page scrolling.
  const trackProps = {
    ref: trackRef,
    className: 'sc-track',
    'aria-label': ariaLabel ?? label,
    'aria-labelledby': ariaLabelledby,
    'aria-disabled': disabled || undefined,
    onKeyDownCapture: event => {
      if (disabled || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const enabled = options.filter(o => !o.disabled);
      const focused = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-segment]');
      if (!enabled.length || !focused || focused.disabled) return;
      const backwards = event.key === 'ArrowLeft' || (kind === 'radio' && event.key === 'ArrowUp');
      const forwards = event.key === 'ArrowRight' || (kind === 'radio' && event.key === 'ArrowDown');
      if (!backwards && !forwards && !['Home', 'End', 'Enter'].includes(event.key)) return;
      const current = enabled.findIndex(o => o.value === focused.dataset.segment);
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1
        : backwards ? (current - 1 + enabled.length) % enabled.length
        : forwards ? (current + 1) % enabled.length : current;
      event.preventDefault();
      // Avoid a second navigation/selection in Radix after our shared handler.
      event.stopPropagation();
      const next = enabled[index]?.value;
      if (next === undefined) return;
      choose(next);
      [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-segment]')]
        .find(el => el.dataset.segment === next)?.focus({ preventScroll: true });
    },
    onPointerDown: event => {
      if (disabled || event.pointerType !== 'mouse' || event.button !== 0) return;
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-segment]');
      if (!button || button.disabled) return;
      suppressClick.current = false;
      pointer.current = { id: event.pointerId, x: event.clientX, dragging: false };
    },
    onPointerMove: event => {
      const gesture = pointer.current;
      if (!gesture || gesture.id !== event.pointerId) return;
      if (!gesture.dragging && Math.abs(event.clientX - gesture.x) < 4) return;
      gesture.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-segment]')];
      const hit = buttons.find(button => { const r = button.getBoundingClientRect(); return event.clientX >= r.left && event.clientX <= r.right; });
      if (hit && !hit.disabled) { choose(hit.dataset.segment!); hit.focus({ preventScroll: true }); }
    },
    onPointerUp: event => {
      suppressClick.current = pointer.current?.dragging ?? false;
      pointer.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: () => { pointer.current = null; suppressClick.current = false; },
    onClickCapture: event => {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    },
  } satisfies ComponentProps<'div'>;

  const segments = <>
    {geometry && <motion.span key={instant ? 'instant' : 'animated'} aria-hidden="true" className="sc-indicator" ref={indicatorRef} initial={false}
      style={{ left: 'var(--sc-left)', right: 'auto', width: 'calc(var(--sc-right) - var(--sc-left))' }}
      animate={{ '--sc-left': `${geometry.left}px`, '--sc-right': `${geometry.right}px` }}
      transition={{
        // Width transitions already animate layout. Follow their measured edges
        // without starting another trailing animation on every resize frame.
        '--sc-left': { duration: instant || geometry.resizing ? 0 : !geometry.direction ? timing.neutral : geometry.direction > 0 ? timing.follow : timing.lead, ease: timing.ease },
        '--sc-right': { duration: instant || geometry.resizing ? 0 : !geometry.direction ? timing.neutral : geometry.direction < 0 ? timing.follow : timing.lead, ease: timing.ease },
      }} />}
    {options.map(option => {
      const optionProps = {
        className: 'sc-option',
        'data-segment': option.value,
        style: { width: widths[option.value] },
        disabled: disabled || option.disabled,
        'aria-controls': option.controls,
        // An explicit base name must not hide the visible count or badge.
        'aria-label': option.ariaLabel === undefined ? undefined
          : [option.ariaLabel, option.count, option.badge].filter(part => part !== undefined && part !== '').join(' '),
      };
      const content = <span className="sc-content">
        {option.icon && <span className="sc-icon" aria-hidden="true">{option.icon}</span>}
        {option.label && <span className="sc-label" data-label={option.label}><span>{option.label}</span><span className="sc-label-strong" aria-hidden="true">{option.label}</span></span>}
        <SegmentCount count={option.count} instant={instant} duration={timing.neutral} />
        {option.badge && <span className="sc-badge">{option.badge}</span>}
      </span>;
      return kind === 'tabs'
        ? <button {...optionProps} key={option.value} type="button" role="tab"
            id={option.controls ? `${option.controls}-tab` : undefined}
            aria-selected={selected === option.value} tabIndex={!disabled && option.value === tabStop ? 0 : -1}
            data-state={selected === option.value ? 'checked' : 'unchecked'}
            onClick={() => choose(option.value)}>{content}</button>
        : <RadioGroup.Item {...optionProps} key={option.value} value={option.value}>{content}</RadioGroup.Item>;
    })}
  </>;

  return (
    <div className={`sc sc--${variant} sc--${size} sc--${appearance} ${className}`} data-disabled={disabled || undefined}
      data-full-width={fullWidth || undefined} data-reduced-motion={instant || undefined}>
      <div className="sc-scroll" ref={scrollRef} onScroll={updateEdges}
        data-fade-left={edges.left || undefined} data-fade-right={edges.right || undefined}>
        {kind === 'tabs'
          ? <div {...trackProps} role="tablist" aria-orientation="horizontal">{segments}</div>
          : <RadioGroup.Root {...trackProps} value={selected} onValueChange={choose}
              orientation="horizontal" disabled={disabled} loop>{segments}</RadioGroup.Root>}
      </div>
    </div>
  );
}
