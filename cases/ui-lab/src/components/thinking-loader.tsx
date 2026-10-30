'use client';

import {
  useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore,
} from 'react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import './thinking-loader.css';

export interface ThinkingLoaderProps {
  phases?: readonly string[];
  interval?: number;
  phase?: number;
  loop?: boolean;
  done?: boolean;
  doneLabel?: string | ((elapsedSeconds: number) => string);
  size?: 'sm' | 'md';
  variant?: 'pill' | 'plain';
  appearance?: 'classic' | 'clean';
  className?: string;
  /** Also respects the system preference; true only reduces motion further. */
  reduceMotion?: boolean;
}

const defaultPhases = ['Thinking', 'Searching the web', 'Reading sources', 'Writing response'];
const defaultDoneLabel = (seconds: number) => `Thought for ${seconds}s`;
const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribeMotion(listener: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
const getMotionPreference = () => window.matchMedia(motionQuery).matches;
const getServerMotionPreference = () => false;

/** Business clock: transitions never schedule or advance phases. */
function usePhaseClock(count: number, interval: number, phase: number | undefined, loop: boolean, done: boolean) {
  const [run, setRun] = useState(() => ({
    done, index: 0, startedAt: Date.now(), elapsedSeconds: 0,
  }));
  const index = Math.max(0, Math.min(count - 1, Math.trunc(phase ?? run.index)));

  // Adjust before children commit: restarting cannot briefly announce the old phase.
  if (done !== run.done) {
    const now = Date.now();
    setRun({
      done,
      index: !done && phase === undefined ? 0 : index,
      startedAt: done ? run.startedAt : now,
      elapsedSeconds: done ? Math.max(0, Math.floor((now - run.startedAt) / 1000)) : 0,
    });
  } else if (index !== run.index) {
    // Returning to automatic mode continues from the last controlled phase.
    setRun({ ...run, index });
  }

  useEffect(() => {
    if (done || phase !== undefined || count < 2 || (!loop && index === count - 1)) return;
    const timer = window.setTimeout(() => {
      setRun(current => ({ ...current, index: (current.index + 1) % count }));
    }, Math.max(1, interval));
    return () => window.clearTimeout(timer);
  }, [count, interval, phase, loop, done, index, run.startedAt]);

  return { index, elapsedSeconds: run.elapsedSeconds };
}

function Spinner() {
  return <svg className="thinking-loader__spinner" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    {Array.from({ length: 8 }, (_, ray) => <line key={ray}
      x1="8" y1="1.75" x2="8" y2="4.75" transform={`rotate(${ray * 45} 8 8)`}
      style={{ animationDelay: `${-0.8 + ray * 0.1}s` }} strokeLinecap="round" />)}
  </svg>;
}

function Check() {
  return <svg className="thinking-loader__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.4 6.6 11.3 12.5 4.9" pathLength="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

const labelEase = [0.22, 1, 0.36, 1] as const;

function PhaseLabel({ label, done }: { label: string; done: boolean }) {
  const present = useIsPresent();
  return <motion.span className={`thinking-loader__label${present && !done ? ' thinking-loader__label--working' : ''}`}
    data-label={label} initial={{ y: '70%', opacity: 0, filter: 'blur(3px)' }}
    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
    exit={{ y: '-70%', opacity: 0, filter: 'blur(3px)', transition: { duration: 0.32, ease: labelEase } }}
    transition={{ duration: 0.46, ease: labelEase }}>{label}</motion.span>;
}

/** Width, outgoing text and incoming text retain their separate timing. */
function RollingLabel({ label, done, instant }: { label: string; done: boolean; instant: boolean }) {
  const content = useRef<HTMLSpanElement>(null);
  const measure = useRef<(() => void) | null>(null);
  const [width, setWidth] = useState<number>();

  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    let previous: number | undefined;
    const update = () => {
      // A small right reserve keeps the blur/antialiasing within the measured window.
      const next = Math.ceil(Number.parseFloat(getComputedStyle(element).width)) + 1;
      if (!Number.isFinite(next) || next === previous) return;
      setWidth(next);
      previous = next;
    };
    measure.current = update;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element); // Includes font loading and inherited font changes.
    return () => { observer.disconnect(); measure.current = null; };
  }, []);

  useLayoutEffect(() => { measure.current?.(); });
  return <span className="thinking-loader__window" style={{ width }}>
    <span ref={content} className="thinking-loader__measure">{label}</span>
    {instant ? <span className="thinking-loader__label">{label}</span> :
      <AnimatePresence initial={false}>
        <PhaseLabel key={label} label={label} done={done} />
      </AnimatePresence>}
  </span>;
}

export function ThinkingLoader({
  phases = defaultPhases, interval = 2200, phase, loop = false, done = false,
  doneLabel = defaultDoneLabel, size = 'md', variant = 'pill', appearance = 'classic', className = '', reduceMotion = false,
}: ThinkingLoaderProps) {
  const labels = phases.length ? phases : defaultPhases;
  const { index, elapsedSeconds } = usePhaseClock(labels.length, interval, phase, loop, done);
  const label = done ? (typeof doneLabel === 'function' ? doneLabel(elapsedSeconds) : doneLabel) : labels[index];
  const systemReduced = useSyncExternalStore(subscribeMotion, getMotionPreference, getServerMotionPreference);
  const instant = reduceMotion || systemReduced;
  const [announcement, setAnnouncement] = useState('');

  // One stable live region; equal text does not cause another DOM announcement.
  useEffect(() => { setAnnouncement(label); }, [label]);

  return <span className={`thinking-loader ${className}`.trim()}
    data-size={size} data-variant={variant} data-appearance={appearance} data-done={done || undefined}
    data-reduce-motion={instant || undefined}>
    <span className="thinking-loader__visual" aria-hidden="true">
      <span className="thinking-loader__icon">
        <Spinner />
        <Check />
      </span>
      <RollingLabel label={label} done={done} instant={instant} />
    </span>
    <span className="thinking-loader__status" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  </span>;
}
