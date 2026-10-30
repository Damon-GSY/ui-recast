'use client';

import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { animate, useReducedMotion, type AnimationPlaybackControls } from 'motion/react';
import './auto-height.css';

export interface AutoHeightProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Optional disclosure mode. Children stay mounted; the caller owns aria-hidden/inert. */
  collapsed?: boolean;
  contentClassName?: string;
}

/** Observes natural content size, including font, image and width changes.
 * Height and overflow on the outer element are owned by this component.
 * Idle expanded content is unclipped; initial content does not animate from zero.
 */
export function AutoHeight({ children, collapsed = false, className = '', contentClassName = '', ...props }: AutoHeightProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const previous = useRef<number | null>(null);
  const measure = useRef<() => void>(() => {});
  const reduced = useReducedMotion();
  const latest = useRef({ collapsed, reduced });
  latest.current = { collapsed, reduced };

  useLayoutEffect(() => {
    const element = outer.current!;
    const content = inner.current!;
    let generation = 0;
    const settle = (isCollapsed: boolean) => {
      element.style.height = isCollapsed ? '0px' : 'auto';
      element.style.overflow = isCollapsed ? 'hidden' : 'visible';
      element.dataset.animating = 'false';
      animation.current = null;
    };
    measure.current = () => {
      const { collapsed: isCollapsed, reduced: reduce } = latest.current;
      const style = getComputedStyle(element);
      const chrome = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']
        .reduce((sum, key) => sum + (parseFloat(style[key as keyof CSSStyleDeclaration] as string) || 0), 0);
      const contentHeight = content.getBoundingClientRect().height;
      const target = isCollapsed ? 0 : contentHeight + chrome;
      // The disclosure's mask follows natural content height, not its animated
      // clipping box. At full height its fade reaches beyond the last pixel.
      element.style.setProperty('--mf-auto-height-content', `${contentHeight}px`);
      if (previous.current === target && !reduce) return;
      const from = animation.current ? element.getBoundingClientRect().height : previous.current;
      const token = ++generation;
      animation.current?.stop();
      previous.current = target;
      if (from === null || reduce || Math.abs(from - target) < 0.1) {
        settle(isCollapsed);
        return;
      }
      element.style.height = `${from}px`;
      element.style.overflow = 'hidden';
      element.dataset.animating = 'true';
      animation.current = animate(element, { height: target }, {
        type: 'spring', stiffness: 300, damping: 30, restDelta: 0.1,
        onComplete: () => { if (token === generation) settle(isCollapsed); },
      });
    };
    measure.current();
    const observer = new ResizeObserver(() => measure.current());
    observer.observe(content);
    return () => {
      generation++;
      observer.disconnect();
      animation.current?.stop();
      animation.current = null;
      previous.current = null;
      measure.current = () => {};
    };
  }, []);

  // React-driven updates are measured before paint; ResizeObserver covers all others.
  useLayoutEffect(() => { measure.current(); });

  return <div {...props} ref={outer} className={`mf-auto-height ${className}`} data-collapsed={collapsed || undefined}>
    <div ref={inner} className={`mf-auto-height__content ${contentClassName}`}>{children}</div>
  </div>;
}
