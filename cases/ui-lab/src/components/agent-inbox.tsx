'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './agent-inbox.css';

export type AgentTaskStatus = 'running' | 'waiting' | 'done' | 'failed' | (string & {});
export type AgentInboxView = 'board' | 'list';
export type AgentInboxAction = 'approve' | 'reject' | 'retry' | 'open';
export interface AgentTaskPresentation {
  label: string;
  lane: 'needs-you' | 'running' | 'done' | 'other';
  tone?: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
  clock?: 'live' | 'elapsed';
  actions?: readonly AgentInboxAction[];
}
export interface AgentTask {
  id: string;
  title: string;
  description?: string;
  agent: string;
  status: AgentTaskStatus;
  /** Unix milliseconds. Running and waiting clocks use this authoritative start. */
  startedAt?: number;
  /** Elapsed seconds, used for completed tasks or when startedAt is absent. */
  elapsed?: number;
  sources?: number;
  tools?: number;
  steps?: { label: string; time?: string }[];
}
export interface AgentInboxProps {
  tasks: AgentTask[];
  title?: string;
  view?: AgentInboxView;
  defaultView?: AgentInboxView;
  onViewChange?: (view: AgentInboxView) => void;
  expandedTaskId?: string | null;
  onExpandedTaskChange?: (id: string | null) => void;
  onApprove?: (task: AgentTask) => void;
  onReject?: (task: AgentTask) => void;
  onRetry?: (task: AgentTask) => void;
  onOpen?: (task: AgentTask) => void;
  /** Fallback when the action-specific callback is absent; never called twice. */
  onAction?: (action: AgentInboxAction, task: AgentTask) => void;
  /** Unknown statuses retain their literal text in Other until mapped by the caller. */
  statusPresentation?: Readonly<Record<string, AgentTaskPresentation>>;
  pendingTaskIds?: readonly string[];
  actionErrors?: Readonly<Record<string, string | undefined>>;
  className?: string;
}

// SVG geometry transcribed from the public rendered preview, not component source.
// Provenance: evidence/batch/agent-inbox/reference/rendered-icons.json.
function Spark() {
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.2c.4 2.9 1.9 4.4 4.8 4.8-2.9.4-4.4 1.9-4.8 4.8C6.6 7.9 5.1 6.4 2.2 6 5.1 5.6 6.6 4.1 7 1.2Z" fill="currentColor"/><circle cx="11.6" cy="11.4" r="1.1" fill="currentColor" opacity=".55"/></svg>;
}
function StatusIcon({status}: {status: AgentTaskStatus}) {
  return <span key={status} className="agent-inbox__state-icon" data-status={status} aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12">
    {status === 'running' ? <><circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="1.6"/><path d="M6 1.4a4.6 4.6 0 0 1 4.6 4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></> : status === 'waiting' ? <path d="M6 1.6 11 10.2H1L6 1.6Z" fill="currentColor"/> : status === 'failed' ? <><circle cx="6" cy="6" r="4.8" fill="currentColor"/><path d="M6 3.6v2.8M6 8.3v.1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></> : <circle cx="6" cy="6" r="3.4" fill="currentColor"/>}
  </svg></span>;
}
function MetaIcon({kind}: {kind: 'sources' | 'tools'}) {
  return <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">{kind === 'sources' ? <><circle cx="5.2" cy="5.2" r="3.3"/><path d="m7.7 7.7 2.6 2.6"/></> : <path d="M7.6 1.6a2.6 2.6 0 0 0-2.4 3.5L1.7 8.6a1.1 1.1 0 0 0 1.6 1.6l3.5-3.5a2.6 2.6 0 0 0 3.5-2.4l-1.5 1.1-1.5-.4-.4-1.5 1.1-1.5c-.1 0-.3-.4-.4-.4Z"/>}</svg>;
}
const laneNames = ['Needs you', 'Running', 'Done', 'Other'] as const;
const laneKeys = ['needs-you', 'running', 'done', 'other'] as const;
const standardPresentation: Record<string, AgentTaskPresentation> = {
  running: {label: 'Running', lane: 'running', tone: 'info', clock: 'live'},
  waiting: {label: 'Waiting for you', lane: 'needs-you', tone: 'warning', clock: 'live', actions: ['reject', 'approve']},
  done: {label: 'Done', lane: 'done', tone: 'success', clock: 'elapsed'},
  failed: {label: 'Failed', lane: 'needs-you', tone: 'danger', actions: ['retry']},
};
const duration = (seconds: number) => {
  const value = Math.max(0, Math.floor(seconds));
  return value < 60 ? `${value}s` : `${Math.floor(value / 60)}m ${String(value % 60).padStart(2, '0')}s`;
};

