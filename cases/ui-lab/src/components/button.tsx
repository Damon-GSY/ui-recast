'use client';

import {
  forwardRef, useLayoutEffect, useRef, useSyncExternalStore,
  type ButtonHTMLAttributes, type ReactNode,
} from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import './button.css';

export type ButtonAppearance = 'classic' | 'clean';
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: ButtonAppearance;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  reduceMotion?: boolean;
};

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
function getReducedMotion() { return window.matchMedia(reducedMotionQuery).matches; }
function getServerReducedMotion() { return false; }

/** Watch rendered content, so freshly created but identical JSX does not replay. */
function ContentSlot({ children, kind, instant }: {
  children: ReactNode;
  kind: 'label' | 'icon';
  instant: boolean;
}) {
  const shell = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = shell.current;
    const inner = content.current;
    if (!element || !inner) return;
    let animation: ReturnType<typeof animate> | undefined;
    const reveal = () => {
      animation?.stop();
      animation = animate(element, {
        opacity: instant ? 1 : [0, 1],
        filter: instant ? 'blur(0px)' : [kind === 'label' ? 'blur(3px)' : 'blur(4px)', 'blur(0px)'],
        y: instant || kind === 'icon' ? 0 : ['25%', '0%'],
        scale: instant || kind === 'label' ? 1 : [0.7, 1],
      }, { duration: instant ? 0 : kind === 'label' ? 0.48 : 0.52, ease: [0.25, 1, 0.5, 1] });
    };
    reveal();
    const observer = new MutationObserver(reveal);
    observer.observe(inner, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => { observer.disconnect(); animation?.stop(); };
  }, [instant, kind]);

  return <span ref={shell} className={`affect-button__${kind}`} aria-hidden={kind === 'icon' || undefined}>
    <span ref={content} className="affect-button__slot-content">{children}</span>
  </span>;
}

function Spinner() {
  return <svg className="affect-button__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" opacity=".2" />
    <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

/** A native button: omitted type keeps the browser's submit default; ref is the button. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  appearance = 'classic', variant = 'primary', size = 'md',
  icon, iconRight, loading = false, reduceMotion = false,
  children, disabled, className = '', onClick, onClickCapture, ...props
}, ref) {
  const prefersReducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const instant = reduceMotion || prefersReducedMotion;
  const content = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | string>('auto');
  const measure = useRef<(() => void) | null>(null);
  const hasLabel = children !== undefined && children !== null && children !== false && children !== true && children !== '';
  const leading = loading ? <Spinner /> : icon;
  const trailing = loading && !hasLabel ? null : iconRight;
  const hasLeft = leading !== undefined && leading !== null && leading !== false;
  const hasRight = trailing !== undefined && trailing !== null && trailing !== false;

  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    let previous: number | undefined;
    let animation: ReturnType<typeof animate> | undefined;
    const update = () => {
      // CSS layout width excludes the outer button's 97% press transform.
      const next = Number.parseFloat(getComputedStyle(element).width);
      if (!Number.isFinite(next) || next === previous) return;
      animation?.stop();
      if (previous === undefined || instant) width.set(next);
      else animation = animate(width, next, { duration: 0.48, ease: [0.25, 1, 0.5, 1] });
      previous = next;
    };
    measure.current = update;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { observer.disconnect(); animation?.stop(); measure.current = null; };
  }, [instant, width]);

  useLayoutEffect(() => { measure.current?.(); });

  return <button {...props} ref={ref} disabled={disabled}
    className={`affect-button ${className}`.trim()}
    data-appearance={appearance} data-variant={variant} data-size={size}
    data-icon-only={!hasLabel || undefined} data-has-left={hasLeft || undefined}
    data-has-right={hasRight || undefined} data-loading={loading || undefined}
    data-reduce-motion={instant || undefined}
    aria-busy={loading ? true : props['aria-busy']}
    onClickCapture={event => {
      if (loading || disabled) { event.preventDefault(); event.stopPropagation(); return; }
      onClickCapture?.(event);
    }}
    onClick={event => {
      if (loading || disabled) { event.preventDefault(); event.stopPropagation(); return; }
      onClick?.(event);
    }}>
    <motion.span className="affect-button__width" style={{ width }}>
      <span ref={content} className="affect-button__content">
        {hasLeft && <ContentSlot kind="icon" instant={instant}>{leading}</ContentSlot>}
        {hasLabel && <ContentSlot kind="label" instant={instant}>
          <span className="affect-button__label-text">{children}</span>
        </ContentSlot>}
        {hasRight && <ContentSlot kind="icon" instant={instant}>{trailing}</ContentSlot>}
      </span>
    </motion.span>
  </button>;
});
