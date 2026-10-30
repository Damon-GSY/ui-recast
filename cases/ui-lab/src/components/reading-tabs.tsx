'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './segmented-control.css';
import './reading-tabs.css';

export type ReadingTab = {
  /** Stable application key. Unique within this ReadingTabs instance. */
  value: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  badge?: string;
  disabled?: boolean;
  /** Invoked only when content is mounted. Return content, not another tabpanel. */
  render: () => ReactNode;
};

export type ReadingTabsProps = {
  tabs: ReadingTab[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Manual is the default for expensive reading panels. */
  activationMode?: 'manual' | 'automatic';
  /** Retain visited content, including local editor/scroll state. Never mounts unvisited content. */
  keepMounted?: boolean;
  variant?: 'buttons' | 'tray' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  appearance?: 'clean' | 'classic';
  className?: string;
};

/** Owns both tabs and panel shells. Uses SegmentedControl CSS, never its radio/keyboard renderer. */
export function ReadingTabs({ tabs, label, value, defaultValue, onValueChange,
  activationMode = 'manual', keepMounted = false, variant = 'buttons', size = 'md',
  appearance = 'clean', className = '' }: ReadingTabsProps) {
  const id = useId();
  const [localValue, setLocalValue] = useState(defaultValue ?? tabs.find(tab => !tab.disabled)?.value);
  const requested = value ?? localValue;
  const selected = tabs.find(tab => tab.value === requested && !tab.disabled)?.value;
  const [focused, setFocused] = useState<string | undefined>();
  const [visited, setVisited] = useState<Set<string>>(() => new Set(selected === undefined ? [] : [selected]));
  const listRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [geometry, setGeometry] = useState<{ left: number; right: number; direction: number } | null>(null);
  const reduced = useReducedMotion();
  const enabled = tabs.filter(tab => !tab.disabled);
  const tabStop = enabled.find(tab => tab.value === focused)?.value ?? selected ?? enabled[0]?.value;
  const tabId = (key: string) => `${id}-tab-${encodeURIComponent(key)}`;
  const panelId = (key: string) => `${id}-panel-${encodeURIComponent(key)}`;

  useEffect(() => {
    if (selected !== undefined) setVisited(current => current.has(selected) ? current : new Set([...current, selected]));
  }, [selected]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    function measure() {
      const active = Array.from(list!.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(tab => tab.dataset.value === selected);
      if (!active) { setGeometry(null); return; }
      const inset = variant === 'underline' ? 2 : 0;
      const left = active.offsetLeft + inset;
      // Both edges use the track's left origin. A changing track width must not
      // move the pill's right edge before its animation has started.
      const right = active.offsetLeft + active.offsetWidth - inset;
      const renderedLeft = indicatorRef.current?.offsetLeft ?? left;
      const direction = Math.sign(left - renderedLeft);
      setGeometry(current => current?.left === left && current.right === right ? current : { left, right, direction });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.querySelectorAll('[role="tab"]').forEach(tab => observer.observe(tab));
    return () => observer.disconnect();
  }, [selected, tabs, variant, size, appearance]);

  function reveal(button: HTMLButtonElement) {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!scroller || !list) return;
    const start = list.offsetLeft + button.offsetLeft;
    const end = start + button.offsetWidth;
    if (start < scroller.scrollLeft) scroller.scrollLeft = start;
    else if (end > scroller.scrollLeft + scroller.clientWidth) scroller.scrollLeft = end - scroller.clientWidth;
  }
  useLayoutEffect(() => {
    const button = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []).find(tab => tab.dataset.value === selected);
    if (button) reveal(button);
  }, [selected]);

  function activate(next: string) {
    if (next === selected || !enabled.some(tab => tab.value === next)) return;
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]');
    if (!button || !enabled.length) return;
    const index = enabled.findIndex(tab => tab.value === button.dataset.value);
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1
      : event.key === 'ArrowLeft' ? (index - 1 + enabled.length) % enabled.length
      : event.key === 'ArrowRight' ? (index + 1) % enabled.length : undefined;
    // Native buttons own Enter/Space. There is no second activation handler.
    if (target === undefined) return;
    event.preventDefault();
    const next = enabled[target].value;
    const nextButton = Array.from(listRef.current!.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(tab => tab.dataset.value === next)!;
    setFocused(next);
    nextButton.focus({ preventScroll: true });
    reveal(nextButton);
    if (activationMode === 'automatic') activate(next);
  }
  const timing = appearance === 'classic' ? { lead: .27, follow: .4, neutral: .38, ease: [.22, 1, .36, 1] as const }
    : { lead: .16, follow: .22, neutral: .2, ease: [.25, .9, .3, 1] as const };

  return <div className={`reading-tabs ${className}`} data-activation={activationMode}>
    <div className={`sc sc--${variant} sc--${size} sc--${appearance}`} data-reduced-motion={reduced || undefined}>
      <div className="sc-scroll" ref={scrollerRef}>
        <div className="sc-track" role="tablist" aria-label={label} aria-orientation="horizontal" ref={listRef} onKeyDown={onKeyDown}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(undefined); }}>
          {geometry && <motion.span className="sc-indicator" ref={indicatorRef} aria-hidden="true" initial={false}
            style={{ left: 'var(--reading-left)', right: 'auto', width: 'calc(var(--reading-right) - var(--reading-left))' }}
            animate={{ '--reading-left': `${geometry.left}px`, '--reading-right': `${geometry.right}px` }} transition={{
              '--reading-left': { duration: reduced ? 0 : geometry.direction > 0 ? timing.follow : geometry.direction < 0 ? timing.lead : timing.neutral, ease: timing.ease },
              '--reading-right': { duration: reduced ? 0 : geometry.direction < 0 ? timing.follow : geometry.direction > 0 ? timing.lead : timing.neutral, ease: timing.ease },
            }}/>} 
          {tabs.map(tab => <button key={tab.value} type="button" role="tab" className="sc-option" id={tabId(tab.value)}
            data-value={tab.value} data-state={selected === tab.value ? 'checked' : 'unchecked'}
            aria-selected={selected === tab.value} aria-controls={panelId(tab.value)} disabled={tab.disabled}
            tabIndex={tab.value === tabStop ? 0 : -1} onFocus={event => { setFocused(tab.value); reveal(event.currentTarget); }} onClick={() => activate(tab.value)}>
            <span className="sc-content">
              {tab.icon && <span className="sc-icon" aria-hidden="true">{tab.icon}</span>}
              <span className="sc-label" data-label={tab.label}><span>{tab.label}</span><span className="sc-label-strong" aria-hidden="true">{tab.label}</span></span>
              {tab.count !== undefined && <span className="sc-count">{tab.count}</span>}
              {tab.badge && <span className="sc-badge">{tab.badge}</span>}
            </span>
          </button>)}
        </div>
      </div>
    </div>
    {tabs.map(tab => <div key={tab.value} role="tabpanel" className="reading-tabs__panel" id={panelId(tab.value)}
      aria-labelledby={tabId(tab.value)} hidden={selected !== tab.value} tabIndex={0}>
      {(selected === tab.value || (keepMounted && visited.has(tab.value))) ? tab.render() : null}
    </div>)}
  </div>;
}
