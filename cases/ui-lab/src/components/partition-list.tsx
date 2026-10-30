import { useId, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './partition-list.css';

export interface PartitionGroup { id: string; label: string; description?: ReactNode; emptyMessage?: ReactNode }
export interface PartitionItem { id: string; groupId: string; label: string; description?: ReactNode; icon?: ReactNode; disabled?: boolean }
export interface PartitionMove { itemId: string; toGroupId: string }
export interface PartitionListProps {
  groups: readonly PartitionGroup[];
  /** Each item belongs to a supplied group; IDs must be unique. Caller order is preserved within groups. */
  items: readonly PartitionItem[];
  onMove: (itemId: string, toGroupId: string) => void;
  pending?: readonly PartitionMove[];
  errors?: Readonly<Record<string, string | undefined>>;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Requests a move. Only a new items prop can relocate a row; no optimistic state or timers. */
export function PartitionList({ groups, items, onMove, pending = [], errors = {}, disabled = false,
  label = 'Menu partitions', className = '' }: PartitionListProps) {
  const instance = useId();
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 320, damping: 25, mass: .8 };
  return <ol className={`mf-partition-list ${className}`} aria-label={label}>
    {groups.flatMap(group => {
      const groupItems = items.filter(item => item.groupId === group.id);
      const groupHeading = `${instance}-${group.id}`;
      return [<motion.li key={`group:${group.id}`} layout={!reducedMotion && 'position'} transition={transition} role="presentation" className="mf-partition-list__group">
        <h3 id={groupHeading}>{group.label}<span aria-label={`${groupItems.length} items`}>{groupItems.length}</span></h3>
        {group.description && <p>{group.description}</p>}
      </motion.li>, ...groupItems.map(item => {
        const move = pending.find(request => request.itemId === item.id);
        const error = errors[item.id];
        return <motion.li key={`item:${item.id}`} data-partition-id={item.id} data-group-id={group.id}
          layout={!reducedMotion && 'position'} initial={false} transition={transition}
          className="mf-partition-list__item" aria-describedby={groupHeading} aria-busy={Boolean(move)}>
          <div className="mf-partition-list__row"><span className="mf-partition-list__icon" aria-hidden="true">{item.icon ?? <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="14" height="12" rx="3"/><path d="M7 7v6m3-6h4m-4 3h4"/></svg>}</span>
            <div className="mf-partition-list__copy"><span>{item.label}</span>{item.description && <p>{item.description}</p>}</div>
            <div className="mf-partition-list__destinations" role="group" aria-label={`Partition for ${item.label}`}>
              {groups.map(destination => <motion.button key={destination.id} type="button"
                aria-label={`${destination.label}: ${item.label}`} aria-pressed={group.id === destination.id}
                disabled={disabled || item.disabled || Boolean(move)}
                whileTap={reducedMotion ? undefined : { scale: .97 }}
                onClick={() => { if (destination.id !== group.id) onMove(item.id, destination.id); }}>
                {destination.label}
              </motion.button>)}
            </div>
          </div>
          {move && <p className="mf-partition-list__pending" role="status"><svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="5.5" opacity=".25"/><path d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5"/></svg>Moving to {groups.find(candidate => candidate.id === move.toGroupId)?.label ?? move.toGroupId}…</p>}
          {error && <p className="mf-partition-list__error" role="alert">{error}</p>}
        </motion.li>;
      }), ...(!groupItems.length ? [<motion.li key={`empty:${group.id}`} role="presentation" layout={!reducedMotion && 'position'} transition={transition} className="mf-partition-list__empty">{group.emptyMessage ?? 'No items in this partition.'}</motion.li>] : [])];
    })}
  </ol>;
}
