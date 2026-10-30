'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import './fluid-notch.css';

export type FluidNotchCloseReason = 'trigger' | 'close' | 'escape' | 'outside';
export interface FluidNotchProps {
  label: string;
  summary?: ReactNode;
  expandedSummary?: ReactNode;
  icon?: ReactNode;
  count?: number;
  open: boolean;
  onOpenChange: (open: boolean, reason: FluidNotchCloseReason) => void;
  children: ReactNode;
  /** Pixel width, constrained to the available parent width. */
  width?: number;
  compactWidth?: number;
  compactHeight?: number;
  expandedRadius?: number;
  disabled?: boolean;
  closeLabel?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

function Glyph({ name }: { name: 'stack' | 'close' | 'file' | 'remove' | 'play' | 'pause' | 'previous' | 'next' | 'music' | 'error' }) {
  const paths: Record<typeof name, ReactNode> = {
    stack: <><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="m3 12 9 4 9-4M3 17l9 4 9-4"/></>,
    close: <path d="m7 7 10 10M17 7 7 17"/>,
    remove: <path d="M6 12h12"/>,
    file: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></>,
    play: <path d="m9 5 10 7-10 7V5Z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M7 5h4v14H7zM14 5h4v14h-4z" fill="currentColor" stroke="none"/></>,
    previous: <><path d="M6 5v14M18 6l-9 6 9 6V6Z"/><path d="m18 6-9 6 9 6" fill="currentColor"/></>,
    next: <><path d="M18 5v14M6 6l9 6-9 6V6Z"/><path d="m6 6 9 6-9 6" fill="currentColor"/></>,
    music: <><path d="M9 18V5l10-2v13M9 9l10-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="16" cy="16" rx="3" ry="2"/></>,
    error: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

/** Controlled, non-modal disclosure. It never changes caller data on dismissal. */
export function FluidNotch({ label, summary, expandedSummary, icon, count, open, onOpenChange, children, width = 384, compactWidth = 280, compactHeight = 44, expandedRadius = 28, disabled = false, closeLabel = 'Collapse stash', theme = 'light', className = '' }: FluidNotchProps) {
  const id = useId();
  const grainId = `${id}-grain`;
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const [available, setAvailable] = useState(width);
  const [height, setHeight] = useState(200);
  const reduce = useReducedMotion();
  const expandedWidth = Math.max(0, Math.min(width, available));
  const closedWidth = Math.max(0, Math.min(compactWidth, available));
  // A caller can advance its queue while closing. Keep the outgoing view until
  // the next open, so the next question never flashes through the fading card.
  const lastExpanded = useRef({ label, expandedSummary, count, children });
  useLayoutEffect(() => {
    if (open) lastExpanded.current = { label, expandedSummary, count, children };
  }, [open, label, expandedSummary, count, children]);
  const panelView = open ? { label, expandedSummary, count, children } : lastExpanded.current;
  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;
    const measure = () => { setAvailable(root.clientWidth); setHeight(panel.offsetHeight); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root); observer.observe(panel);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (panelRef.current) setHeight(panelRef.current.offsetHeight);
  }, [open, children, expandedWidth]);
  useLayoutEffect(() => {
    if (open && !wasOpen.current) closeRef.current?.focus({ preventScroll: true });
    if (!open && wasOpen.current) triggerRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.querySelector('.fn-surface')?.contains(event.target)) onOpenChange(false, 'outside');
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); onOpenChange(false, 'escape'); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open, onOpenChange]);
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 260, damping: 25.6, mass: 1 };
  const shadow = theme === 'dark'
    ? open ? '0px 24px 48px -16px rgba(0, 0, 0, 0.45), 0px 6px 16px -4px rgba(0, 0, 0, 0.15)' : '0px 8px 20px -8px rgba(0, 0, 0, 0.4), 0px 0px 0px 0px rgba(0, 0, 0, 0)'
    : open ? '0px 18px 34px -16px rgba(0, 0, 0, 0.34), 0px 2px 5px 0px rgba(0, 0, 0, 0.07)' : '0px 5px 14px -6px rgba(0, 0, 0, 0.19), 0px 1px 3px 0px rgba(0, 0, 0, 0.05)';
  return <div ref={rootRef} className={`fn-root ${className}`} style={{ '--fn-compact-height': `${compactHeight}px` } as CSSProperties} data-theme={theme} data-open={open} data-reduced-motion={Boolean(reduce)}>
    <motion.div className="fn-surface" initial={false} animate={{ width: open ? expandedWidth : closedWidth, height: open ? height : compactHeight, borderRadius: open ? expandedRadius : compactHeight / 2, boxShadow: shadow }} transition={spring}>
      <div className="fn-grain" aria-hidden="true"><svg width="100%" height="100%"><filter id={grainId}><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.6 0 0 0 -.55"/></filter><rect width="100%" height="100%" filter={`url(#${grainId})`}/></svg></div>
      <motion.div className="fn-rim" aria-hidden="true" initial={false} animate={{ opacity: open ? 1 : .3 }} transition={{ duration: reduce ? 0 : .3 }}/>
      <motion.div className="fn-compact" style={{ width: closedWidth }} inert={open} aria-hidden={open} initial={false} animate={{ opacity: open ? 0 : 1, y: 0, scale: open ? .94 : 1, filter: open && !reduce ? 'blur(6px)' : 'blur(0px)' }} transition={{ duration: reduce ? 0 : open ? .18 : .35, ease: open ? [.29, 1, .18, 1] : [.26, 1, .3, 1], delay: !open && !reduce ? .14 : 0 }}>
        <button ref={triggerRef} type="button" className="fn-trigger" aria-expanded={open} aria-controls={`${id}-panel`} disabled={disabled} onClick={() => onOpenChange(true, 'trigger')}>
          <span className="fn-icon">{icon ?? <Glyph name="stack"/>}</span>
          <span className="fn-summary"><span className="fn-label">{label}</span>{summary && <span className="fn-summary-extra">{summary}</span>}</span>
          {count !== undefined && <span className="fn-count">{count}</span>}
        </button>
      </motion.div>
      <motion.div ref={panelRef} id={`${id}-panel`} role="region" aria-labelledby={`${id}-label`} aria-hidden={!open} inert={!open} className="fn-panel" style={{ width: expandedWidth }} initial={false} animate={{ opacity: open ? 1 : 0, y: open ? 0 : -6, filter: !open && !reduce ? 'blur(8px)' : 'blur(0px)' }} transition={{ duration: reduce ? 0 : open ? .35 : .18, ease: open ? [.26, 1, .3, 1] : [.29, 1, .18, 1], delay: open && !reduce ? .12 : 0 }}>
        <div className="fn-header"><span className="fn-icon">{icon ?? <Glyph name="stack"/>}</span><span id={`${id}-label`} className="fn-label">{panelView.label}</span>{panelView.expandedSummary ?? (panelView.count !== undefined && <span className="fn-count">{panelView.count}</span>)}<button ref={closeRef} className="fn-icon-button fn-close" type="button" aria-label={closeLabel} onClick={() => onOpenChange(false, 'close')}><Glyph name="close"/></button></div>
        <div className="fn-content">{panelView.children}</div>
      </motion.div>
    </motion.div>
    <motion.div className="fn-dust" aria-hidden="true" initial={false} animate={{ width: open ? expandedWidth : closedWidth, height: open ? height : compactHeight, opacity: open && !reduce ? 1 : 0 }} transition={{ ...spring, opacity: { duration: reduce ? 0 : .18 } }}>
      {[[-5, 14], [4, -6], [13, -4], [25, -10], [42, -5], [60, -8], [76, -7], [96, -5], [102, 11], [105, 27], [103, 46], [102, 61], [103, 83], [97, 104], [79, 103], [62, 106], [43, 104], [20, 104], [3, 103], [-3, 86], [-5, 66], [-3, 48], [-4, 32]].map(([x, y], i) => <motion.i key={i} style={{ left: `${x}%`, top: `${y}%`, width: i % 3 ? 2 : 1, height: i % 3 ? 2 : 1 }} initial={false} animate={{ opacity: open && !reduce ? [.08, .24, .08] : 0, y: open && !reduce ? [0, -3, 0] : 0 }} transition={{ duration: reduce ? 0 : 2.4, repeat: open && !reduce ? Infinity : 0, delay: open ? i * .065 : 0 }}/>) }
    </motion.div>
  </div>;
}

