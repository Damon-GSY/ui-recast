'use client';

import {
  useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore,
  type CSSProperties, type KeyboardEvent, type ReactNode, type Ref,
} from 'react';
import { motion } from 'motion/react';
import './otp-input.css';

export type OtpStatus = 'idle' | 'verifying' | 'error' | 'success';
export type OtpInputVariant = 'clean' | 'classic';
export type OtpInputHandle = {
  focus: (index?: number) => void;
  clear: () => void;
};

export type OtpInputProps = {
  length?: number;
  separator?: boolean | number;
  numeric?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  status?: OtpStatus;
  errorMessage?: ReactNode;
  clearOnError?: boolean;
  successLabel?: string;
  onResend?: () => void;
  resendIn?: number;
  align?: 'start' | 'center';
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  className?: string;
  variant?: OtpInputVariant;
  theme?: 'light' | 'dark';
  reduceMotion?: boolean;
  id?: string;
  name?: string;
  form?: string;
  required?: boolean;
  ref?: Ref<OtpInputHandle>;
};

const ease = [.22, 1, .36, 1] as const;
const sanitize = (text: string, numeric: boolean, length: number) =>
  text.toUpperCase().replace(numeric ? /[^0-9]/g : /[^A-Z0-9]/g, '').slice(0, length);

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
const getServerReducedMotion = () => false;

