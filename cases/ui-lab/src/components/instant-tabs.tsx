'use client';

import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './instant-tabs.css';

export interface InstantTab {
  /** Unique, stable application key. */
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface InstantTabsProps {
  tabs: readonly InstantTab[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  /** Reserve room for the caller's preview. Content may grow beyond this minimum. */
  minPanelHeight?: CSSProperties['minHeight'];
  disabled?: boolean;
  className?: string;
}

/** Automatic-activation tabs with one persistent indicator and no outgoing content delay. */
export function InstantTabs({ tabs, value, onValueChange, label, minPanelHeight = 200,
  disabled = false, className = '' }: InstantTabsProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const [geometry, setGeometry] = useState<{ x: number; width: number } | null>(null);
  const selected = tabs.find(tab => tab.value === value);
  const enabled = tabs.filter(tab => !tab.disabled && !disabled);
  const tabStop = enabled.find(tab => tab.value === value)?.value ?? enabled[0]?.value;
  const previousValue = useRef(value);
  const hasChanged = previousValue.current !== value;
  const hasSelectedBefore = useRef(false);
  const animateContent = hasChanged || hasSelectedBefore.current;

  useLayoutEffect(() => {
    if (previousValue.current !== value) hasSelectedBefore.current = true;
    previousValue.current = value;
  }, [value]);

  function reveal(button: HTMLButtonElement) {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const viewport = scroll.getBoundingClientRect();
    const bounds = button.getBoundingClientRect();
    // Include the scroll container's focus-ring padding, not just list offsets.
    if (bounds.left < viewport.left + 3) scroll.scrollLeft += bounds.left - viewport.left - 3;
    else if (bounds.right > viewport.right - 3) scroll.scrollLeft += bounds.right - viewport.right + 3;
  }

  useLayoutEffect(() => {
    const list = listRef.current;
    const button = buttons.current.get(value);
    if (!list || !button) { setGeometry(null); return; }
    const measure = () => {
      const next = { x: button.offsetLeft, width: button.offsetWidth };
      setGeometry(old => old?.x === next.x && old.width === next.width ? old : next);
      reveal(button);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const node of buttons.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, [value, tabs]);

  function activate(next: string) {
    if (next !== value && enabled.some(tab => tab.value === next)) onValueChange(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !enabled.length) return;
    const button = event.target as HTMLButtonElement;
    const index = enabled.findIndex(tab => tab.value === button.dataset.value);
    if (index < 0) return;
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1
      : event.key === 'ArrowRight' ? (index + 1) % enabled.length
      : event.key === 'ArrowLeft' ? (index - 1 + enabled.length) % enabled.length : null;
    if (target === null) return;
    event.preventDefault();
    const next = enabled[target].value;
    const nextButton = buttons.current.get(next)!;
    nextButton.focus({ preventScroll: true });
    reveal(nextButton);
    activate(next);
  }

  return <div className={`mf-instant-tabs ${className}`} data-reduced-motion={reduced || undefined}>
    <div className="mf-instant-tabs__scroll" ref={scrollRef}>
      <div className="mf-instant-tabs__list" role="tablist" aria-label={label} aria-orientation="horizontal" ref={listRef} onKeyDown={onKeyDown}>
        {geometry && selected && <motion.span aria-hidden="true" className="mf-instant-tabs__indicator" initial={false}
          animate={geometry} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}/>} 
        {tabs.map(tab => <button type="button" role="tab" className="mf-instant-tabs__tab" key={tab.value}
          ref={node => { if (node) buttons.current.set(tab.value, node); else buttons.current.delete(tab.value); }}
          id={`${id}-tab-${encodeURIComponent(tab.value)}`} aria-controls={`${id}-panel-${encodeURIComponent(tab.value)}`}
          aria-selected={value === tab.value} data-value={tab.value} disabled={disabled || tab.disabled}
          tabIndex={tabStop === tab.value ? 0 : -1} onClick={() => activate(tab.value)} onFocus={event => reveal(event.currentTarget)}>
          {tab.icon && <span className="mf-instant-tabs__icon" aria-hidden="true">{tab.icon}</span>}{tab.label}
        </button>)}
      </div>
    </div>
    <div className="mf-instant-tabs__panels" style={{ minHeight: minPanelHeight }}>
      {tabs.map(tab => <div role="tabpanel" className="mf-instant-tabs__panel" key={tab.value}
        id={`${id}-panel-${encodeURIComponent(tab.value)}`} aria-labelledby={`${id}-tab-${encodeURIComponent(tab.value)}`}
        tabIndex={0} hidden={value !== tab.value}>
        {value === tab.value && <motion.div className="mf-instant-tabs__content" key={tab.value}
          initial={reduced || !animateContent ? false : { opacity: 0, y: 6, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: reduced ? 0 : .3, ease: [.215, .61, .355, 1] }}>{tab.content}</motion.div>}
      </div>)}
    </div>
  </div>;
}
