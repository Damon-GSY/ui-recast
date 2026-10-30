'use client';

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './settings-sidebar.css';

export interface SettingsSidebarItem {
  /** Unique application-owned key across all groups. */
  value: string;
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  /** ID of the caller's content region, if it has one. */
  controls?: string;
}

export interface SettingsSidebarGroup {
  id: string;
  label: string;
  items: readonly SettingsSidebarItem[];
}

export interface SettingsSidebarProps {
  groups: readonly SettingsSidebarGroup[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  header?: ReactNode;
  footer?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** In-page settings navigation. The caller owns selection, content, and persistence. */
export function SettingsSidebar({ groups, value, onValueChange, label = 'Settings', header,
  footer, disabled = false, className = '' }: SettingsSidebarProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const bodyRef = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const [hovered, setHovered] = useState<string | null>(null);
  const [surface, setSurface] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const hoverEnabled = !disabled && hovered !== null && hovered !== value &&
    groups.some(group => group.items.some(item => item.value === hovered && !item.disabled));

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const button = hovered === null ? undefined : buttons.current.get(hovered);
    if (!body || !button) return;
    const measure = () => {
      const bounds = button.getBoundingClientRect();
      const parent = body.getBoundingClientRect();
      const next = { x: bounds.left - parent.left, y: bounds.top - parent.top, width: bounds.width, height: bounds.height };
      setSurface(old => old && Object.keys(next).every(key => old[key as keyof typeof next] === next[key as keyof typeof next]) ? old : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    observer.observe(button);
    return () => observer.disconnect();
  }, [hovered, groups]);

  return <nav className={`mf-settings-sidebar ${className}`} aria-label={label} data-reduced-motion={reduced || undefined}>
    {header && <div className="mf-settings-sidebar__header">{header}</div>}
    <div className="mf-settings-sidebar__scroll">
      <div className="mf-settings-sidebar__body" ref={bodyRef} onPointerLeave={() => setHovered(null)}>
        {surface && <motion.span aria-hidden="true" className="mf-settings-sidebar__hover" initial={false}
          animate={{ ...surface, opacity: hoverEnabled ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40, opacity: { duration: .2, ease: [.25, .1, .25, 1] } }}/>} 
        {groups.map(group => <section className="mf-settings-sidebar__group" key={group.id} aria-labelledby={`${id}-${group.id}`}>
          <h3 className="mf-settings-sidebar__group-label" id={`${id}-${group.id}`}>{group.label}</h3>
          <ul className="mf-settings-sidebar__items">
            {group.items.map(item => <li className="mf-settings-sidebar__item" key={item.value}
              onPointerEnter={event => setHovered(event.pointerType !== 'touch' && !disabled && !item.disabled ? item.value : null)}
              onPointerLeave={() => setHovered(null)}>
              <button ref={node => { if (node) buttons.current.set(item.value, node); else buttons.current.delete(item.value); }}
                type="button" className="mf-settings-sidebar__button" data-value={item.value}
                aria-current={value === item.value ? 'page' : undefined} aria-controls={item.controls}
                disabled={disabled || item.disabled}
                onClick={() => { if (item.value !== value) onValueChange(item.value); }}>
                {item.icon && <span className="mf-settings-sidebar__icon" aria-hidden="true">{item.icon}</span>}
                <span className="mf-settings-sidebar__label">{item.label}</span>
                {item.trailing && <span className="mf-settings-sidebar__trailing">{item.trailing}</span>}
              </button>
            </li>)}
          </ul>
        </section>)}
      </div>
    </div>
    {footer && <div className="mf-settings-sidebar__footer">{footer}</div>}
  </nav>;
}
