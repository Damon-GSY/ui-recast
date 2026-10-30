import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './copy-button.css';

export interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  pendingLabel?: string;
  retryLabel?: string;
  disabled?: boolean;
  onCopied?: (value: string) => void;
  onCopyError?: (error: Error) => void;
  className?: string;
}
type CopyState = { status: 'idle' | 'pending' | 'copied' } | { status: 'error'; message: string };

/** Each distinct value starts a fresh clipboard operation and clears previous feedback. */
export function CopyButton({ value, label = '复制', copiedLabel = '已复制', pendingLabel = '复制中', retryLabel = '重试复制', disabled = false, onCopied, onCopyError, className = '' }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>({ status: 'idle' });
  const pending = useRef(false);
  const alive = useRef(true);
  const activeCopy = useRef<object | undefined>(undefined);
  const id = useId();
  const reduced = useReducedMotion();
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  // Keep the control mounted so value changes can reverse the icon transition without losing focus.
  useLayoutEffect(() => {
    activeCopy.current = undefined;
    pending.current = false;
    setState({ status: 'idle' });
  }, [value]);
  async function copy() {
    if (disabled || pending.current) return;
    const operation = {};
    activeCopy.current = operation;
    pending.current = true;
    setState({ status: 'pending' });
    let failure: Error | undefined;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('当前页面无法使用剪贴板，请在 HTTPS 或本地页面重试。');
      await navigator.clipboard.writeText(value);
    } catch (error) {
      failure = error instanceof Error ? error : new Error('剪贴板写入失败，请重试。');
    }
    if (!alive.current || activeCopy.current !== operation) return;
    pending.current = false;
    if (failure) {
      const message = failure.name === 'NotAllowedError' ? '浏览器未允许访问剪贴板。请允许后重试。' : failure.message || '剪贴板写入失败，请重试。';
      setState({ status: 'error', message });
      onCopyError?.(failure);
    } else {
      setState({ status: 'copied' });
      onCopied?.(value);
    }
  }
  const text = state.status === 'copied' ? copiedLabel : state.status === 'pending' ? pendingLabel : state.status === 'error' ? retryLabel : label;
  return <div className={`mfc-copy ${className}`} data-state={state.status}>
    <motion.button type="button" className="mfc-copy__button" disabled={disabled} aria-disabled={state.status === 'pending' || undefined}
      aria-busy={state.status === 'pending' || undefined} aria-describedby={state.status === 'error' ? `${id}-error` : undefined}
      onClick={() => void copy()} whileTap={disabled || state.status === 'pending' || reduced ? undefined : { scale: .97 }} transition={{ duration: reduced ? 0 : .1 }}>
      <span className="mfc-copy__icon" aria-hidden="true"><AnimatePresence initial={false} mode="sync">
        <motion.svg key={state.status} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ opacity: 0, scale: reduced ? 1 : .5, filter: reduced ? 'blur(0px)' : 'blur(2px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: reduced ? 1 : .5, filter: reduced ? 'blur(0px)' : 'blur(2px)' }} transition={{ duration: reduced ? 0 : .15, ease: [.16, 1, .3, 1] }}>
          {state.status === 'copied' ? <path d="m4.5 10 3.5 3.5 7.5-7.5"/> : state.status === 'pending' ? <g className="mfc-copy__spinner"><circle cx="10" cy="10" r="7" opacity=".24"/><path d="M10 3a7 7 0 0 1 7 7"/></g> : state.status === 'error' ? <><path d="M4 6a7 7 0 1 1-1 6M3 3v4h4"/></> : <><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M12 5V4a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v6a1 1 0 0 0 1 1h1"/></>}
        </motion.svg>
      </AnimatePresence></span><span>{text}</span>
    </motion.button>
    <span className="mfc-copy__sr" role="status" aria-live="polite">{state.status === 'copied' || state.status === 'pending' ? text : ''}</span>
    {state.status === 'error' && <p className="mfc-copy__error" id={`${id}-error`} role="alert">{state.message}</p>}
  </div>;
}
