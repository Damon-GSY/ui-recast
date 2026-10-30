'use client';

import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import './expandable-cards.css';

export type ExpandableCardItem = {
  id: string;
  title: string;
  description?: string;
  /** Decorative thumbnail; use a non-interactive node. */
  icon?: ReactNode;
  meta?: string;
  disabled?: boolean;
  /** Detail content and any actions belong to the application. */
  content: ReactNode;
};

export type ExpandableCardsProps = {
  items: readonly ExpandableCardItem[];
  selectedId: string | null;
  onSelectedIdChange: (id: string | null) => void;
  label: string;
  closeLabel?: string;
  className?: string;
};

/** A controlled list-to-dialog expansion. No data mutation or demo responses. */
export function ExpandableCards({ items, selectedId, onSelectedIdChange, label,
  closeLabel = 'Close details', className = '' }: ExpandableCardsProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const returnTarget = useRef<HTMLElement | null>(null);
  const activeAnimations = useRef<Animation[]>([]);
  const releaseGeometry = useRef<() => void>(() => {});
  const scrim = useRef<HTMLDivElement>(null);
  const scrollRestore = useRef<string | null>(null);
  const retained = useRef<ExpandableCardItem | null>(null);
  const active = items.find(item => item.id === selectedId && !item.disabled) ?? null;
  if (active) retained.current = active;
  const shown = active ?? retained.current;

  useLayoutEffect(() => {
    const root = dialog.current;
    const surface = panel.current;
    const shade = scrim.current;
    if (!root || !surface || !shade || (!active && !root.open)) return;
    const parts = {
      icon: surface.querySelector<HTMLElement>('.mf-expandable__detail-icon'),
      title: surface.querySelector<HTMLElement>('.mf-expandable__heading h2'),
      description: surface.querySelector<HTMLElement>('.mf-expandable__heading p'),
      content: surface.querySelector<HTMLElement>('.mf-expandable__content'),
      close: surface.querySelector<HTMLElement>('.mf-expandable__close'),
    };
    const snapshot = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return { rect: element.getBoundingClientRect(), opacity: style.opacity,
        fontSize: style.fontSize, borderRadius: style.borderRadius, boxShadow: style.boxShadow };
    };
    // Read the displayed geometry BEFORE cancelling; reverse from these pixels.
    const opening = !root.open;
    const interrupted = activeAnimations.current.length > 0;
    const priorSurface = snapshot(surface);
    const priorParts = Object.fromEntries(Object.entries(parts).filter(([, node]) => node)
      .map(([key, node]) => [key, snapshot(node!)]));
    const priorShade = getComputedStyle(shade).opacity;
    const priorGlyphWidth = parts.icon?.querySelector('svg')?.getBoundingClientRect().width;
    activeAnimations.current.forEach(animation => animation.cancel());
    activeAnimations.current = [];
    releaseGeometry.current();

    const finishClose = () => {
      root.close();
      root.removeAttribute('data-closing');
      if (scrollRestore.current !== null) {
        document.body.style.overflow = scrollRestore.current;
        scrollRestore.current = null;
      }
      if (returnTarget.current?.isConnected) returnTarget.current.focus({ preventScroll: true });
    };
    if (active) {
      root.removeAttribute('data-closing');
      if (opening) {
        returnTarget.current = triggers.current.get(active.id) ?? (document.activeElement as HTMLElement);
        scrollRestore.current = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        root.showModal();
      } else returnTarget.current = triggers.current.get(active.id) ?? returnTarget.current;
    } else root.dataset.closing = 'true';
    if (reduced) {
      if (!active) finishClose();
      return;
    }
    if (active && !opening && !interrupted) return;

    const trigger = returnTarget.current;
    const natural = snapshot(surface);
    const row = trigger?.getBoundingClientRect() ?? natural.rect;
    const from = opening ? row : priorSurface.rect;
    const to = active ? natural.rect : row;
    const targets = Object.fromEntries(Object.entries(parts).filter(([, node]) => node)
      .map(([key, node]) => [key, snapshot(node!)]));
    const rowParts: Record<string, HTMLElement | null | undefined> = {
      icon: trigger?.querySelector<HTMLElement>('.mf-expandable__icon'),
      title: trigger?.querySelector<HTMLElement>('.mf-expandable__title'),
      description: trigger?.querySelector<HTMLElement>('.mf-expandable__description'),
    };
    const duration = active ? 380 : 300;
    const animations: Animation[] = [];
    const animate = (node: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions = {}) => {
      const animation = node.animate(frames, { duration, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both', ...options });
      animations.push(animation);
      return animation;
    };
    // The shell changes its actual box; text is never a scaled descendant.
    surface.style.position = 'fixed';
    surface.style.margin = '0';
    surface.style.maxHeight = 'none';
    surface.style.maxWidth = 'none';
    surface.style.overflow = 'hidden';
    const box = (rect: DOMRect) => ({ left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    const shell = animate(surface, [
      { ...box(from), borderRadius: opening && trigger ? getComputedStyle(trigger).borderRadius : priorSurface.borderRadius,
        boxShadow: opening ? '0 0 0 #00000000' : priorSurface.boxShadow },
      { ...box(to), borderRadius: active || !trigger ? natural.borderRadius : getComputedStyle(trigger).borderRadius,
        boxShadow: active ? natural.boxShadow : '0 0 0 #00000000' },
    ]);
    for (const [key, node] of Object.entries(parts)) {
      if (!node) continue;
      const target = targets[key];
      const matching = rowParts[key];
      const rowPart = matching ? snapshot(matching) : null;
      const start = opening ? rowPart ?? target : priorParts[key];
      const end = active ? target : rowPart ?? target;
      const startParent = opening && !rowPart ? natural.rect : from;
      const endParent = !active && !rowPart ? natural.rect : to;
      const shared = !!rowPart;
      node.style.position = 'absolute';
      node.style.margin = '0';
      // Freeze the final content width so intermediate shell widths cannot
      // repeatedly rewrap fields. Shared title/description keep their own boxes.
      const position = (state: typeof target, parent: DOMRect) => ({
        left: `${state.rect.left - parent.left}px`, top: `${state.rect.top - parent.top}px`,
        width: `${state.rect.width}px`, height: `${state.rect.height}px`,
        fontSize: state.fontSize, borderRadius: state.borderRadius,
      });
      animate(node, [
        { ...position(start, startParent), opacity: opening && !shared ? 0 : start.opacity,
          transform: opening && !shared ? 'translateY(10px)' : 'none' },
        { ...position(end, endParent), opacity: active || shared ? 1 : 0, transform: 'none' },
      ], shared ? {} : { duration: active ? 220 : 120, delay: active && opening ? 80 : 0 });
    }
    const glyph = parts.icon?.querySelector('svg');
    const smallGlyph = rowParts.icon?.querySelector('svg');
    if (glyph && smallGlyph) {
      const large = getComputedStyle(glyph).width;
      const small = getComputedStyle(smallGlyph).width;
      const current = opening ? small : `${priorGlyphWidth ?? parseFloat(large)}px`;
      animate(glyph as unknown as HTMLElement, [{ width: current, height: current },
        { width: active ? large : small, height: active ? large : small }]);
    }
    animate(shade, [{ opacity: opening ? 0 : priorShade }, { opacity: active ? 1 : 0 }], { duration: active ? 240 : 260, easing: 'ease-out' });
    const release = () => {
      surface.removeAttribute('style');
      Object.values(parts).forEach(node => node?.removeAttribute('style'));
    };
    releaseGeometry.current = release;
    activeAnimations.current = animations;
    shell.onfinish = () => {
      animations.forEach(animation => animation.cancel());
      activeAnimations.current = [];
      release();
      if (!active) finishClose();
    };
  }, [active?.id, reduced]);

  useLayoutEffect(() => {
    const root = dialog.current;
    return () => {
      activeAnimations.current.forEach(animation => animation.cancel());
      activeAnimations.current = [];
      releaseGeometry.current();
      root?.close();
      if (scrollRestore.current !== null) {
        document.body.style.overflow = scrollRestore.current;
        scrollRestore.current = null;
      }
      if (returnTarget.current?.isConnected) returnTarget.current.focus({ preventScroll: true });
    };
  }, []);

  return <div className={`mf-expandable ${className}`}>
    <ul className="mf-expandable__list" aria-label={label}>
      {items.map(item => <li key={item.id}>
        <button type="button" className="mf-expandable__trigger" disabled={item.disabled}
          ref={node => { if (node) triggers.current.set(item.id, node); else triggers.current.delete(item.id); }}
          aria-haspopup="dialog" aria-expanded={active?.id === item.id} aria-controls={`${uid}-dialog`}
          onClick={() => onSelectedIdChange(item.id)}>
          <span className="mf-expandable__icon" aria-hidden="true">{item.icon ?? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9h8M8 13h5"/></svg>}</span>
          <span className="mf-expandable__copy"><span className="mf-expandable__title">{item.title}</span>{item.description && <span className="mf-expandable__description">{item.description}</span>}</span>
          {item.meta && <span className="mf-expandable__meta">{item.meta}</span>}
          <span className="mf-expandable__arrow" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m8 5 5 5-5 5"/></svg></span>
        </button>
      </li>)}
    </ul>
    <dialog id={`${uid}-dialog`} ref={dialog} className="mf-expandable__dialog" aria-labelledby={`${uid}-title`}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const stops = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex], summary, [contenteditable="true"]'))
          .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert]') && element.getClientRects().length > 0);
        const first = stops[0];
        const last = stops[stops.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={event => { event.preventDefault(); onSelectedIdChange(null); }}
      onClick={event => { if (event.target === event.currentTarget) onSelectedIdChange(null); }}>
      <div ref={scrim} className="mf-expandable__scrim" aria-hidden="true" onClick={() => onSelectedIdChange(null)}/>
      <div ref={panel} className="mf-expandable__panel">
        <button autoFocus type="button" className="mf-expandable__close" aria-label={closeLabel} onClick={() => onSelectedIdChange(null)}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 5 10 10M15 5 5 15"/></svg></button>
        {shown && <><div className="mf-expandable__detail-icon" aria-hidden="true">{shown.icon}</div>
          <header className="mf-expandable__heading"><h2 id={`${uid}-title`}>{shown.title}</h2>{shown.description && <p>{shown.description}</p>}</header>
          <div className="mf-expandable__content">{shown.content}</div></>}
      </div>
    </dialog>
  </div>;
}
