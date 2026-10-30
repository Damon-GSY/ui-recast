'use client';

import { useId, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './stacked-empty-state.css';

export type StackedEmptyStateKind = 'rules' | 'groups' | 'stash';
export type StackedEmptyStateProps = {
  kind?: StackedEmptyStateKind;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  /** Three decorative icons, left to right. Omit to use original vector artwork. */
  icons?: readonly [ReactNode, ReactNode, ReactNode];
  className?: string;
};

function EmptyIcon({ kind, layer }: { kind: StackedEmptyStateKind; layer: number }) {
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'rules' ? layer === 1 ? <><rect x="14" y="9" width="36" height="46" rx="7"/><path d="M23 23h18M23 33h18M23 43h11"/><circle cx="28" cy="23" r="3" fill="var(--mf-stack-paper)"/><circle cx="37" cy="33" r="3" fill="var(--mf-stack-paper)"/></> : layer === 0 ? <><path d="m17 18 14 14-14 14M33 46h14"/><path opacity=".3" d="M13 10h38v44H13z"/></> : <><path d="M19 16h26v32H19zM25 25h14M25 32h9"/><circle cx="45" cy="46" r="9" fill="var(--mf-stack-paper)"/><path d="m41 46 3 3 5-6"/></>
      : kind === 'groups' ? layer === 1 ? <><path d="M9 23a5 5 0 0 1 5-5h13l5 6h18a5 5 0 0 1 5 5v20a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5Z"/><path d="M17 38h30M17 44h19"/></> : layer === 0 ? <><rect x="12" y="13" width="28" height="32" rx="5"/><path d="M23 51h22a6 6 0 0 0 6-6V24"/><path d="M21 23h10M21 30h10"/></> : <><circle cx="24" cy="24" r="7"/><circle cx="43" cy="27" r="5"/><path d="M11 48v-5a13 13 0 0 1 26 0v5M40 39a10 10 0 0 1 13 9"/></>
      : layer === 1 ? <><path d="m12 26 7-12h26l7 12v25H12z"/><path d="M12 31h12l3 7h10l3-7h12M23 22h18"/></> : layer === 0 ? <><path d="M18 11h22l8 8v34H18zM40 11v10h8M25 30h15M25 38h15M25 46h9"/></> : <><rect x="12" y="16" width="40" height="31" rx="5"/><path d="m13 39 12-11 9 8 7-5 10 10"/><circle cx="40" cy="24" r="3"/></>}
  </svg>;
}

/** Decorative stack plus exactly one caller-owned primary action. */
export function StackedEmptyState({ kind = 'rules', title, description, actionLabel,
  onAction, disabled = false, icons, className = '' }: StackedEmptyStateProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  // The center leads; both side cards open from upright after it.
  // Keep the entrance delay off scale so hover and reverse respond immediately.
  const spring = { type: 'spring' as const, stiffness: 300, damping: 22 };
  return <section className={`mf-stack ${className}`} aria-labelledby={`${uid}-title`} data-kind={kind}>
    <div className="mf-stack__illustration" aria-hidden="true">
      <div className="mf-stack__ambient"/>
      {[0, 1, 2].map(layer => <motion.div key={layer} className={`mf-stack__card mf-stack__card--${layer}`}
        initial={reduced ? false : { opacity: 0, y: layer === 1 ? 10 : 29, rotate: 0, scale: 1 }}
        animate={{ opacity: 1, y: layer === 1 ? 0 : 19, rotate: layer === 0 ? -10 : layer === 2 ? 10 : 0, scale: 1 }}
        whileHover={reduced ? undefined : { scale: 1.02 }}
        transition={reduced ? { duration: 0 } : {
          ...spring,
          y: { ...spring, delay: layer === 1 ? 0 : .1 },
          rotate: { ...spring, delay: layer === 1 ? 0 : .1 },
          opacity: { duration: .2, delay: layer === 1 ? 0 : .1 },
          scale: { ...spring, delay: 0 },
        }}>
        <div className="mf-stack__card-top"><i/><i/><i/></div>
        <div className="mf-stack__icon">{icons?.[layer] ?? <EmptyIcon kind={kind} layer={layer}/>}</div>
        <div className="mf-stack__lines"><span/><span/></div>
        <div className="mf-stack__light"/>
      </motion.div>)}
    </div>
    <div className="mf-stack__copy"><h2 id={`${uid}-title`}>{title}</h2><p>{description}</p></div>
    <button type="button" className="mf-stack__action" disabled={disabled} onClick={onAction}>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 4v12M4 10h12"/></svg>{actionLabel}
    </button>
  </section>;
}
