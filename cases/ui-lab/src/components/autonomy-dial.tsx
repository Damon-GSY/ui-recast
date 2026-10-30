"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react';
import './autonomy-dial.css';

export type AutonomyLevel = 0 | 1 | 2;

export interface AgentAction {
  id: string;
  label: string;
  detail?: string;
  risk: 'safe' | 'risky' | 'destructive';
  icon?: ReactNode;
}

export interface AutonomyDialProps {
  actions: AgentAction[];
  level?: AutonomyLevel;
  defaultLevel?: AutonomyLevel;
  onLevelChange?: (level: AutonomyLevel) => void;
  pinned?: string[];
  defaultPinned?: string[];
  onPinnedChange?: (pinned: string[]) => void;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Additional presentation preference; the system's reduced-motion setting always wins. */
  reducedMotion?: boolean;
}

const levels = ['Always ask', 'If risky', 'Full auto'] as const;
const descriptions = [
  'Every action asks for your approval first.',
  'Safe actions run on their own. Risky, destructive and locked actions ask first.',
  'All unlocked actions run on their own. Locked actions always ask first.',
];
const motionQuery = '(prefers-reduced-motion: reduce)';
// Position-only tween and small row stagger fitted to the sampled native video.
const layoutTransition = { duration: 0.42, ease: [0.4, 0, 0.2, 1] } as const;
// Timing measured from the public preview's rendered segmented indicator.
const selectionTransition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] } as const;
const countTransition = { duration: 0.36, ease: [0.22, 1, 0.36, 1] } as const;