/** Presentational inbox: all job statuses are owned and updated by the caller. */
export function AgentInbox({tasks, title = 'Agent inbox', view, defaultView = 'list', onViewChange, expandedTaskId, onExpandedTaskChange, onApprove, onReject, onRetry, onOpen, onAction, statusPresentation, pendingTaskIds = [], actionErrors, className = ''}: AgentInboxProps) {
  const presentation = (task: AgentTask): AgentTaskPresentation => statusPresentation?.[task.status] ?? standardPresentation[task.status] ?? {label: task.status, lane: 'other', tone: 'neutral'};
  const laneOf = (task: AgentTask) => laneKeys.indexOf(presentation(task).lane);
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [localView, setLocalView] = useState(defaultView);
  const [localExpanded, setLocalExpanded] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [reduced, setReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [lanes, setLanes] = useState<Record<string, number>>(() => Object.fromEntries(tasks.map(t => [t.id, laneOf(t)])));
  const previousRects = useRef<Map<string, DOMRect> | null>(null);
  const currentTasks = useRef(tasks);
  currentTasks.current = tasks;
  const selectedView = view ?? localView;
  const openId = expandedTaskId === undefined ? localExpanded : expandedTaskId;
  const setOpen = (id: string | null) => { if (expandedTaskId === undefined) setLocalExpanded(id); onExpandedTaskChange?.(id); };
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 620));
    if (root.current) observer.observe(root.current);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => { observer.disconnect(); media.removeEventListener('change', update); };
  }, []);
  useEffect(() => {
    setNow(Date.now());
    if (!tasks.some(t => presentation(t).clock === 'live' && t.startedAt !== undefined)) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [tasks, statusPresentation]);
  // Only the visual grouping is delayed; incoming task status/text is shown immediately.
  useEffect(() => {
    setNow(Date.now());
    if (!tasks.some(t => lanes[t.id] !== laneOf(t)) && Object.keys(lanes).length === tasks.length) return;
    const update = () => {
      previousRects.current = new Map(Array.from(root.current?.querySelectorAll<HTMLElement>('[data-id]') ?? []).map(e => [e.dataset.id!, e.getBoundingClientRect()]));
      setLanes(Object.fromEntries(currentTasks.current.map(t => [t.id, laneOf(t)])));
    };
    if (reduced || tasks.some(t => lanes[t.id] === undefined)) { update(); return; }
    const timer = setTimeout(update, 900);
    return () => clearTimeout(timer);
  }, [tasks, lanes, reduced, statusPresentation]);
  useLayoutEffect(() => {
    const old = previousRects.current;
    previousRects.current = null;
    if (!old || reduced) return;
    root.current?.querySelectorAll<HTMLElement>('[data-id]').forEach(el => {
      const before = old.get(el.dataset.id!); if (!before) return;
      const after = el.getBoundingClientRect(); const x = before.x - after.x, y = before.y - after.y;
      if (Math.abs(x) + Math.abs(y) > .5) el.animate([{transform: `translate(${x}px, ${y}px)`, zIndex: 2}, {transform: 'none', zIndex: 2}], {duration: 560, easing: 'cubic-bezier(.32,.72,.24,1)'});
    });
  }, [lanes, reduced, selectedView]);
  const selectView = (next: AgentInboxView) => {
    previousRects.current = new Map(Array.from(root.current?.querySelectorAll<HTMLElement>('[data-id]') ?? []).map(e => [e.dataset.id!, e.getBoundingClientRect()]));
    if (view === undefined) setLocalView(next);
    onViewChange?.(next);
  };
  const handlers = {approve: onApprove, reject: onReject, retry: onRetry, open: onOpen};
  const act = (action: AgentInboxAction, task: AgentTask) => {
    if (pendingTaskIds.includes(task.id)) return;
    const handler = handlers[action];
    if (handler) handler(task); else onAction?.(action, task);
  };
  const needs = tasks.filter(t => laneOf(t) === 0).length;
  const running = tasks.filter(t => laneOf(t) === 1).length;
  return <div ref={root} data-capture-root className={`agent-inbox ${className}`} data-view={selectedView} data-narrow={narrow ? '' : undefined} onKeyDown={event => {
    if (event.key === 'Escape' && openId) { event.preventDefault(); const button = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-id]') ?? []).find(el => el.dataset.id === openId)?.querySelector<HTMLButtonElement>('.agent-inbox__card-main'); setOpen(null); button?.focus(); }
  }}>
    <div className="agent-inbox__bar"><span className="agent-inbox__heading"><span className="agent-inbox__crumb">Agents</span><span className="agent-inbox__slash" aria-hidden="true">/</span><span className="agent-inbox__heading-title" title={title}>{title}</span></span>
      {!narrow && <div className="agent-inbox__views" role="radiogroup" aria-label="Layout">{(['board','list'] as const).map(mode => <button key={mode} type="button" role="radio" aria-checked={selectedView === mode} tabIndex={selectedView === mode ? 0 : -1} className="agent-inbox__view" onClick={() => selectView(mode)} onKeyDown={event => { if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'board' : event.key === 'End' ? 'list' : mode === 'board' ? 'list' : 'board'; selectView(next); (event.currentTarget.parentElement?.children[next === 'board' ? 0 : 1] as HTMLButtonElement)?.focus(); } }}><svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">{mode === 'board' ? <><rect x="1.8" y="2.2" width="3.2" height="9.6" rx="1"/><rect x="8.9" y="2.2" width="3.2" height="6.4" rx="1"/></> : <path d="M2.2 3.6h9.6M2.2 7h9.6M2.2 10.4h9.6"/>}</svg>{mode === 'board' ? 'Board' : 'List'}</button>)}</div>}
    </div>
    <div className="agent-inbox__lanes">{laneNames.map((name, lane) => {
      const items = tasks.filter(t => (lanes[t.id] ?? laneOf(t)) === lane);
      if (lane === 3 && !items.length) return null;
      return <section key={name} className="agent-inbox__lane" aria-label={name}><header className="agent-inbox__lane-head"><span className="agent-inbox__lane-spark"><Spark/></span><span className="agent-inbox__lane-name">{name}</span><span className="agent-inbox__count">{items.length}</span></header><ul className="agent-inbox__cards">{items.length === 0 && <li className="agent-inbox__empty">Nothing here</li>}{items.map(task => {
        const open = openId === task.id;
        const display = presentation(task);
        const seconds = display.clock === 'live' && task.startedAt !== undefined ? (now - task.startedAt) / 1000 : display.clock ? task.elapsed : undefined;
        const actions = display.actions ?? ((onOpen || onAction) ? ['open'] as const : []);
        const pending = pendingTaskIds.includes(task.id);
        return <li key={task.id} className="agent-inbox__card" data-id={task.id} data-status={task.status} data-tone={display.tone ?? 'neutral'} data-custom={statusPresentation?.[task.status] || !standardPresentation[task.status] ? '' : undefined} data-open={open ? '' : undefined} aria-busy={pending}>
          <button className="agent-inbox__card-main" type="button" aria-expanded={open} aria-controls={`${uid}-${task.id}`} onClick={() => setOpen(open ? null : task.id)}>
            <span className="agent-inbox__title-row"><span className="agent-inbox__spark"><Spark/></span><span className="agent-inbox__title">{task.title}</span></span>
            {task.description && <span className="agent-inbox__desc">{task.description}</span>}
            <span className="agent-inbox__foot"><span className="agent-inbox__state"><StatusIcon status={statusPresentation?.[task.status] ? 'custom' : task.status}/><span className="agent-inbox__state-word">{display.label}{seconds !== undefined ? task.status === 'done' && !statusPresentation?.done ? ' in ' : ' · ' : ''}</span>{seconds !== undefined && <span className="agent-inbox__time">{duration(seconds)}</span>}</span><span className="agent-inbox__meta">{task.sources !== undefined && <span title={`Sources read: ${task.sources}`}><MetaIcon kind="sources"/>{task.sources}</span>}{task.tools !== undefined && <span title={`Tool calls: ${task.tools}`}><MetaIcon kind="tools"/>{task.tools}</span>}</span></span>
          </button>
          <div id={`${uid}-${task.id}`} className="agent-inbox__fold" data-open={open ? '' : undefined} inert={!open}><div className="agent-inbox__clip"><div className="agent-inbox__more"><div className="agent-inbox__agent">{task.agent}</div>{!!task.steps?.length && <ol className="agent-inbox__steps">{task.steps.slice(-4).map((step,index,list) => <li key={`${index}-${step.label}`} data-last={index === list.length - 1 ? '' : undefined}><span>{step.label}</span>{step.time && <time>{step.time}</time>}</li>)}</ol>}{actions.length > 0 && <div className="agent-inbox__actions">{actions.map(action => <button key={action} type="button" className={`agent-inbox__btn${action === 'approve' || action === 'retry' ? ' agent-inbox__btn--primary' : ''}`} disabled={pending || (!handlers[action] && !onAction)} onClick={() => act(action,task)}>{action[0].toUpperCase() + action.slice(1)}</button>)}</div>}{pending && <p className="agent-inbox__feedback" role="status">Action pending…</p>}{actionErrors?.[task.id] && <p className="agent-inbox__feedback" role="alert">{actionErrors[task.id]}</p>}</div></div></div>
        </li>;
      })}</ul></section>;
    })}</div><span className="agent-inbox__sr" aria-live="polite">{needs} {needs === 1 ? 'needs' : 'need'} you, {running} running</span>
  </div>;
}
