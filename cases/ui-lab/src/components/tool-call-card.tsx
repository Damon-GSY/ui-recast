'use client';

import { useId, useState, type ReactNode } from 'react';
import { Chevron, CodeSection, ErrorIcon, Spinner, WrenchIcon, type ToolCopyHandler } from './tool-call-card/pieces';
import './tool-call-card.css';

export type ToolCallStatus = 'unknown' | 'running' | 'success' | 'error' | 'cancelled';
/** Availability is independent of execution status. Captured null/false/0 are real values. */
export type ToolCallResult =
  | { state: 'not-captured'; reason?: string }
  | { state: 'pending'; label?: string }
  | { state: 'empty'; label?: string }
  | { state: 'captured'; value: unknown };

export type ToolCallCardProps = {
  name: string;
  summary?: ReactNode;
  icon?: ReactNode;
  status?: ToolCallStatus;
  args?: unknown;
  result?: ToolCallResult;
  error?: string;
  /** Authoritative milliseconds supplied by the caller. Never measured in the UI. */
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCopy?: ToolCopyHandler;
  maxCodeHeight?: number;
  /** Custom ToolContent replaces the default result section; no status is inferred from it. */
  children?: ReactNode;
  className?: string;
};

const statusLabel: Record<ToolCallStatus, string> = {
  unknown: 'Status unknown', running: 'Running', success: 'Succeeded', error: 'Failed', cancelled: 'Cancelled',
};

function durationText(duration?: number) {
  if (duration === undefined || !Number.isFinite(duration) || duration < 0) return undefined;
  return duration < 1000 ? `${Math.round(duration)}ms` : `${(duration / 1000).toFixed(1)}s`;
}

/** Read-only view of caller-owned execution data. Only disclosure state can be internal. */
export function ToolCallCard({ name, summary, icon, status = 'unknown', args, result,
  error, duration, open: controlledOpen, defaultOpen = false, onOpenChange, onCopy,
  maxCodeHeight = 220, children, className = '' }: ToolCallCardProps) {
  const id = useId();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const label = statusLabel[status] ?? statusLabel.unknown;
  const time = durationText(duration);
  const resultState = result?.state ?? 'not-captured';
  function toggle() {
    if (controlledOpen === undefined) setLocalOpen(!open);
    onOpenChange?.(!open);
  }
  return <div className={`ui-tcc ${className}`} data-status={status} data-open={open || undefined}>
    <span className="ui-tcc-sr" role="status">{name}: {label}{error && status === 'error' ? `: ${error}` : ''}</span>
    <button type="button" className="ui-tcc__head" aria-expanded={open} aria-controls={`${id}-body`} onClick={toggle}>
      <span className="ui-tcc__icon" aria-hidden="true">{icon ?? <WrenchIcon />}</span>
      <span className="ui-tcc__main"><code className="ui-tcc__name" title={name}>{name}</code>
        {summary != null && <span className="ui-tcc__summary" title={typeof summary === 'string' ? summary : undefined}>{summary}</span>}
      </span>
      <span className="ui-tcc__status" key={status}>
        {status === 'running' && <Spinner />}
        {status === 'success' && <svg className="ui-tcc__ok" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7"/><path d="M5.1 8.2 7.1 10.1 10.9 6" pathLength={1}/></svg>}
        {status === 'error' && <ErrorIcon />}
        <span className="ui-tcc__time">{time !== undefined && (status === 'running' || status === 'success') ? time : `${label}${time === undefined ? '' : ` · ${time}`}`}</span>
      </span><Chevron />
    </button>
    <div className="ui-tcc__body" id={`${id}-body`} inert={!open}>
      <div className="ui-tcc__clip"><div className="ui-tcc__sections">
        {status === 'error' && <div className="ui-tcc__error"><ErrorIcon/><p className="ui-tcc__error-text">{error ?? 'The tool call failed.'}</p></div>}
        {args !== undefined && <CodeSection label="Arguments" value={args} cap={maxCodeHeight} onCopy={onCopy}/>}
        {children != null ? children : result?.state === 'captured'
          ? <CodeSection label="Result" value={result.value} cap={maxCodeHeight} onCopy={onCopy}/>
          : <ToolContent title="Result"><p className="ui-tcc__pending" data-result-state={resultState}>
            {result?.state === 'pending' ? result.label ?? 'Waiting for result…'
              : result?.state === 'empty' ? result.label ?? 'The tool returned no content.'
              : result?.state === 'not-captured' ? result.reason ?? 'Result not captured.' : 'Result not captured.'}
          </p></ToolContent>}
      </div></div>
    </div>
  </div>;
}

/** Arbitrary application content: links, tables, media, or another component. */
export function ToolContent({ title, children, className = '' }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return <div className={`ui-tcc__section ui-tcc__content ${className}`}>
    {title != null && <div className="ui-tcc__section-head"><span className="ui-tcc__label">{title}</span></div>}
    {children}
  </div>;
}

export type ToolCallGroupProps = {
  children: ReactNode;
  label?: string;
  /** Visible tool marks supplied explicitly; execution state is never inferred from children. */
  icons?: readonly { id: string; icon: ReactNode }[];
  status?: ToolCallStatus;
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/** Explicit group label/status/duration: no child inspection or inferred aggregate success. */
export function ToolCallGroup({ children, label = 'Tool calls', icons = [], status = 'unknown', duration,
  open: controlledOpen, defaultOpen = false, onOpenChange, className = '' }: ToolCallGroupProps) {
  const id = useId();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const time = durationText(duration);
  return <div className={`ui-tcc-group ${className}`} data-open={open || undefined} data-status={status}>
    <button type="button" className="ui-tcc-group__head" aria-expanded={open} aria-controls={`${id}-list`} onClick={() => {
      if (controlledOpen === undefined) setLocalOpen(!open);
      onOpenChange?.(!open);
    }}>
      {icons.length > 0 && <span className="ui-tcc-group__stack" aria-hidden="true">{icons.map(item => <span className="ui-tcc__icon" key={item.id}>{item.icon}</span>)}</span>}
      <span className="ui-tcc-group__title" key={status}>
        <span className={`ui-tcc-group__label${status === 'running' ? ' ui-tcc__shine' : ''}`} data-text={label}>{label}</span>
        <span className="ui-tcc-sr">{statusLabel[status] ?? statusLabel.unknown}</span>
        {(status === 'unknown' || status === 'cancelled' || status === 'error') && <span className={status === 'error' ? 'ui-tcc-group__failed' : 'ui-tcc-group__time'}>{statusLabel[status]}</span>}
        {time !== undefined && <span className="ui-tcc-group__time">· {time}</span>}
      </span><Chevron/>
    </button>
    <div className="ui-tcc__body" id={`${id}-list`} inert={!open}><div className="ui-tcc__clip"><div className="ui-tcc-group__list">{children}</div></div></div>
  </div>;
}
