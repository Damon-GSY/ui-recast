'use client';

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './selectable-cards.css';

export interface SelectableCardOption {
  value: string;
  label: string;
  description?: ReactNode;
  icon?: ReactNode;
  preview?: ReactNode;
  disabled?: boolean;
}
export interface SelectableCardsProps {
  options: readonly SelectableCardOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  label: string;
  /** Optional native form entry. No input is submitted for a disabled selection. */
  name?: string;
  disabled?: boolean;
  className?: string;
}

/** Selection belongs to the caller. Pointer hover never changes the chosen value. */
export function SelectableCards({ options, value, onValueChange, label, name, disabled = false, className = '' }: SelectableCardsProps) {
  const uid = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoverRect, setHoverRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const lastHovered = useRef<string | null>(null);
  const reduced = useReducedMotion();
  const enabled = options.filter(option => !disabled && !option.disabled);
  const tabValue = enabled.find(option => option.value === value)?.value ?? enabled[0]?.value;
  const hoverValue = enabled.some(option => option.value === hovered) ? hovered : null;
  const selected = options.find(option => option.value === value);
  useLayoutEffect(() => {
    if (hoverValue) lastHovered.current = hoverValue;
    // Keep the fading surface measured when the viewport changes after leaving.
    const slot = lastHovered.current ? refs.current.get(lastHovered.current)?.parentElement : null;
    if (!slot || !root.current) { setHoverRect(null); return; }
    const measure = () => setHoverRect({ x: slot.offsetLeft, y: slot.offsetTop, width: slot.offsetWidth, height: slot.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root.current);
    observer.observe(slot);
    return () => observer.disconnect();
  }, [hoverValue]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, current: string) {
    let next: number;
    const index = enabled.findIndex(option => option.value === current);
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % enabled.length; break;
      case 'ArrowLeft': next = (index + enabled.length - 1) % enabled.length; break;
      case 'ArrowDown': next = (index + 1) % enabled.length; break;
      case 'ArrowUp': next = (index + enabled.length - 1) % enabled.length; break;
      case 'Home': next = 0; break;
      case 'End': next = enabled.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const target = enabled[next];
    refs.current.get(target.value)?.focus();
    if (target.value !== value) onValueChange(target.value);
  }
  return <div ref={root} role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} className={`mf-selectable-cards ${className}`} onPointerLeave={() => setHovered(null)}>
      {hoverRect && <motion.span aria-hidden="true" className="mf-selectable-cards__hover"
        initial={{ ...hoverRect, opacity: 0 }} animate={{ ...hoverRect, opacity: hoverValue ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 36, opacity: { duration: .13 } }} />}
      {name && selected && <input type="hidden" name={name} value={selected.value} disabled={disabled || selected.disabled} />}
      {options.map(option => {
        const checked = option.value === value;
        const unavailable = disabled || option.disabled;
        return <div className="mf-selectable-cards__slot" key={option.value}>
          <button type="button" role="radio" aria-checked={checked} aria-labelledby={`${uid}-${option.value}-label`}
            aria-describedby={option.description ? `${uid}-${option.value}-description` : undefined}
            disabled={unavailable} tabIndex={!unavailable && tabValue === option.value ? 0 : -1}
            className="mf-selectable-cards__card" data-selected={checked}
            ref={element => { if (element) refs.current.set(option.value, element); else refs.current.delete(option.value); }}
            onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(unavailable ? null : option.value); }}
            onKeyDown={event => navigate(event, option.value)}
            onClick={() => { if (!checked) onValueChange(option.value); }}>
            <span className="mf-selectable-cards__top">
              {option.preview ? <span aria-hidden="true" className="mf-selectable-cards__preview">{option.preview}</span> : option.icon ? <span aria-hidden="true" className="mf-selectable-cards__icon">{option.icon}</span> : <span/>}
              <span aria-hidden="true" className="mf-selectable-cards__check"><svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            </span>
            <span id={`${uid}-${option.value}-label`} className="mf-selectable-cards__label">{option.label}</span>
            {option.description && <span id={`${uid}-${option.value}-description`} className="mf-selectable-cards__description">{option.description}</span>}
          </button>
        </div>;
      })}
    </div>;
}
