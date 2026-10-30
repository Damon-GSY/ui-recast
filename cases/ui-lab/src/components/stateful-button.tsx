import { useId, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './stateful-button.css';

export type StatefulButtonState = { status: 'idle' | 'pending' | 'success' } | { status: 'error'; reason: string };
export interface StatefulButtonProps {
  state: StatefulButtonState;
  onAction: () => void;
  onRetry?: () => void;
  label?: string;
  pendingLabel?: string;
  successLabel?: string;
  retryLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

function StateIcon({ status }: { status: StatefulButtonState['status'] }) {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {status === 'pending' ? <path d="M17 10a7 7 0 1 1-7-7"/> : status === 'success' ? <><circle cx="10" cy="10" r="7"/><path d="m7 10 2 2 4-4"/></> : status === 'error' ? <><path d="M4.3 6.1A7 7 0 1 1 3 11M3.5 3.5v4h4"/></> : <><path d="m3 9 14-6-6 14-2-6-6-2Zm6 2 4-4"/></>}
  </svg>;
}

/** No timers or inferred outcomes: every state is supplied by the caller. */
export function StatefulButton({ state, onAction, onRetry, label = '发送消息', pendingLabel = '发送中', successLabel = '已发送', retryLabel = '重试', icon, disabled = false, className = '' }: StatefulButtonProps) {
  const errorId = useId();
  const reduced = useReducedMotion();
  const { status } = state;
  const pending = status === 'pending';
  const locked = disabled || pending || status === 'success';
  const text = pending ? pendingLabel : status === 'success' ? successLabel : status === 'error' ? retryLabel : label;
  return <div className={`mfs-button ${className}`} data-state={status}>
    <motion.button type="button" className="mfs-button__control" disabled={disabled}
      aria-disabled={locked || undefined} aria-busy={pending || undefined} aria-describedby={status === 'error' ? errorId : undefined}
      onClick={() => { if (!locked) (status === 'error' ? onRetry ?? onAction : onAction)(); }}
      whileTap={locked || reduced ? undefined : { scale: .98 }} transition={{ duration: reduced ? 0 : .1 }}>
      <span className="mfs-button__icon" aria-hidden="true"><AnimatePresence mode="sync" initial={false}>
        <motion.span key={status} className={pending ? 'mfs-button__spinner' : undefined}
          initial={{ opacity: 0, scale: reduced ? 1 : 0 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: reduced ? 0 : .2, delay: !reduced && status === 'success' ? .2 : 0, ease: [0, 0, .58, 1] } }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0, transition: { duration: reduced ? 0 : .2, ease: [0, 0, .58, 1] } }}>
          {status === 'idle' && icon ? icon : <StateIcon status={status}/>}
        </motion.span>
      </AnimatePresence></span>
      <span className="mfs-button__label">{text}</span>
    </motion.button>
    <span className="mfs-button__sr" role="status" aria-live="polite">{status === 'pending' || status === 'success' ? text : ''}</span>
    {status === 'error' && <p id={errorId} className="mfs-button__error" role="alert">{state.reason}</p>}
  </div>;
}
