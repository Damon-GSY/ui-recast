'use client';

import {useId} from 'react';
import {motion, useReducedMotion} from 'motion/react';
import './agent-plan.css';

/** One TodoWrite item. Unknown upstream status strings remain visible and neutral. */
export interface AgentPlanTodo {
  readonly id: string;
  readonly content: string;
  readonly status: string;
  readonly activeForm?: string;
}

/** The caller selects the source version / round and replaces the whole snapshot. */
export interface AgentPlanSnapshot {
  readonly todos: readonly AgentPlanTodo[];
  readonly sourceVersion?: string | number;
  readonly round?: string | number;
}

export interface AgentPlanProps {
  readonly snapshot: AgentPlanSnapshot;
  readonly title?: string;
  readonly emptyMessage?: string;
  readonly className?: string;
}

function Spinner() {
  return <svg className="agent-plan__spinner" viewBox="0 0 16 16" aria-hidden="true">
    {Array.from({length: 8}, (_, index) => <line key={index} x1="8" y1="1.75" x2="8" y2="4.75"
      transform={`rotate(${index * 45} 8 8)`} style={{animationDelay: `${(index - 8) * 100}ms`}} />)}
  </svg>;
}

function Check() {
  return <svg className="agent-plan__check" viewBox="0 0 16 16" aria-hidden="true">
    <path pathLength="1" d="M4.2 8.4 6.8 11l5-5.6" />
  </svg>;
}

function visualStatus(status: string) {
  return status === 'pending' || status === 'in_progress' || status === 'completed' ? status : 'unknown';
}

/** Read-only presentation: no execution, editing, clock, network or data mutation. */
export function AgentPlan({snapshot, title = 'Agent plan', emptyMessage = 'No todos in this snapshot.', className}: AgentPlanProps) {
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const {todos, sourceVersion, round} = snapshot;
  const completed = todos.filter(todo => todo.status === 'completed').length;
  const active = todos.filter(todo => todo.status === 'in_progress');
  const allCompleted = todos.length > 0 && completed === todos.length;
  const summary = todos.length === 0 ? '0 steps' : `${completed} of ${todos.length} completed`;
  const announcement = [summary, ...active.map(todo => todo.activeForm || todo.content)].join('. ');

  return <section className={['agent-plan', className].filter(Boolean).join(' ')} aria-labelledby={titleId} data-readonly="true">
    <header className="agent-plan__head">
      <div className="agent-plan__meta">
        <span className="agent-plan__state">
          <svg className="agent-plan__state-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6.5 4.5h7M6.5 8h7M6.5 11.5h7" />
            <circle cx="3.25" cy="4.5" r=".6" /><circle cx="3.25" cy="8" r=".6" /><circle cx="3.25" cy="11.5" r=".6" />
          </svg>
          <span>Plan · {todos.length} {todos.length === 1 ? 'step' : 'steps'}</span>
        </span>
        {(sourceVersion !== undefined || round !== undefined) && <span className="agent-plan__source">
          {sourceVersion !== undefined && <span>Version {sourceVersion}</span>}
          {round !== undefined && <span>Round {round}</span>}
        </span>}
      </div>
      <h3 className="agent-plan__title" id={titleId}>{title}</h3>
    </header>
    <ol className="agent-plan__list" aria-label={`Plan: ${title}`}>
      {todos.map((todo, index) => {
        const status = visualStatus(todo.status);
        return <motion.li key={todo.id} className="agent-plan__step" data-todo-id={todo.id} data-status={todo.status} data-state={status}
          aria-current={status === 'in_progress' ? 'step' : undefined}
          layout={reducedMotion ? false : 'position'}
          initial={{opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 4}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: reducedMotion ? 0 : .26, ease: [.22, 1, .36, 1], layout: {duration: reducedMotion ? 0 : .42}}}>
          <span className="agent-plan__marker" aria-hidden="true">
            {status === 'in_progress' ? <Spinner /> : status === 'completed' ? <Check /> : status === 'unknown' ? <span>–</span> : <span>{index + 1}</span>}
          </span>
          <div className="agent-plan__main">
            <span className="agent-plan__content">{todo.content}</span>
            {status === 'in_progress' && todo.activeForm && <span className="agent-plan__active-form">{todo.activeForm}</span>}
            {status === 'unknown' ? <span className="agent-plan__unknown">{todo.status || 'Unspecified status'}</span>
              : <span className="agent-plan__sr">{status === 'in_progress' ? 'In progress' : status === 'completed' ? 'Completed' : 'Pending'}</span>}
          </div>
          {index < todos.length - 1 && <span className="agent-plan__rail" aria-hidden="true" />}
        </motion.li>;
      })}
    </ol>
    {todos.length === 0 && <p className="agent-plan__empty">{emptyMessage}</p>}
    <footer className="agent-plan__foot">
      <span className="agent-plan__summary" key={active.length > 0 ? 'active' : allCompleted ? 'complete' : 'pending'}>
        {active.length > 0 ? <Spinner /> : allCompleted ? <Check /> : null}
        <span className="agent-plan__summary-label" data-active={active.length > 0 || undefined} data-text={summary}>{summary}</span>
      </span>
    </footer>
    <p className="agent-plan__sr" role="status" aria-atomic="true">{announcement}</p>
  </section>;
}

export default AgentPlan;