/** One native input owns the value; the slots are a presentation of that input. */
export function OtpInput({
  length = 6, separator = false, numeric = true, value, defaultValue = '', onChange,
  onComplete, status = 'idle', errorMessage = "That code didn't work. Try again.",
  clearOnError = true, successLabel = 'Verified', onResend, resendIn = 30,
  align = 'start', disabled = false, autoFocus = false, label = 'Verification code',
  className = '', variant = 'clean', theme, reduceMotion = false,
  id, name, form, required, ref,
}: OtpInputProps) {
  const count = Math.max(1, Math.floor(length));
  const clean = (text: string) => sanitize(text, numeric, count);
  const [internalValue, setInternalValue] = useState(() => clean(defaultValue));
  const code = clean(value ?? internalValue);
  const [active, setActive] = useState(Math.min(code.length, count - 1));
  const [focused, setFocused] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [bulkFill, setBulkFill] = useState(false);
  const [remaining, setRemaining] = useState(Math.max(0, Math.ceil(resendIn)));
  const [announcement, setAnnouncement] = useState('');
  const [resendCycle, setResendCycle] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const pillContentRef = useRef<HTMLSpanElement>(null);
  const errorTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const selection = useRef<{ start: number; end: number } | null>(null);
  const edited = useRef(false);
  const currentCode = useRef(code);
  const latest = useRef({ onChange, onComplete, controlled: value !== undefined });
  const [geometry, setGeometry] = useState({
    width: 0, height: 0, pillWidth: 0, gap: 0, boxes: [] as { x: number; width: number }[],
  });
  const systemReduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const instant = reduceMotion || systemReduced;
  const messageId = `${useId()}-error`;
  const locked = disabled || status === 'verifying' || status === 'success';
  const showError = status === 'error' && !dismissedError;
  const visualStatus = status === 'error' && dismissedError ? 'idle' : status;
  const split = separator === true ? Math.floor(count / 2) : Number(separator);
  const hasSeparator = split > 0 && split < count;

  useLayoutEffect(() => {
    currentCode.current = code;
    latest.current = { onChange, onComplete, controlled: value !== undefined };
  });

  function cancelErrorClear() {
    errorTimers.current.forEach(clearTimeout);
    errorTimers.current = [];
    setClearing(false);
  }

  function moveTo(index: number, nextCode = currentCode.current, focus = false) {
    const next = Math.max(0, Math.min(index, nextCode.length, count - 1));
    if (focus) inputRef.current?.focus({ preventScroll: true });
    setActive(next);
    selection.current = { start: next, end: Math.min(next + 1, nextCode.length) };
    // Also apply when a key moves to the already-active box (no React render).
    inputRef.current?.setSelectionRange(selection.current.start, selection.current.end);
  }

  function publish(next: string, userEdit: boolean, bulk = false) {
    const normalized = clean(next);
    if (userEdit) {
      cancelErrorClear();
      edited.current = true;
      setDismissedError(true);
      setBulkFill(bulk);
    }
    if (normalized === currentCode.current) return;
    currentCode.current = normalized;
    if (!latest.current.controlled) setInternalValue(normalized);
    latest.current.onChange?.(normalized);
    if (userEdit && normalized.length === count) latest.current.onComplete?.(normalized);
  }

  useImperativeHandle(ref, () => ({
    focus(index) {
      if (!locked) moveTo(index ?? Math.min(code.length, count - 1), code, true);
    },
    clear() {
      cancelErrorClear();
      publish('', false);
      moveTo(0, '');
    },
  }));

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || !focused) return;
    const next = Math.min(active, code.length, count - 1);
    if (next !== active) setActive(next);
    const range = selection.current ?? { start: next, end: Math.min(next + 1, code.length) };
    input.setSelectionRange(Math.min(range.start, code.length), Math.min(range.end, code.length));
    selection.current = null;
  }, [code, active, focused, count]);

  useEffect(() => {
    if (autoFocus && !locked) inputRef.current?.focus({ preventScroll: true });
    // autoFocus is a mount-time option; status changes must not steal focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const slots = slotsRef.current;
    const pill = pillContentRef.current;
    if (!slots || !pill) return;
    const measure = () => {
      const boxes = [...slots.querySelectorAll<HTMLElement>('[data-otp-slot]')]
        .map(box => ({ x: box.offsetLeft, width: parseFloat(getComputedStyle(box).width) }));
      const next = { width: slots.getBoundingClientRect().width,
        height: slots.getBoundingClientRect().height, gap: parseFloat(getComputedStyle(slots).columnGap) || 0, pillWidth: pill.getBoundingClientRect().width, boxes };
      setGeometry(old => old.width === next.width && old.height === next.height &&
        old.pillWidth === next.pillWidth && old.boxes.length === boxes.length &&
        old.boxes.every((box, index) => box.x === boxes[index].x && box.width === boxes[index].width)
        ? old : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slots);
    observer.observe(pill);
    return () => observer.disconnect();
  }, [count, split, variant, successLabel]);

  useEffect(() => {
    cancelErrorClear();
    setDismissedError(false);
    if (status !== 'error' || !clearOnError || disabled) return;
    const rejectedCode = currentCode.current;
    errorTimers.current = [
      setTimeout(() => setClearing(true), instant ? 0 : 700),
      setTimeout(() => {
        if (currentCode.current === rejectedCode) {
          publish('', false);
          moveTo(0, '');
        }
        setClearing(false);
      }, instant ? 0 : 900),
    ];
    return () => errorTimers.current.forEach(clearTimeout);
    // Callbacks are read through latest so parent renders don't restart the shake/clear.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, clearOnError, disabled, instant]);

  useEffect(() => {
    if (!onResend || status === 'success') return;
    const deadline = Date.now() + Math.max(0, resendIn) * 1000;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) {
        setAnnouncement('You can resend the code now');
        clearInterval(timer);
      }
    };
    setRemaining(Math.max(0, Math.ceil(resendIn)));
    const timer = setInterval(tick, 250);
    if (resendIn <= 0) tick();
    return () => clearInterval(timer);
  }, [Boolean(onResend), resendIn, resendCycle, status === 'success']);

  const selectionRange = () => ({
    start: inputRef.current?.selectionStart ?? active,
    end: inputRef.current?.selectionEnd ?? active,
  });

  function insert(text: string, wholeCode = false) {
    const incoming = clean(text);
    if (!incoming) return;
    const { start, end } = selectionRange();
    const replaceAll = wholeCode || incoming.length === count;
    const at = replaceAll ? 0 : Math.min(start, code.length, count - 1);
    const next = replaceAll ? incoming : clean(code.slice(0, at) + incoming +
      code.slice(Math.max(end, at + incoming.length)));
    publish(next, true, incoming.length > 1);
    moveTo(at + incoming.length, next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (locked || event.nativeEvent.isComposing) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.shiftKey && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const { start, end } = selectionRange();
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      moveTo(event.key === 'Home' ? 0 : event.key === 'End' ? code.length :
        active + (event.key === 'ArrowLeft' ? -1 : 1));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      const at = end - start > 1 ? start : event.key === 'Backspace' && active >= code.length
        ? Math.max(0, code.length - 1) : active;
      const next = code.slice(0, at) + code.slice(end - start > 1 ? end : at + 1);
      publish(next, true);
      moveTo(event.key === 'Backspace' ? end - start > 1 ? start : active - 1 : at, next);
    } else if (event.key.length === 1) {
      event.preventDefault();
      insert(event.key);
    }
  }

  const columns = Array.from({ length: count }, (_, index) =>
    `${hasSeparator && index === split ? '8px ' : ''}minmax(0, 1fr)`).join(' ');
  const ring = geometry.boxes[Math.min(active, count - 1)];
  const success = status === 'success';
  const liveMessage = status === 'verifying' ? 'Verifying code' : success ? successLabel
    : showError ? errorMessage : announcement;

  return (
    <div className={`rui-otp rui-otp--${variant} ${className}`} data-theme={theme}
      data-state={visualStatus} data-align={align} data-disabled={disabled || undefined}
      data-reduced-motion={instant || undefined} data-clearing={clearing || undefined}
      style={{ '--otp-count': count, '--otp-gap-count': count - 1 + Number(hasSeparator),
        '--otp-separator-width': hasSeparator ? '8px' : '0px' } as CSSProperties}>
      <motion.div className="rui-otp__field" initial={false}
        animate={{ x: showError && !instant ? [0, -4, 4, -3, 2, 0] : 0 }}
        transition={{ duration: instant ? 0 : .38 }}>
        <div ref={slotsRef} className="rui-otp__slots" style={{ gridTemplateColumns: columns }} aria-hidden="true">
          {Array.from({ length: count }, (_, index) => [
            hasSeparator && index === split && <span key={`sep-${index}`} className="rui-otp__separator" />,
            <motion.span key={index} data-otp-slot={index} data-filled={Boolean(code[index]) || undefined}
              className="rui-otp__box" style={{ '--otp-shimmer-delay': `${index * .05}s` } as CSSProperties} initial={false}
              animate={{ x: success && geometry.boxes[index]
                ? ((count - 1) / 2 - index) * (geometry.boxes[index].width + geometry.gap) : 0,
              scale: success ? .7 : 1, opacity: success ? 0 : 1 }}
              transition={{ duration: instant ? 0 : .38, ease,
                opacity: { duration: instant ? 0 : .26, delay: success && !instant ? .1 : 0, ease: [.25, .1, .25, 1] } }}>
              <motion.span className="rui-otp__digit-fade" initial={false}
                animate={{ opacity: clearing ? 0 : 1 }} transition={{ duration: instant ? 0 : .2 }}>
                {code[index] && <motion.span key={code[index]} className="rui-otp__digit"
                  initial={edited.current && !instant ? { opacity: 0, y: 5, scale: .9, filter: 'blur(3px)' } : false}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: instant ? 0 : .24, ease, delay: bulkFill && !instant ? index * .035 : 0 }}>
                  {code[index]}
                </motion.span>}
              </motion.span>
            </motion.span>,
          ])}
          <motion.span className="rui-otp__ring" initial={false}
            animate={{ x: ring?.x ?? 0, width: ring?.width ?? 0, height: geometry.height,
              opacity: focused && !locked && ring ? 1 : 0 }}
            transition={{ duration: instant ? 0 : .26, ease, opacity: { duration: instant ? 0 : .18 } }}>
            {!code[active] && <span className="rui-otp__caret" />}
          </motion.span>
          <span className="rui-otp__pill-position">
            <motion.span className="rui-otp__pill" initial={false}
              animate={{ width: success ? Math.round(geometry.pillWidth) || 'max-content' : geometry.width,
                opacity: success ? 1 : 0 }}
              transition={{ width: { duration: instant ? 0 : .3, delay: success && !instant ? .24 : 0, ease },
                opacity: { duration: instant ? 0 : .16, delay: success && !instant ? .14 : 0, ease: [.25, .1, .25, 1] } }}>
              <motion.span ref={pillContentRef} className="rui-otp__pill-content" initial={false}
                animate={{ opacity: success ? 1 : 0 }}
                transition={{ duration: instant ? 0 : .16, delay: success && !instant ? .5 : 0 }}>
                <svg className="rui-otp__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path d="M5.5 12.5l4 4L18.5 8" initial={false} animate={{ pathLength: success ? 1 : 0 }}
                    transition={{ duration: instant ? 0 : .24, delay: success && !instant ? .5 : 0, ease }} />
                </svg>
                <span>{successLabel}</span>
              </motion.span>
            </motion.span>
          </span>
        </div>
        <input ref={inputRef} id={id} name={name} form={form} required={required}
          className="rui-otp__input" type="text" value={code}
          inputMode={numeric ? 'numeric' : 'text'} autoComplete="one-time-code"
          pattern={numeric ? `[0-9]{${count}}` : `[A-Za-z0-9]{${count}}`}
          autoCapitalize="characters" autoCorrect="off" spellCheck={false}
          aria-label={`${label}, ${count} ${numeric ? 'digits' : 'characters'}`}
          aria-invalid={showError || undefined} aria-describedby={showError ? messageId : undefined}
          aria-busy={status === 'verifying' || undefined} disabled={disabled} readOnly={locked}
          tabIndex={success ? -1 : 0}
          onFocus={() => { setFocused(true); moveTo(Math.min(code.length, count - 1)); }}
          onBlur={() => { setFocused(false); selection.current = null; }}
          onPointerDown={event => {
            if (locked) return;
            const slots = slotsRef.current;
            if (!slots) return;
            event.preventDefault();
            const x = event.clientX - slots.getBoundingClientRect().left;
            const nearest = geometry.boxes.reduce((best, box, index, boxes) =>
              Math.abs(x - box.x - box.width / 2) < Math.abs(x - boxes[best].x - boxes[best].width / 2) ? index : best, 0);
            moveTo(nearest, code, true);
          }}
          onKeyDown={handleKeyDown}
          onPaste={event => {
            event.preventDefault();
            if (!locked) insert(event.clipboardData.getData('text'));
          }}
          onCut={event => {
            if (locked) { event.preventDefault(); return; }
            const { start, end } = selectionRange();
            if (start === end) return;
            event.preventDefault();
            event.clipboardData.setData('text/plain', code.slice(start, end));
            const next = code.slice(0, start) + code.slice(end);
            publish(next, true);
            moveTo(start, next);
          }}
          onChange={event => {
            if (locked) return;
            const raw = event.currentTarget.value;
            const cursor = clean(raw.slice(0, event.currentTarget.selectionStart ?? raw.length)).length;
            const next = clean(raw);
            publish(next, true, Math.abs(next.length - code.length) > 1);
            moveTo((event.nativeEvent as InputEvent).inputType === 'deleteContentBackward' ? active - 1 : cursor, next);
          }} />
      </motion.div>
      <div className="rui-otp__message" data-visible={showError || undefined}>
        <div className="rui-otp__message-clip">
          <p id={messageId} className="rui-otp__message-text" aria-hidden={!showError}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8v4.5M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <span>{errorMessage}</span>
          </p>
        </div>
      </div>
      {onResend && <div className="rui-otp__resend" aria-hidden={success || undefined}>
        <span>Didn't get a code?</span>
        {remaining > 0 ? <span className="rui-otp__wait" key="countdown">Resend in{' '}
          <span className="rui-otp__time">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span>
        </span> : <button className="rui-otp__resend-button" key="resend" type="button"
          disabled={locked} tabIndex={success ? -1 : 0} onClick={() => {
            cancelErrorClear();
            publish('', false);
            setDismissedError(true);
            setRemaining(Math.max(0, Math.ceil(resendIn)));
            setResendCycle(cycle => cycle + 1);
            setAnnouncement('Code resent');
            onResend();
            moveTo(0, '', true);
          }}>Resend code</button>}
      </div>}
      <span className="rui-otp__live" role="status" aria-live="polite" aria-atomic="true">{liveMessage}</span>
    </div>
  );
}
