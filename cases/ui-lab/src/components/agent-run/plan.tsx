import {useId, useLayoutEffect, useRef, useState, type KeyboardEvent} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import type {AgentRunStatus, RunStep} from './types';
import './plan.css';

export interface AgentRunPlanProps {
  title: string;
  steps: RunStep[];
  status: AgentRunStatus;
  elapsedMs: number;
  onStepsChange?: (updatedSteps: RunStep[]) => void;
  onRetry?: (stepId: string) => void;
}

function PlanSpinner() {
  return <svg className="ar-plan__spinner" viewBox="0 0 16 16" aria-hidden="true">
    {Array.from({length: 8}, (_, index) => <line key={index} x1="8" y1="1.75" x2="8" y2="4.75"
      transform={`rotate(${index * 45} 8 8)`} style={{animationDelay: `${(index - 8) * 100}ms`}} />)}
  </svg>;
}

function PlanMark({error = false}: {error?: boolean}) {
  return <svg className="ar-plan__mark" viewBox="0 0 16 16" aria-hidden="true">
    <path className={error ? undefined : 'ar-plan__draw'} pathLength="1"
      d={error ? 'M8 4.2v4.4M8 11.6h.01' : 'M4.2 8.4 6.8 11l5-5.6'} />
  </svg>;
}

function stepTime(ms: number) {
  const seconds = Math.max(0, ms) / 1000;
  return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
}