function subscribeToMotionPreference(notify: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

function getMotionPreference() {
  return window.matchMedia(motionQuery).matches;
}

function DialCount({ value, reduce }: { value: number; reduce: boolean }) {
  const [change, setChange] = useState({ value, direction: 1 });
  if (change.value !== value) {
    setChange({ value, direction: value > change.value ? 1 : -1 });
  }

  return (
    <span className="autonomy-dial__count">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { y: change.direction * 12.6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={reduce ? { duration: 0 } : countTransition}
        >{value}</motion.span>
      </AnimatePresence>
    </span>
  );
}

// Independently drawn SVGs, not paths from the reference component.
function DialIcon({ name }: { name: 'sparkle' | 'document' | 'lock' | 'unlock' | 'risky' | 'destructive' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {name === 'sparkle' && <><path d="m10 3 2.2 6.8L19 12l-6.8 2.2L10 21l-2.2-6.8L1 12l6.8-2.2Z" fill="currentColor" stroke="none" /><path d="m20 2 .8 2.2L23 5l-2.2.8L20 8l-.8-2.2L17 5l2.2-.8Z" fill="currentColor" stroke="none" /></>}
      {name === 'document' && <><path d="M6 3h8l4 4v14H6Z" /><path d="M14 3v5h4M9 12h6M9 16h6" /></>}
      {(name === 'lock' || name === 'unlock') && <><rect x="6" y="10" width="12" height="11" rx="3" /><path d={name === 'lock' ? 'M8 10V7a4 4 0 0 1 8 0v3' : 'M8 10V7a4 4 0 0 1 7.4-2.1'} /><circle cx="12" cy="15" r="1" /><path d="M12 16v2" /></>}
      {name === 'risky' && <><path d="m12 3 10 17H2Z" /><path d="M12 9v5m0 3v.1" /></>}
      {name === 'destructive' && <><path d="m8 2-6 6v8l6 6h8l6-6V8l-6-6Z" /><path d="M12 7v6m0 4v.1" /></>}
    </svg>
  );
}

export function AutonomyDial({
  actions,
  level: controlledLevel,
  defaultLevel = 1,
  onLevelChange,
  pinned: controlledPinned,
  defaultPinned = [],
  onPinnedChange,
  title = 'Agent permissions',
  subtitle = 'What it may do without asking you',
  className = '',
  reducedMotion = false,
}: AutonomyDialProps) {
  const id = useId();
  const [internalLevel, setInternalLevel] = useState(defaultLevel);
  const [internalPinned, setInternalPinned] = useState(defaultPinned);
  const level = controlledLevel ?? internalLevel;
  const pinned = controlledPinned ?? internalPinned;
  const systemReducedMotion = useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, () => false);
  const reduce = reducedMotion || systemReducedMotion;
  const radios = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingLockFocus = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>();
  const pinnedIds = new Set(pinned);
  const runs = (action: AgentAction) => !pinnedIds.has(action.id) && (level === 2 || (level === 1 && action.risk === 'safe'));
  const running = actions.filter(runs);
  const asking = actions.filter(action => !runs(action));
  const locked = actions.filter(action => pinnedIds.has(action.id));
  const actionDomId = (action: AgentAction) => `${id}-action-${encodeURIComponent(action.id)}`;

  // Animate the shell's actual height, never scale its text or its moving rows.
  // The inner content stays intrinsic so empty groups and container resizing are measured.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setContentHeight(content.offsetHeight + 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // React preserves the keyed button, but moving its DOM ancestor can drop focus.
  // Only restore a focus lost to the document; never take it from another control.
  useLayoutEffect(() => {
    const button = pendingLockFocus.current;
    pendingLockFocus.current = null;
    if (button?.isConnected && button.ownerDocument.activeElement === button.ownerDocument.body) {
      button.focus({ preventScroll: true });
    }
  });

  function chooseLevel(next: AutonomyLevel) {
    if (next === level) return;
    if (controlledLevel === undefined) setInternalLevel(next);
    onLevelChange?.(next);
  }

  function handleLevelKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % 3;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + 2) % 3;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 2;
    else return;
    event.preventDefault();
    chooseLevel(next as AutonomyLevel);
    radios.current[next]?.focus();
  }

  function togglePin(action: AgentAction, button: HTMLButtonElement) {
    if (button.ownerDocument.activeElement === button) pendingLockFocus.current = button;
    const next = pinnedIds.has(action.id) ? pinned.filter(value => value !== action.id) : [...pinned, action.id];
    if (controlledPinned === undefined) setInternalPinned(next);
    onPinnedChange?.(next);
  }

  function renderGroup(key: 'running' | 'asking', label: string, items: AgentAction[]) {
    return (
      <motion.section
        key={`group-${key}`}
        className="autonomy-dial__group"
        data-empty={items.length === 0 || undefined}
        layout={reduce ? false : 'position'}
        transition={reduce ? { duration: 0 } : layoutTransition}
        aria-labelledby={`${id}-${key}`}
        aria-owns={items.length ? items.map(actionDomId).join(' ') : undefined}
      >
        <h3 id={`${id}-${key}`} className="autonomy-dial__group-title">
          {label}<DialCount value={items.length} reduce={reduce} />
        </h3>
        {items.length === 0 && <p className="autonomy-dial__empty">{key === 'running' ? 'Every action waits for you' : 'No actions need approval.'}</p>}
      </motion.section>
    );
  }

  function renderAction(action: AgentAction) {
    const isPinned = pinnedIds.has(action.id);
    const rowId = actionDomId(action);
    return (
      <motion.div
        key={`action-${action.id}`}
        id={rowId}
        role="group"
        aria-labelledby={`${rowId}-label`}
        className="autonomy-dial__action"
        data-pinned={isPinned || undefined}
        layout={!reduce ? 'position' : false}
        transition={reduce ? { duration: 0 } : { ...layoutTransition, delay: Math.max(0, actions.indexOf(action) - (level === 2 ? actions.filter(item => item.risk === 'safe').length : 0)) * 0.02 }}
      >
        <span className="autonomy-dial__action-icon" aria-hidden="true">{action.icon ?? <DialIcon name="document" />}</span>
        <div className="autonomy-dial__action-copy">
          <div className="autonomy-dial__action-line">
            <span className="autonomy-dial__action-label" id={`${rowId}-label`}>{action.label}</span>
            {action.risk !== 'safe' && <span className={`autonomy-dial__risk autonomy-dial__risk--${action.risk}`}><DialIcon name={action.risk} />{action.risk === 'risky' ? 'Risky' : 'Destructive'}</span>}
          </div>
          {action.detail && <span id={`${rowId}-detail`} className="autonomy-dial__detail">{action.detail}</span>}
        </div>
        <button
          type="button"
          className="autonomy-dial__lock"
          aria-label={`Always ask before: ${action.label}`}
          aria-pressed={isPinned}
          aria-describedby={action.detail ? `${rowId}-detail` : undefined}
          title={`${isPinned ? 'Remove always-ask lock' : 'Always ask first'}: ${action.label}`}
          onClick={event => togglePin(action, event.currentTarget)}
        >
          <DialIcon name={isPinned ? 'lock' : 'unlock'} />
        </button>
      </motion.div>
    );
  }

  // A single flat, keyed child array keeps actions mounted across BOTH sections.
  // aria-owns supplies the corresponding semantic grouping without reparenting DOM.
  const rows = [
    renderGroup('running', 'Runs on its own', running),
    ...running.map(renderAction),
    renderGroup('asking', 'Asks you first', asking),
    ...asking.map(renderAction),
  ];

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <LayoutGroup id={id}>
        <motion.div
          className={`autonomy-dial ${className}`}
          data-reduced-motion={reduce || undefined}
          initial={false}
          animate={{ height: contentHeight ?? 'auto' }}
          transition={reduce ? { duration: 0 } : layoutTransition}
        >
          <div ref={contentRef}>
          <div className="autonomy-dial__header">
            <div className="autonomy-dial__heading">
              <span className="autonomy-dial__sparkle" aria-hidden="true"><DialIcon name="sparkle" /></span>
              <div className="autonomy-dial__heading-copy">
                <h2 className="autonomy-dial__title">{title}</h2>
                <p className="autonomy-dial__subtitle">{subtitle}</p>
              </div>
            </div>
            <div className="autonomy-dial__levels" role="radiogroup" aria-label="Autonomy" aria-describedby={`${id}-description`}>
              <motion.span className="autonomy-dial__selection" aria-hidden="true" initial={false} animate={{ x: `${level * 100}%` }} transition={reduce ? { duration: 0 } : selectionTransition} />
              {levels.map((label, index) => (
                <button
                  key={label}
                  ref={node => { radios.current[index] = node; }}
                  type="button"
                  role="radio"
                  aria-checked={level === index}
                  tabIndex={level === index ? 0 : -1}
                  className="autonomy-dial__level"
                  onClick={() => chooseLevel(index as AutonomyLevel)}
                  onKeyDown={event => handleLevelKey(event, index)}
                >{label}</button>
              ))}
            </div>
          </div>
          <div className="autonomy-dial__actions">{rows}</div>
          <p className="autonomy-dial__sr-only" id={`${id}-description`}>{descriptions[level]}</p>
          <p className="autonomy-dial__sr-only" role="status" aria-live="polite" aria-atomic="true">
            {levels[level]}. {running.length} {running.length === 1 ? 'action runs' : 'actions run'} on {running.length === 1 ? 'its' : 'their'} own; {asking.length} {asking.length === 1 ? 'action asks' : 'actions ask'} first. {locked.length ? `Always-ask locks: ${locked.map(action => action.label).join(', ')}.` : 'No actions locked.'}
          </p>
          </div>
        </motion.div>
      </LayoutGroup>
    </MotionConfig>
  );
}
