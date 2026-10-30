import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './event-list.css';

export interface EventListItem {
  /** Stable across status updates, reordering and temporary filtering. */
  id: string;
  title: ReactNode;
  description?: ReactNode;
  timestamp: ReactNode;
  dateTime?: string;
  icon?: ReactNode;
  status?: { label: string; tone?: 'neutral' | 'success' | 'error' | 'pending' };
  actionLabel?: string;
  disabled?: boolean;
}
export interface EventListProps {
  items: readonly EventListItem[];
  label?: string;
  emptyMessage?: ReactNode;
  onItemAction?: (id: string) => void;
  selectedId?: string;
  className?: string;
}

/** Initial items are visible. Only IDs first seen after mount receive an entrance. */
export function EventList({ items, label = 'Activity', emptyMessage = 'No activity yet.',
  onItemAction, selectedId, className = '' }: EventListProps) {
  const seen = useRef(new Set(items.map(item => item.id)));
  const insertion = useRef(0);
  const insertionVersion = insertion.current + (items.some(item => !seen.current.has(item.id)) ? 1 : 0);
  const reducedMotion = useReducedMotion();
  useLayoutEffect(() => {
    insertion.current = insertionVersion;
    for (const item of items) seen.current.add(item.id);
  }, [items, insertionVersion]);
  // The reference grows new cards without a visible overshoot. Position-only
  // layout keeps existing text at its native size while it makes room.
  const entrance = reducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 46 };
  return <ol className={`mf-event-list ${className}`} aria-label={label}>
    {!items.length && <li className="mf-event-list__empty">{emptyMessage}</li>}
    {items.map(item => <motion.li key={item.id} data-event-id={item.id}
      className="mf-event-list__slot" layout={!reducedMotion && 'position'}
      layoutDependency={insertionVersion} initial={false} transition={entrance}>
      <motion.div className="mf-event-list__row" data-selected={selectedId === item.id || undefined}
        initial={!reducedMotion && !seen.current.has(item.id) ? { opacity: 0, scale: 0 } : false}
        animate={{ opacity: 1, scale: 1 }} transition={entrance}>
      <span className="mf-event-list__icon" data-tone={item.status?.tone ?? 'neutral'} aria-hidden="true">{item.icon ?? <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5h12M4 10h8M4 15h10"/><circle cx="16" cy="14" r="2"/></svg>}</span>
      <div className="mf-event-list__body"><div className="mf-event-list__heading"><span className="mf-event-list__title">{item.title}</span><time dateTime={item.dateTime}>{item.timestamp}</time></div>
        {item.description && <p className="mf-event-list__description">{item.description}</p>}
        {item.status && <span className="mf-event-list__status" data-tone={item.status.tone ?? 'neutral'}>{item.status.label}</span>}
      </div>
      {onItemAction && <button type="button" className="mf-event-list__action" aria-label={item.actionLabel ?? `View event ${item.id}`} disabled={item.disabled}
        aria-pressed={selectedId === item.id} onClick={() => onItemAction(item.id)}>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg>
      </button>}
      </motion.div>
    </motion.li>)}
  </ol>;
}
