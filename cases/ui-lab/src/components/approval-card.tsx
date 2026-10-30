'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import './approval-card.css';

export type ApprovalCardStatus = 'pending' | 'approved' | 'denied';

export interface ApprovalCardProps {
  title: string;
  description?: ReactNode;
  risk?: 'low' | 'medium' | 'high';
  icon?: ReactNode;
  details?: { label: string; value: ReactNode }[];
  preview?: ReactNode;
  children?: ReactNode;
  status?: ApprovalCardStatus;
  defaultStatus?: ApprovalCardStatus;
  onApprove?: (options: { always: boolean }) => void | Promise<unknown>;
  onDeny?: (options: { reason: 'user' | 'timeout' }) => void;
  onEdit?: () => void;
  expiresIn?: number;
  onExpire?: () => void;
  allowAlways?: boolean;
  alwaysLabel?: string;
  approveLabel?: string;
  denyLabel?: string;
  editLabel?: string;
  shortcuts?: boolean;
  label?: ReactNode;
  actions?: 'tray' | 'card';
  className?: string;
}

const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(notify: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const getReducedMotion = () => window.matchMedia(reducedQuery).matches;
const getServerReducedMotion = () => false;

function Shield() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 7 3v5c0 4.5-3.4 7.5-7 10-3.6-2.5-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

/** UI only: callbacks own the action, and a controlled caller owns its status. */
export function ApprovalCard({
  title, description, risk, icon, details = [], preview, children, status,
  defaultStatus = 'pending', onApprove, onDeny, onEdit, expiresIn, onExpire,
  allowAlways = true, alwaysLabel = 'Always allow this action', approveLabel = 'Approve',
  denyLabel = 'Deny', editLabel = 'Edit', shortcuts = true, label, actions = 'tray', className = '',
}: ApprovalCardProps) {
  const id = useId();
  const [localStatus, setLocalStatus] = useState(defaultStatus);
  const currentStatus = status ?? localStatus;
  const [always, setAlways] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const duration = expiresIn === undefined ? undefined : Math.max(0, expiresIn * 1000);
  const [seconds, setSeconds] = useState(() => Math.ceil((duration ?? 0) / 1000));
  const [resolvedAt, setResolvedAt] = useState<Date | null>(null);
  const [height, setHeight] = useState<number>();
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pending = useRef<HTMLDivElement>(null);
  const resolved = useRef<HTMLDivElement>(null);
  const focusInside = useRef(false);
  const previousStatus = useRef(currentStatus);
  const request = useRef({ generation: 0, locked: false });
  const clock = useRef({ remaining: duration ?? 0, startedAt: null as number | null });
  const latest = useRef({ onApprove, onDeny, onExpire, status: currentStatus, controlled: status !== undefined });
  latest.current = { onApprove, onDeny, onExpire, status: currentStatus, controlled: status !== undefined };
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const blocked = busy || submitted;

  function stopClock() {
    if (clock.current.startedAt !== null) {
      clock.current.remaining = Math.max(0, clock.current.remaining - (performance.now() - clock.current.startedAt));
      clock.current.startedAt = null;
    }
  }

  // Invalidates an in-flight callback when this request is unmounted/replaced.
  useEffect(() => () => { request.current.generation += 1; }, []);

  useLayoutEffect(() => {
    if (previousStatus.current === currentStatus) return;
    previousStatus.current = currentStatus;
    request.current.generation += 1;
    request.current.locked = currentStatus !== 'pending';
    setBusy(false);
    setSubmitted(false);
    setError(null);
    if (currentStatus === 'pending') {
      setAlways(false);
      setAnnouncement('');
      setResolvedAt(null);
    } else {
      setResolvedAt(new Date());
      setAnnouncement(`${currentStatus === 'approved' ? 'Approved' : 'Denied'}: ${title}`);
      // React may already have removed the active button; the focus ref survives it.
      if (focusInside.current) resolved.current?.focus({ preventScroll: true });
    }
    // AnimatePresence keeps the old visual layer briefly; it is no longer interactive.
    if (pending.current) {
      pending.current.inert = currentStatus !== 'pending';
      if (currentStatus === 'pending') pending.current.removeAttribute('aria-hidden');
      else pending.current.setAttribute('aria-hidden', 'true');
    }
  }, [currentStatus, title]);

  useLayoutEffect(() => {
    stopClock();
    clock.current.remaining = duration ?? 0;
    setSeconds(Math.ceil((duration ?? 0) / 1000));
  }, [currentStatus, duration]);

  useLayoutEffect(() => {
    const node = content.current;
    if (!node) return;
    const measure = () => setHeight(node.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [currentStatus]);

  function finish(next: ApprovalCardStatus) {
    setSubmitted(true);
    if (!latest.current.controlled) setLocalStatus(next);
  }

  function deny(reason: 'user' | 'timeout') {
    if (latest.current.status !== 'pending' || request.current.locked) return;
    request.current.locked = true;
    stopClock();
    if (reason === 'timeout') latest.current.onExpire?.();
    latest.current.onDeny?.({ reason });
    finish('denied');
  }

  async function approve() {
    if (latest.current.status !== 'pending' || request.current.locked) return;
    request.current.locked = true;
    stopClock();
    const generation = request.current.generation;
    setError(null);
    setBusy(true);
    try {
      await latest.current.onApprove?.({ always: allowAlways && always });
      if (request.current.generation === generation && latest.current.status === 'pending') finish('approved');
    } catch (cause) {
      if (request.current.generation !== generation || latest.current.status !== 'pending') return;
      request.current.locked = false;
      setError(cause instanceof Error && cause.message ? cause.message : typeof cause === 'string' && cause ? cause : 'Approval failed. Please try again.');
    } finally {
      if (request.current.generation === generation) setBusy(false);
    }
  }

  useEffect(() => {
    if (currentStatus !== 'pending' || duration === undefined || hovered || focused || blocked) return;
    clock.current.startedAt = performance.now();
    const tick = () => {
      const remaining = Math.max(0, clock.current.remaining - (performance.now() - (clock.current.startedAt ?? performance.now())));
      setSeconds(Math.ceil(remaining / 1000));
      if (remaining === 0) deny('timeout');
    };
    tick();
    const timer = window.setInterval(tick, 100);
    return () => { window.clearInterval(timer); stopClock(); };
  }, [currentStatus, duration, hovered, focused, blocked]);

  const previewContent = preview !== undefined ? preview : children;
  const descriptionIds = [currentStatus === 'pending' && description != null && `${id}-description`, currentStatus === 'pending' && duration !== undefined && `${id}-countdown`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const alwaysCheckbox = allowAlways && <label className="approval-card__always">
      <input type="checkbox" checked={always} aria-disabled={blocked}
        onClick={event => { if (request.current.locked) event.preventDefault(); }}
        onChange={event => { if (!request.current.locked) setAlways(event.target.checked); }} />
      <span>{alwaysLabel}</span>
    </label>;
  const actionRow = <div className="approval-card__actions">
    {actions === 'card' && alwaysCheckbox}
    {duration !== undefined && <span className="approval-card__clock" data-urgent={seconds <= 10} aria-hidden="true">Expires in {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>}
    <div className="approval-card__buttons">
      {onEdit && <button type="button" className="approval-card__button" aria-disabled={blocked} onClick={() => { if (!request.current.locked) onEdit(); }}>{editLabel}</button>}
      <button type="button" className="approval-card__button" aria-disabled={blocked} aria-keyshortcuts="Escape" onClick={() => deny('user')}>{denyLabel}{shortcuts && <kbd aria-hidden="true">Esc</kbd>}</button>
      <button type="button" className="approval-card__button approval-card__button--approve" aria-disabled={blocked} aria-label={busy ? `${approveLabel} (processing)` : undefined} aria-keyshortcuts="Meta+Enter Control+Enter" onClick={() => void approve()}>
        {approveLabel}{busy ? <span className="approval-card__spinner" aria-hidden="true" /> : shortcuts && <kbd aria-hidden="true">⌘↵</kbd>}
      </button>
    </div>
  </div>;

  return <div ref={root} className={`approval-card ${className}`} data-status={currentStatus} data-actions={actions} data-reduced-motion={reduceMotion}>
    <motion.div className="approval-card__morph" animate={{ height: height ?? 'auto' }} transition={{ duration: reduceMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] }}>
      <div ref={content} className="approval-card__content" role="group" aria-labelledby={`${id}-${currentStatus === 'pending' ? 'title' : 'resolved-title'}`} aria-describedby={descriptionIds} aria-busy={busy}
        onMouseEnter={() => { stopClock(); setHovered(true); }}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => { stopClock(); focusInside.current = true; setFocused(true); }}
        onBlurCapture={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { focusInside.current = false; setFocused(false); }
        }}
        onKeyDown={event => {
          if (currentStatus !== 'pending' || event.nativeEvent.isComposing) return;
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); event.stopPropagation(); void approve(); }
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); deny('user'); }
        }}>
        <AnimatePresence mode="popLayout">
        {currentStatus === 'pending' ? <motion.div key="pending" ref={pending} className="approval-card__pending"
          initial={reduceMotion ? false : { opacity: 0, y: 6, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, scale: 0.985, filter: 'blur(2px)', transition: { duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] } }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}>
          {label != null && <div className="approval-card__label">{label}</div>}
          <div className="approval-card__surface">
            <div className="approval-card__header">
              <span className="approval-card__icon">{icon ?? <Shield />}</span>
              <div className="approval-card__heading"><span id={`${id}-title`} className="approval-card__title">{title}</span>
                {description != null && <div id={`${id}-description`} className="approval-card__description">{description}</div>}
              </div>
              {risk && <span className="approval-card__risk" data-risk={risk}><span className="approval-card__risk-dot" aria-hidden="true" /><span>{risk[0].toUpperCase() + risk.slice(1)}</span><span className="approval-card__risk-word"> risk</span></span>}
            </div>
            {(previewContent != null || details.length > 0) && <div className="approval-card__preview">
              {previewContent != null && <div className="approval-card__custom-preview">{previewContent}</div>}
              {details.length > 0 && <dl className="approval-card__details">{details.map((detail, index) => <div key={index}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl>}
            </div>}
            {error && <p className="approval-card__error" role="alert" id={`${id}-error`}>{error}</p>}
            {actions === 'tray' && alwaysCheckbox}
            {actions === 'card' && actionRow}
          </div>
          {actions === 'tray' && actionRow}
          {duration !== undefined && <span id={`${id}-countdown`} className="approval-card__sr-only">Expires in {seconds} seconds unless approved or denied. Countdown pauses while hovered, focused, or approving.</span>}
        </motion.div> : <motion.div key="resolved" ref={resolved} tabIndex={-1} className="approval-card__resolved"
          initial={reduceMotion ? false : { opacity: 0, y: 4, filter: 'blur(2px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: reduceMotion ? 0 : 0.12 } }}
          transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}>
          <motion.span className="approval-card__decision-icon" aria-hidden="true" initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduceMotion ? 0 : 0.46, delay: reduceMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }}><svg viewBox="0 0 20 20" fill="none"><motion.path key={currentStatus} d={currentStatus === 'approved' ? 'm5 10 3 3 7-7' : 'm6 6 8 8M14 6l-8 8'} initial={{ pathLength: reduceMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduceMotion ? 0 : .42, delay: reduceMotion ? 0 : .3, ease: [.22, 1, .36, 1] }} /></svg></motion.span>
          <span id={`${id}-resolved-title`} className="approval-card__resolved-title">{title}</span>
          <span className="approval-card__decision">{currentStatus === 'approved' ? 'Approved' : 'Denied'}<time dateTime={resolvedAt?.toISOString()} className="approval-card__resolved-time"> · just now</time></span>
        </motion.div>}
        </AnimatePresence>
      </div>
    </motion.div>
    <span className="approval-card__sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  </div>;
}
