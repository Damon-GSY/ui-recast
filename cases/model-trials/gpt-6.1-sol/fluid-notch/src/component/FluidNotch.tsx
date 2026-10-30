import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './fluid-notch.css';

export interface Person { name: string; src: string }
export interface NotchAction { id: string; label: string; primary?: boolean; disabled?: boolean }
export interface NotchCard {
  id: string;
  title: string;
  description: string;
  people: Person[];
  morePeople?: number;
  context: string;
  actions: NotchAction[];
}
export interface FluidNotchProps {
  label: string;
  card: NotchCard;
  people: Person[];
  morePeople?: number;
  reviewed: number;
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (id: string) => void;
  onDismiss: () => void;
  width?: number;
  grain?: number;
  dust?: boolean;
  theme?: 'light' | 'dark';
}

const ease = [0.22, 1, 0.36, 1] as const;
// Fitted to visible geometry, rather than the target's unavailable implementation.
const shellSpring = { type: 'spring', stiffness: 280, damping: 27, mass: 1 } as const;

function Avatars({ people, more = 0, size }: { people: Person[]; more?: number; size: number }) {
  return <span className="fn-avatars" style={{ '--avatar-size': `${size}px` } as React.CSSProperties}>
    {people.map(person => <img key={person.name} src={person.src} alt={size === 24 ? '' : person.name} title={person.name} width={size} height={size} draggable={false} />)}
    {more > 0 && <span className="fn-more">+{more}</span>}
  </span>;
}

function Progress({ value, complete, reduced }: { value: number; complete: boolean; reduced: boolean }) {
  return <svg className="fn-progress" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity=".15" />
    <motion.circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" initial={false}
      animate={{ pathLength: Math.max(.001, value), opacity: value > 0 ? 1 : 0 }} transition={{ duration: reduced ? 0 : .45, ease }} />
    <motion.circle cx="10" cy="10" r="9" fill="white" initial={false}
      animate={{ opacity: complete ? 1 : 0, scale: complete ? 1 : .4 }} style={{ transformOrigin: '10px 10px' }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 25, delay: complete ? .18 : 0 }} />
    <motion.path d="M6.4 10.4l2.4 2.4 4.8-5.2" fill="none" stroke="var(--fn-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      transform="rotate(90 10 10)" initial={false} animate={{ pathLength: complete ? 1 : 0, opacity: complete ? 1 : 0 }} transition={{ duration: reduced ? 0 : .22, delay: complete && !reduced ? .28 : 0, ease }} />
  </svg>;
}