function totalTime(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

const statusNames: Record<RunStep['status'], string> = {
  pending: 'Pending', running: 'In progress', waiting: 'Waiting for approval',
  done: 'Done', error: 'Failed', skipped: 'Skipped',
};

/** Controlled plan: edits emit new steps; all run progress and clocks come from the caller. */
export function AgentRunPlan({title, steps, status, elapsedMs, onStepsChange, onRetry}: AgentRunPlanProps) {
  const labelId = useId();
  const helpId = useId();
  const reducedMotion = useReducedMotion();
  const editable = status === 'idle' && Boolean(onStepsChange);
  const running = status === 'running' || status === 'waiting';
  const [editing, setEditing] = useState<{id: string; value: string} | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const dragId = useRef<string | null>(null);
  const activeIndex = steps.findIndex(step => step.status === 'running' || step.status === 'waiting');
  const failedIndex = steps.findIndex(step => step.status === 'error');
  const completedCount = steps.filter(step => step.status === 'done').length;
  const failed = status === 'stopped' || status === 'denied' || status === 'error';
  const footerText = running
    ? `Running · ${activeIndex < 0 ? completedCount : activeIndex + 1} of ${steps.length}`
    : status === 'completed' ? `Done in ${totalTime(elapsedMs)}`
    : failed ? `Stopped${failedIndex >= 0 ? ` · step ${failedIndex + 1} failed` : ''}`
    : 'Review your plan';

  useLayoutEffect(() => {
    if (editing && editable) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing?.id, editable]);

  useLayoutEffect(() => {
    if (pendingFocus.current !== null) {
      const row = rowRefs.current.get(pendingFocus.current);
      (row ?? listRef.current)?.focus();
      pendingFocus.current = null;
    }
  }, [steps, editing]);

  function rename(step: RunStep) {
    if (editable) setEditing({id: step.id, value: step.title});
  }

  function finishRename(save: boolean) {
    if (!editing) return;
    const nextTitle = editing.value.trim();
    const previous = steps.find(step => step.id === editing.id);
    pendingFocus.current = editing.id;
    if (save && editable && nextTitle && previous && nextTitle !== previous.title) {
      onStepsChange?.(steps.map(step => step.id === editing.id ? {...step, title: nextTitle} : step));
      setAnnouncement(`Renamed “${previous.title}” to “${nextTitle}”.`);
    }
    setEditing(null);
  }

  function move(from: number, to: number) {
    if (!editable || from === to || to < 0 || to >= steps.length) return;
    const next = [...steps];
    const [step] = next.splice(from, 1);
    next.splice(to, 0, step);
    pendingFocus.current = step.id;
    onStepsChange?.(next);
    setAnnouncement(`Moved “${step.title}” to position ${to + 1} of ${steps.length}.`);
  }

  function remove(index: number) {
    if (!editable) return;
    const step = steps[index];
    const next = steps.filter(item => item.id !== step.id);
    pendingFocus.current = next[Math.min(index, next.length - 1)]?.id ?? '';
    onStepsChange?.(next);
    setAnnouncement(`Removed “${step.title}”. ${next.length} ${next.length === 1 ? 'step' : 'steps'} remaining.`);
    if (editing?.id === step.id) setEditing(null);
  }

  function onRowKey(event: KeyboardEvent<HTMLLIElement>, index: number) {
    if (!editable || event.target !== event.currentTarget || event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') {event.preventDefault(); rename(steps[index]);}
    else if (event.key === 'Delete') {event.preventDefault(); remove(index);}
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = index + (event.key === 'ArrowUp' ? -1 : 1);
      if (event.altKey) move(index, next);
      else if (steps[next]) rowRefs.current.get(steps[next].id)?.focus();
    }
  }

  return <section className="ar-plan" data-status={status} data-editable={editable || undefined} aria-labelledby={labelId}>
    <div className="ar-plan__card">
      <header className="ar-plan__head">
        <div className="ar-plan__meta"><span className="ar-plan__state">
          <svg className="ar-plan__state-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6.5 4.5h7M6.5 8h7M6.5 11.5h7" />
            <circle cx="3.25" cy="4.5" r=".6" /><circle cx="3.25" cy="8" r=".6" /><circle cx="3.25" cy="11.5" r=".6" />
          </svg>
          <span>Plan · {steps.length} {steps.length === 1 ? 'step' : 'steps'}</span>
        </span></div>
        <h3 className="ar-plan__title" id={labelId} dir="auto">{title}</h3>
      </header>
      {editable && <p id={helpId} className="ar-plan__sr">Press Enter to rename, Alt plus arrow keys to move, Delete to remove.</p>}
      <ol className="ar-plan__list" aria-label={`Plan: ${title}`} ref={listRef} tabIndex={-1}>
        <AnimatePresence initial={false}>{steps.map((step, index) => {
          const active = step.status === 'running' || step.status === 'waiting';
          const visualStatus = active ? 'active' : step.status;
          const isEditing = editable && editing?.id === step.id;
          const duration = step.status === 'done' ? (step.durationMs ?? step.elapsedMs) : active ? step.elapsedMs : undefined;
          return <motion.li key={step.id} className="ar-plan__step" data-step={visualStatus}
            layout={reducedMotion ? false : 'position'} initial={false}
            transition={{layout: {duration: reducedMotion ? 0 : .42, ease: [.22, 1, .36, 1]}}}
            exit={{height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, overflow: 'hidden', transition: {duration: reducedMotion ? 0 : .26, opacity: {duration: reducedMotion ? 0 : .18}, ease: [.22, 1, .36, 1]}}}
            ref={element => {if (element) rowRefs.current.set(step.id, element); else rowRefs.current.delete(step.id);}}
            tabIndex={editable ? 0 : undefined} aria-describedby={editable ? helpId : undefined}
            aria-keyshortcuts={editable ? 'Enter Alt+ArrowUp Alt+ArrowDown Delete' : undefined}
            aria-current={active ? 'step' : undefined} onKeyDown={event => onRowKey(event, index)}
            onDragOver={event => {if (editable && dragId.current) event.preventDefault();}}
            onDrop={event => {
              if (!editable || !dragId.current) return;
              event.preventDefault();
              const from = steps.findIndex(item => item.id === dragId.current);
              if (from >= 0) move(from, index);
              dragId.current = null;
            }}>
            <span className="ar-plan__marker" aria-hidden="true">
              {active ? <PlanSpinner /> : step.status === 'done' ? <PlanMark /> : step.status === 'error' ? <PlanMark error />
                : step.status === 'skipped' ? <span>–</span> : <span>{index + 1}</span>}
            </span>
            {editable && <span className="ar-plan__grip" draggable aria-hidden="true" title="Drag to reorder"
              onDragStart={event => {dragId.current = step.id; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', step.id);}}
              onDragEnd={() => {dragId.current = null;}}>
              <svg viewBox="0 0 16 16">{[4, 8, 12].map(y => <g key={y}><circle cx="6" cy={y} r="1.1" /><circle cx="10" cy={y} r="1.1" /></g>)}</svg>
            </span>}
            <div className="ar-plan__main">
              {isEditing ? <input ref={inputRef} className="ar-plan__edit" aria-label={`Rename step ${index + 1}`}
                value={editing.value} onChange={event => setEditing({id: step.id, value: event.target.value})}
                onBlur={() => finishRename(true)} onKeyDown={event => {
                  event.stopPropagation();
                  if (event.nativeEvent.isComposing) return;
                  if (event.key === 'Enter') {event.preventDefault(); finishRename(true);}
                  else if (event.key === 'Escape') {event.preventDefault(); finishRename(false);}
                }} />
                : <span className="ar-plan__name" dir="auto" onDoubleClick={() => rename(step)}>{step.title}</span>}
              {(step.detail || step.tool) && <span className="ar-plan__sub">
                {step.detail && <span className="ar-plan__detail" dir="auto">{step.detail}</span>}
                {step.tool && <code className="ar-plan__tool" title={step.tool}>{step.tool}</code>}
              </span>}
              <span className="ar-plan__sr">, {statusNames[step.status]}</span>
              {step.status === 'error' && <span className="ar-plan__fail">
                {step.error && <span className="ar-plan__error" dir="auto">{step.error}</span>}
                <button type="button" className="ar-plan__retry" disabled={!onRetry} onClick={() => onRetry?.(step.id)}>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13 3v2.6h-2.6" /></svg>
                  Retry from here
                </button>
              </span>}
            </div>
            <span className="ar-plan__aside">
              {duration !== undefined && <span className={`ar-plan__time${step.status === 'done' ? ' ar-plan__time--done' : ''}`}>
                <span className="ar-plan__sr">{step.status === 'done' ? 'took ' : 'elapsed '}</span>{stepTime(duration)}
              </span>}
              {editable && <button type="button" className="ar-plan__remove" aria-label={`Remove step ${index + 1}: ${step.title}`}
                onClick={() => remove(index)}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" /></svg></button>}
            </span>
            {index < steps.length - 1 && <span className="ar-plan__rail" aria-hidden="true" />}
          </motion.li>;
        })}</AnimatePresence>
      </ol>
    </div>
    <div key={running ? 'running' : status} className="ar-plan__foot" data-phase={running ? 'running' : status}>
      <span className="ar-plan__status"><span className="ar-plan__status-icon" aria-hidden="true">
        {running ? <PlanSpinner /> : status === 'completed' ? <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" /><path className="ar-plan__draw" pathLength="1" d="M5.4 8.2 7.2 10l3.4-3.8" /></svg> : failed
          ? <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" /><path d="M8 4.9v3.6M8 11h.01" /></svg>
          : <svg viewBox="0 0 16 16"><path d="m3.5 8 3 3 6-6" /></svg>}
      </span><span>{footerText}</span></span>
      {running && <span className="ar-plan__elapsed" aria-label={`Elapsed ${totalTime(elapsedMs)}`}>{totalTime(elapsedMs)}</span>}
    </div>
    <p className="ar-plan__sr" role="status" aria-live="polite" aria-atomic="true">{editable ? announcement : failedIndex >= 0 ? `Step ${failedIndex + 1} failed: ${steps[failedIndex].title}${steps[failedIndex].error ? `. ${steps[failedIndex].error}` : ''}` : `${footerText}${activeIndex >= 0 ? `. ${steps[activeIndex].title}` : ''}`}</p>
  </section>;
}