export interface FluidNotchSection { id: string; label: string; icon?: ReactNode; content: ReactNode; disabled?: boolean }
export interface FluidNotchSectionsProps { sections: FluidNotchSection[]; value: string; onValueChange: (value: string) => void; label?: string }
function SectionPanel({ children, id, labelledBy }: { children: ReactNode; id: string; labelledBy: string }) {
  const present = useIsPresent();
  const reduce = useReducedMotion();
  return <motion.div role="tabpanel" id={id} aria-labelledby={labelledBy} aria-hidden={!present} inert={!present} tabIndex={0} className="fn-section-panel" style={!present ? { position: 'absolute', insetInline: 0, top: 0 } : undefined} initial={reduce ? false : { opacity: 0, y: 5, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -4, filter: reduce ? 'blur(0px)' : 'blur(4px)' }} transition={{ duration: reduce ? 0 : .18 }}>{children}</motion.div>;
}
/** Automatic activation tabs. Section content and selection belong to the caller. */
export function FluidNotchSections({ sections, value, onValueChange, label = 'Stash contents' }: FluidNotchSectionsProps) {
  const id = useId();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const current = sections.find(section => section.id === value);
  const enabled = sections.filter(section => !section.disabled);
  return <div className="fn-sections"><div className="fn-tabs" role="tablist" aria-label={label}>{sections.map((section, index) => <button key={section.id} ref={node => { if (node) buttons.current.set(section.id, node); else buttons.current.delete(section.id); }} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-section-${index}`} aria-selected={value === section.id} tabIndex={value === section.id || (!enabled.some(s => s.id === value) && section.id === enabled[0]?.id) ? 0 : -1} disabled={section.disabled} onClick={() => onValueChange(section.id)} onKeyDown={event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const position = enabled.findIndex(s => s.id === section.id);
    const next = enabled[event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (position + (event.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length];
    if (next) { onValueChange(next.id); buttons.current.get(next.id)?.focus(); }
  }}>{section.icon && <span className="fn-icon">{section.icon}</span>}{section.label}</button>)}</div><div className="fn-section-stage"><AnimatePresence initial={false}>{current && <SectionPanel key={current.id} id={`${id}-section-${sections.indexOf(current)}`} labelledBy={`${id}-tab-${sections.indexOf(current)}`}>{current.content}</SectionPanel>}</AnimatePresence></div></div>;
}

export interface FluidNotchFile { id: string; name: string; detail?: string; icon?: ReactNode; disabled?: boolean }
export interface FluidNotchFilesProps { files: FluidNotchFile[]; onOpen?: (file: FluidNotchFile) => void; onRemove?: (file: FluidNotchFile) => void; emptyContent?: ReactNode; removeLabel?: (file: FluidNotchFile) => string }
export function FluidNotchFiles({ files, onOpen, onRemove, emptyContent, removeLabel = file => `Remove ${file.name}` }: FluidNotchFilesProps) {
  if (!files.length) return <div className="fn-empty">{emptyContent}</div>;
  return <ul className="fn-files">{files.map(file => { const content = <><span className="fn-file-icon">{file.icon ?? <Glyph name="file"/>}</span><span className="fn-file-text"><strong>{file.name}</strong>{file.detail && <small>{file.detail}</small>}</span></>; return <li key={file.id} data-disabled={file.disabled || undefined}>{onOpen ? <button className="fn-file-main" type="button" disabled={file.disabled} onClick={() => onOpen(file)}>{content}</button> : <div className="fn-file-main">{content}</div>}{onRemove && <button className="fn-icon-button" type="button" aria-label={removeLabel(file)} disabled={file.disabled} onClick={() => onRemove(file)}><Glyph name="remove"/></button>}</li>; })}</ul>;
}

export interface FluidNotchMusicProps {
  title: string; artist?: string; artwork?: ReactNode; playing: boolean; elapsed: number; duration: number;
  onPlayPause?: () => void; onPrevious?: () => void; onNext?: () => void; onSeek?: (seconds: number) => void; disabled?: boolean;
  labels?: { play?: string; pause?: string; previous?: string; next?: string; seek?: string };
}
function timeLabel(value: number) { const seconds = Math.max(0, Math.floor(value)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
export function FluidNotchMusic({ title, artist, artwork, playing, elapsed, duration, onPlayPause, onPrevious, onNext, onSeek, disabled, labels }: FluidNotchMusicProps) {
  const total = Math.max(0, duration), position = Math.max(0, Math.min(elapsed, total));
  return <div className="fn-music"><div className="fn-track"><div className="fn-artwork">{artwork ?? <Glyph name="music"/>}</div><div className="fn-track-text"><strong>{title}</strong>{artist && <span>{artist}</span>}</div><span className="fn-equalizer" data-playing={playing && !disabled} aria-hidden="true">{[0, 1, 2, 3].map(i => <i key={i} style={{ '--fn-bar': i } as CSSProperties}/>)}</span></div><div className="fn-playback"><button type="button" className="fn-icon-button" aria-label={labels?.previous ?? 'Previous track'} disabled={disabled || !onPrevious} onClick={onPrevious}><Glyph name="previous"/></button><button type="button" className="fn-play-button" aria-label={playing ? labels?.pause ?? 'Pause' : labels?.play ?? 'Play'} aria-pressed={playing} disabled={disabled || !onPlayPause} onClick={onPlayPause}><Glyph name={playing ? 'pause' : 'play'}/></button><button type="button" className="fn-icon-button" aria-label={labels?.next ?? 'Next track'} disabled={disabled || !onNext} onClick={onNext}><Glyph name="next"/></button></div><input className="fn-seek" type="range" aria-label={labels?.seek ?? 'Playback position'} aria-valuetext={`${timeLabel(position)} of ${timeLabel(total)}`} min={0} max={total || 1} step={1} value={position} disabled={disabled || !onSeek || !total} onChange={event => onSeek?.(Number(event.target.value))}/><div className="fn-times"><span>{timeLabel(position)}</span><span>{timeLabel(total)}</span></div></div>;
}

export interface FluidNotchProgressProps { value?: number; complete?: boolean; active?: boolean; label?: string }
export function FluidNotchProgress({ value, complete = false, active = false, label }: FluidNotchProgressProps) {
  const reduce = useReducedMotion();
  const spring = { type: 'spring' as const, stiffness: 260, damping: 25.6, restDelta: .001, restSpeed: .01 };
  return <motion.svg className="fn-progress-icon" viewBox="0 0 24 24" fill="none" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} animate={{ rotate: active && value === undefined && !reduce ? 360 : 0 }} transition={active && value === undefined && !reduce ? { duration: 1.4, repeat: Infinity, ease: 'linear' } : { duration: 0 }}>
    <circle cx="12" cy="12" r="9.6" stroke="currentColor" strokeWidth="2.4" opacity=".15"/>
    <motion.circle cx="12" cy="12" r="9.6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" transform="rotate(-90 12 12)" initial={false} animate={{ pathLength: complete ? 1 : value !== undefined ? Math.min(100, Math.max(0, value)) / 100 : active ? .25 : 0, opacity: complete || active || (value ?? 0) > 0 ? 1 : 0 }} transition={reduce ? { duration: 0 } : spring}/>
    <motion.circle cx="12" cy="12" r="10.8" fill="currentColor" initial={false} animate={{ scale: complete ? 1 : .4, opacity: complete ? 1 : 0 }} transition={reduce ? { duration: 0 } : { ...spring, delay: complete ? .35 : 0 }} style={{ transformOrigin: '12px 12px' }}/>
    <motion.path d="m7.68 12.48 2.88 2.88 5.76-6.24" stroke="var(--fn-surface)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: complete ? 1 : 0, opacity: complete ? 1 : 0 }} transition={{ duration: reduce ? 0 : .3, ease: [.26, 1, .3, 1], delay: complete && !reduce ? .55 : 0 }}/>
  </motion.svg>;
}
export interface FluidNotchStatusProps { title: string; description?: string; state: 'idle' | 'active' | 'complete' | 'error'; progress?: number; action?: ReactNode }
export function FluidNotchStatus({ title, description, state, progress, action }: FluidNotchStatusProps) {
  return <div className="fn-status" data-state={state}><span className="fn-status-icon">{state === 'error' ? <Glyph name="error"/> : <FluidNotchProgress value={progress} active={state === 'active'} complete={state === 'complete'}/>}</span><div className="fn-status-copy" role="status"><strong>{title}</strong>{description && <p>{description}</p>}</div>{progress !== undefined && <div className="fn-status-progress" role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.max(0, progress))}><span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}/></div>}{action && <div className="fn-status-action">{action}</div>}</div>;
}