function Dust({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [particles, setParticles] = useState<{ x: string; y: string; dx: number; dy: number; size: number; delay: number }[]>([]);
  useEffect(() => {
    if (!active || reduced) return;
    setParticles(Array.from({ length: 18 }, () => {
      const side = Math.floor(Math.random() * 4), position = Math.random();
      const x = side === 0 ? 0 : side === 1 ? 1 : position;
      const y = side === 2 ? 0 : side === 3 ? 1 : position;
      const distance = 12 + Math.random() * 22;
      const length = Math.hypot(x - .5, y - .5);
      return { x: `${x * 100}%`, y: `${y * 100}%`, dx: (x - .5) / length * distance, dy: (y - .5) / length * distance, size: 1.5 + Math.random() * 2, delay: .22 + Math.random() * .24 };
    }));
  }, [active, reduced]);
  if (reduced) return null;
  return <div className="fn-dust" aria-hidden="true">{particles.map((p, i) => <motion.span key={`${p.x}-${p.y}-${i}`} style={{ left: p.x, top: p.y, width: p.size, height: p.size }} initial={{ x: 0, y: 0, opacity: 0 }}
    animate={active ? { x: p.dx, y: p.dy, opacity: [0, .85, 0] } : { opacity: 0 }}
    transition={active ? { duration: 1.8, delay: p.delay, ease: 'easeOut', opacity: { duration: 1.8, delay: p.delay, times: [0, .4, 1], ease: 'easeOut' } } : { duration: .18 }} />)}</div>;
}

/** Controlled presentation. The caller owns questions, decisions, progress and reset. */
export function FluidNotch({ label, card, people, morePeople = 0, reviewed, total, open, onOpenChange, onAction, onDismiss, width = 340, grain = .22, dust = true, theme = 'light' }: FluidNotchProps) {
  const reduced = !!useReducedMotion();
  const headingId = useId();
  const host = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const [availableWidth, setAvailableWidth] = useState(width + 32);
  const [pillWidth, setPillWidth] = useState(281);
  const [cardHeight, setCardHeight] = useState(242);
  const [displayCard, setDisplayCard] = useState(card);
  const completed = reviewed >= total;
  const cardWidth = Math.min(width, Math.max(240, availableWidth - 32));

  // Preserve the outgoing question while its text is fading. Reopening adopts
  // the caller's next question immediately; the shell retains its current motion.
  useLayoutEffect(() => {
    if (open || reduced) { setDisplayCard(card); return; }
    const timer = window.setTimeout(() => setDisplayCard(card), 200);
    return () => window.clearTimeout(timer);
  }, [card, open, reduced]);

  useLayoutEffect(() => {
    const measure = () => {
      if (host.current) setAvailableWidth(host.current.clientWidth);
      if (trigger.current) setPillWidth(Math.round(trigger.current.offsetWidth));
      if (dialog.current) setCardHeight(dialog.current.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (host.current) observer.observe(host.current);
    if (trigger.current) observer.observe(trigger.current);
    if (dialog.current) observer.observe(dialog.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onDismiss(); }
    };
    document.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => primary.current?.focus({ preventScroll: true }), reduced ? 0 : 300);
    return () => { document.removeEventListener('keydown', onKey); window.clearTimeout(focusTimer); };
  }, [open, onDismiss, reduced]);

  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  const height = open ? cardHeight : 40;
  const geometry = reduced ? { duration: 0 } : shellSpring;
  return <div ref={host} className="fn-host" data-theme={theme}>
    <motion.div className="fn-anchor" initial={false} style={{ x: '-50%' }} animate={{ width: open ? cardWidth : pillWidth, height, y: (40 - height) / 2, borderRadius: open ? 26 : 20 }} transition={geometry}>
      {dust && <Dust active={open} reduced={reduced} />}
      <motion.div className="fn-shadow fn-shadow-idle" aria-hidden="true" initial={false} animate={{ opacity: open ? 0 : 1 }} transition={{ duration: reduced ? 0 : .3, ease }} />
      <motion.div className="fn-shadow fn-shadow-open" aria-hidden="true" initial={false} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: reduced ? 0 : .3, ease }} />
      <div className="fn-shell">
        <div className="fn-grain" style={{ opacity: grain }} aria-hidden="true" />
        <div className="fn-pill-position" style={{ pointerEvents: open ? 'none' : 'auto' }}>
          <motion.div initial={false} animate={{ opacity: open ? 0 : 1, filter: open ? 'blur(6px)' : 'blur(0px)', scale: open ? .94 : 1 }} transition={{ duration: reduced ? 0 : open ? .18 : .32, delay: !open && !reduced ? .14 : 0, ease }}>
            <button ref={trigger} type="button" className="fn-trigger" aria-expanded={open} aria-label={`${label}: ${completed ? 'all caught up' : `${total - reviewed} to review`}`} tabIndex={open ? -1 : 0} onClick={() => onOpenChange(true)}>
              <Progress value={total ? reviewed / total : 1} complete={completed} reduced={reduced} />
              <span className="fn-label">{completed ? 'All caught up' : label}</span>
              <Avatars people={people} more={morePeople} size={24} />
              {!completed && <span className="fn-count">{total - reviewed}</span>}
            </button>
          </motion.div>
        </div>
        <div className="fn-dialog-position" style={{ width: cardWidth, pointerEvents: open ? 'auto' : 'none' }} inert={!open}>
          <motion.div ref={dialog} className="fn-dialog" role="dialog" aria-modal="false" aria-hidden={!open} aria-labelledby={headingId} initial={false}
            animate={{ opacity: open ? 1 : 0, filter: open ? 'blur(0px)' : 'blur(8px)', y: open ? 0 : -6 }}
            transition={{ duration: reduced ? 0 : open ? .36 : .18, delay: open && !reduced ? .1 : 0, ease }}>
            <div className="fn-header">
              <Progress value={total ? reviewed / total : 1} complete={completed} reduced={reduced} />
              <span className="fn-header-label">{label}</span>
              {!completed && <span className="fn-step">{reviewed + 1} of {total}</span>}
            </div>
            <div className="fn-body">
              <h3 id={headingId}>{displayCard.title}</h3>
              <p>{displayCard.description}</p>
              <div className="fn-context"><Avatars people={displayCard.people} more={displayCard.morePeople} size={28} /><span>{displayCard.context}</span></div>
            </div>
            <div className="fn-actions" style={{ gridTemplateColumns: `repeat(${displayCard.actions.length}, minmax(0, 1fr))` }}>
              {displayCard.actions.map(action => <button key={action.id} ref={action.primary ? primary : undefined} type="button" className={action.primary ? 'fn-action fn-action-primary' : 'fn-action'} disabled={action.disabled} tabIndex={open ? 0 : -1} onClick={() => onAction(action.id)}>{action.label}</button>)}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  </div>;
}
