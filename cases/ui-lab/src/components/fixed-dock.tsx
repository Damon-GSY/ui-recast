import { useEffect, useId, useState, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import './fixed-dock.css';

export interface FixedDockItem {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  disabledReason?: string;
}

export interface FixedDockProps {
  items: readonly FixedDockItem[];
  value?: string;
  onValueChange: (id: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Fixed geometry; the caller owns selection and the action it represents. */
export function FixedDock({ items, value, onValueChange, label = '快捷工具', disabled = false, className = '' }: FixedDockProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string>();
  const [focused, setFocused] = useState<string>();
  const [dismissed, setDismissed] = useState<string>();
  const active = hovered ?? focused;
  const activeItem = items.find(item => item.id === active);
  useEffect(() => {
    if (!activeItem) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setDismissed(activeItem.id); };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [activeItem]);

  return <LayoutGroup id={id}>
    <div className={`mfd-dock ${className}`} role="group" aria-label={label}>
      {items.map((item, index) => {
        const unavailable = disabled || !!item.disabled;
        const showLabel = active === item.id && dismissed !== item.id;
        const description = unavailable && item.disabledReason ? `${item.label} · ${item.disabledReason}` : item.label;
        const tooltipId = `${id}-tip-${index}`;
        return <div className="mfd-dock__item" key={item.id}
          onMouseEnter={() => { setHovered(item.id); setDismissed(undefined); }}
          onMouseLeave={() => setHovered(undefined)}>
          <AnimatePresence initial={false}>{active === item.id && !unavailable && <motion.span className="mfd-dock__hover" layoutId="hover" aria-hidden="true"
            data-selected={item.id === value} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { layout: { type: 'spring', stiffness: 500, damping: 38 }, opacity: { duration: .15 } }} />}</AnimatePresence>
          <motion.button type="button" className="mfd-dock__button" disabled={unavailable}
            aria-label={description} aria-pressed={item.id === value} aria-describedby={showLabel ? tooltipId : undefined}
            data-selected={item.id === value} whileTap={reduced || unavailable ? undefined : { scale: .96 }}
            transition={{ duration: reduced ? 0 : .1 }}
            onFocus={() => { setHovered(undefined); setFocused(item.id); setDismissed(undefined); }}
            onBlur={() => setFocused(undefined)} onClick={() => onValueChange(item.id)}>
            <span className="mfd-dock__icon" aria-hidden="true">{item.icon}</span>
          </motion.button>
          <AnimatePresence>{showLabel && <motion.span role="tooltip" id={tooltipId} className="mfd-dock__tooltip"
            initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 6 }}
            transition={{ duration: reduced ? 0 : .18, ease: [.16, 1, .3, 1] }} key="tooltip">{description}</motion.span>}</AnimatePresence>
        </div>;
      })}
    </div>
  </LayoutGroup>;
}
