'use client';

import {useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode} from 'react';
import {AnimatePresence, motion, useIsPresent} from 'motion/react';
import type {AgentRunStatus, RunCall, RunStep} from './types';
import './activity.css';

export interface AgentRunActivityProps {
  steps: RunStep[];
  status: AgentRunStatus;
  /** Overall run clock, including time between steps; supplied by the controller. */
  elapsedMs?: number;
}

const ease = [0.22, 1, 0.36, 1] as const;
const checkPath = 'M3.5 8.4 6.6 11.3 12.5 4.9';
const reducedQuery = '(prefers-reduced-motion: reduce)';
function subscribeMotion(listener: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
const motionPreference = () => window.matchMedia(reducedQuery).matches;
const serverMotionPreference = () => false;

// Glyph geometry observed in the reference's publicly rendered SVGs.
const glyphs: Record<string, string[]> = {
  stripe: ['M17.9583 8.38889C17.9583 6.24111 15.2907 4.5 12 4.5C8.7093 4.5 6.04167 6.24111 6.04167 8.38889C6.04167 10.5367 7.66667 11.7222 12 11.7222C16.3333 11.7222 18.5 12.8333 18.5 15.6111C18.5 18.3889 15.5899 19.5 12 19.5C8.41015 19.5 5.5 17.7589 5.5 15.6111', 'M12.5 2.5V4.21M12.5 21.5V19.79'],
  search: ['M17 17L21 21', 'M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z'],
  docs: ['M13 20.8268V22H14.1734C14.5827 22 14.7874 22 14.9715 21.9238C15.1555 21.8475 15.3003 21.7028 15.5897 21.4134L20.4133 16.5894C20.6864 16.3164 20.8229 16.1799 20.8959 16.0327C21.0347 15.7525 21.0347 15.4236 20.8959 15.1434C20.8229 14.9961 20.6864 14.8596 20.4133 14.5866C20.1403 14.3136 20.0038 14.1771 19.8565 14.1041C19.5763 13.9653 19.2473 13.9653 18.9671 14.1041C18.8198 14.1771 18.6833 14.3136 18.4103 14.5866L13.5867 19.4106C13.2972 19.7 13.1525 19.8447 13.0762 20.0287C13 20.2128 13 20.4174 13 20.8268Z', 'M19 11C19 11 19 9.4306 18.8478 9.06306C18.6955 8.69552 18.4065 8.40649 17.8284 7.82843L13.0919 3.09188C12.593 2.593 12.3436 2.34355 12.0345 2.19575C11.9702 2.165 11.9044 2.13772 11.8372 2.11401C11.5141 2 11.1614 2 10.4558 2C7.21082 2 5.58831 2 4.48933 2.88607C4.26731 3.06508 4.06508 3.26731 3.88607 3.48933C3 4.58831 3 6.21082 3 9.45584V14C3 17.7712 3 19.6569 4.17157 20.8284C5.23467 21.8915 6.8857 21.99 10 21.9991M12 2.5V3C12 5.82843 12 7.24264 12.8787 8.12132C13.7574 9 15.1716 9 18 9H18.5'],
  gmail: ["M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6", "M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z"],
  calendar: ["M16 2V6M8 2V6", "M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z", "M3 10H21", "M12.1258 14H12.0008M12.1258 18H12.0008M7.625 14H7.5M7.625 18H7.5M16.625 14H16.5M12.2508 14C12.2508 14.1381 12.1389 14.25 12.0008 14.25C11.8628 14.25 11.7508 14.1381 11.7508 14C11.7508 13.8619 11.8628 13.75 12.0008 13.75C12.1389 13.75 12.2508 13.8619 12.2508 14ZM12.2508 18C12.2508 18.1381 12.1389 18.25 12.0008 18.25C11.8628 18.25 11.7508 18.1381 11.7508 18C11.7508 17.8619 11.8628 17.75 12.0008 17.75C12.1389 17.75 12.2508 17.8619 12.2508 18ZM7.75 14C7.75 14.1381 7.63807 14.25 7.5 14.25C7.36193 14.25 7.25 14.1381 7.25 14C7.25 13.8619 7.36193 13.75 7.5 13.75C7.63807 13.75 7.75 13.8619 7.75 14ZM7.75 18C7.75 18.1381 7.63807 18.25 7.5 18.25C7.36193 18.25 7.25 18.1381 7.25 18C7.25 17.8619 7.36193 17.75 7.5 17.75C7.63807 17.75 7.75 17.8619 7.75 18ZM16.75 14C16.75 14.1381 16.6381 14.25 16.5 14.25C16.3619 14.25 16.25 14.1381 16.25 14C16.25 13.8619 16.3619 13.75 16.5 13.75C16.6381 13.75 16.75 13.8619 16.75 14Z"],
  tool: ['m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18'],
  approval: ['M11 6L21 6', 'M11 12L21 12', 'M11 18L21 18', 'M3 7.39286C3 7.39286 4 8.04466 4.5 9C4.5 9 6 5.25 8 4', 'M3 18.3929C3 18.3929 4 19.0447 4.5 20C4.5 20 6 16.25 8 15'],
};

function Glyph({name}: {name: string}) {
  const paths = glyphs[name.split('.')[0]] ?? glyphs.tool;
  return <svg className="ar-tool-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>;
}

function Chevron() {
  return <svg className="ar-tool-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6.25 8 9.75l3.5-3.5" /></svg>;
}

function CallStatus({status}: {status: RunCall['status']}) {
  if (status === 'running') return <svg className="ar-tool-ring" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.75" /><path d="M8 2.25a5.75 5.75 0 0 1 5.75 5.75" /></svg>;
  if (status === 'done') return <svg className="ar-tool-check" viewBox="0 0 16 16" aria-hidden="true"><path d={checkPath} pathLength="1" /></svg>;
  if (status === 'error') return <svg className="ar-tool-error" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.75" /><path d="M8 4.75v3.5M8 10.75v.1" /></svg>;
  return <span className="ar-tool-pending-dot" aria-hidden="true" />;
}

function duration(ms: number, running = false) {
  return running || ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

function runDuration(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function valueText(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? '';
}

function CodeValue({text}: {text: string}) {
  // Only tokenize JSON; arbitrary tool output remains ordinary text.
  if (!/^[\s]*[\[{]/.test(text)) return <>{text}</>;
  const tokens: ReactNode[] = [];
  const pattern = /("(?:\\.|[^"\\])*")(\s*:)?|\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b(true|false|null)\b/g;
  let start = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index!;
    tokens.push(text.slice(start, index));
    const kind = match[1] ? (match[2] ? 'key' : 'str') : match[3] ? 'num' : 'lit';
    tokens.push(<span key={index} className={`ar-tool-token-${kind}`}>{match[1] ?? match[0]}</span>);
    if (match[2]) tokens.push(match[2]);
    start = index + match[0].length;
  }
  tokens.push(text.slice(start));
  return <>{tokens}</>;
}

function CopyButton({text, label}: {text: string; label: string}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), 1800);
  }
  const title = state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed — try again' : `Copy ${label.toLowerCase()}`;
  return <>
    <button className="ar-tool-copy" type="button" onClick={copy} aria-label={title} title={title} data-copied={state === 'copied' || undefined}>
      <svg className="ar-tool-copy-icon" viewBox="0 0 16 16" aria-hidden="true"><rect x="5.25" y="5.25" width="8" height="8" rx="2" /><path d="M10.75 5.25v-1a1.5 1.5 0 0 0-1.5-1.5h-4.5a2 2 0 0 0-2 2v4.5a1.5 1.5 0 0 0 1.5 1.5h1" /></svg>
      <svg className="ar-tool-copy-done" viewBox="0 0 16 16" aria-hidden="true"><path d={checkPath} pathLength="1" /></svg>
    </button>
    <span className="ar-activity-sr" role="status">{state === 'copied' ? `${label} copied` : state === 'failed' ? 'Copy failed' : ''}</span>
  </>;
}

function ToolSection({label, value, waiting = false}: {label: string; value?: unknown; waiting?: boolean}) {
  const text = valueText(value);
  return <div className="ar-tool-section">
    <div className="ar-tool-section-head"><span className="ar-tool-label">{label}</span>{!waiting && <CopyButton text={text} label={label} />}</div>
    {waiting ? <p className="ar-tool-pending">Waiting for result…</p> : <pre className="ar-tool-code"><code><CodeValue text={text} /></code></pre>}
  </div>;
}

function ToolCall({call}: {call: RunCall}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const running = call.status === 'running';
  return <div className="ar-tool" data-status={call.status} data-open={open || undefined} data-call-id={call.id}>
    <span className="ar-activity-sr" role="status">{call.name} {call.status === 'done' ? 'finished' : call.status}</span>
    <button className="ar-tool-head" type="button" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(!open)}>
      <span className="ar-tool-icon" aria-hidden="true">{call.icon ?? <Glyph name={call.name} />}</span>
      <span className="ar-tool-main"><code className="ar-tool-name" title={call.name}>{call.name}</code><span className="ar-tool-summary" title={call.summary}>{call.summary}</span></span>
      <span className="ar-tool-status" key={call.status}><CallStatus status={call.status} /><span className="ar-tool-time">{call.status === 'error' ? 'Failed' : duration(running ? call.elapsedMs ?? 0 : call.durationMs, running)}</span></span>
      <Chevron />
    </button>
    <div id={bodyId} className="ar-tool-body" data-open={open || undefined} inert={!open}>
      <div className="ar-tool-clip"><div className="ar-tool-sections">
        {call.status === 'error' && <div className="ar-tool-error-notice"><CallStatus status="error" /><p>{call.error || 'Tool call failed'}</p></div>}
        {call.args !== undefined && <ToolSection label="Arguments" value={call.args} />}
        {(call.status !== 'error' || call.result !== undefined) && <ToolSection label="Result" value={call.result} waiting={(running || call.status === 'pending') && call.result === undefined} />}
      </div></div>
    </div>
  </div>;
}

function ToolGroup({calls}: {calls: RunCall[]}) {
  // Undefined follows the run; a deliberate toggle stays put as calls append.
  const [userOpen, setUserOpen] = useState<boolean>();
  const listId = useId();
  const working = calls.some(call => call.status === 'running' || call.status === 'pending');
  const failures = calls.filter(call => call.status === 'error').length;
  const failed = failures > 0;
  const open = userOpen ?? (working || failed);
  const label = working ? 'Using tools…' : `Used ${calls.length} ${calls.length === 1 ? 'tool' : 'tools'}`;
  const elapsed = calls.reduce((sum, call) => sum + (call.status === 'running' ? call.elapsedMs ?? 0 : call.status === 'error' ? call.elapsedMs ?? call.durationMs : call.durationMs), 0);
  return <div className="ar-tool-group" data-working={working || undefined} data-error={failed || undefined}>
    <span className="ar-activity-sr" role="status">{label}{failed ? `, ${failures} failed` : ''}</span>
    <button className="ar-tool-group-head" type="button" aria-expanded={open} aria-controls={listId} onClick={() => setUserOpen(!open)}>
      <span className="ar-tool-stack" aria-hidden="true">{calls.slice(-3).map(call => <span className="ar-tool-icon" key={call.id}>{call.icon ?? <Glyph name={call.name} />}</span>)}</span>
      <span className="ar-tool-group-title" key={`${label}-${failures}`}><span className="ar-tool-group-label" data-text={label}>{label}</span>{failed && <span className="ar-tool-group-fail">· {failures} failed</span>}<span className="ar-tool-group-time">· {duration(elapsed, working)}</span></span>
      <Chevron />
    </button>
    <div id={listId} className="ar-tool-body" data-open={open || undefined} inert={!open}>
      <div className="ar-tool-clip"><div className="ar-tool-list">{calls.map(call => <ToolCall key={call.id} call={call} />)}</div></div>
    </div>
  </div>;
}

function LoaderLabel({label}: {label: string}) {
  const present = useIsPresent();
  return <motion.span className={`ar-activity-loader-label${present ? ' ar-activity-loader-shine' : ''}`} data-text={label}
    initial={{y: '70%', opacity: 0, filter: 'blur(3px)'}} animate={{y: '0%', opacity: 1, filter: 'blur(0px)'}}
    exit={{y: '-70%', opacity: 0, filter: 'blur(3px)', transition: {duration: .32, ease}}}
    transition={{duration: .46, ease}}>{label}</motion.span>;
}

function ActivityLoader({label, done = false}: {label: string; done?: boolean}) {
  const measure = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();
  const reduced = useSyncExternalStore(subscribeMotion, motionPreference, serverMotionPreference);
  useLayoutEffect(() => {
    const element = measure.current;
    if (!element) return;
    const update = () => setWidth(Math.ceil(element.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div className="ar-activity-loader" data-done={done || undefined} role="status" aria-live="polite" aria-atomic="true">
    <span className="ar-activity-loader-visual" aria-hidden="true">
      <span className="ar-activity-loader-icon">
        <svg className="ar-activity-spinner" viewBox="0 0 16 16" fill="none">{Array.from({length: 8}, (_, ray) => <line key={ray} x1="8" y1="1.75" x2="8" y2="4.75" transform={`rotate(${ray * 45} 8 8)`} style={{animationDelay: `${-800 + ray * 100}ms`}} />)}</svg>
        <svg className="ar-activity-loader-check" viewBox="0 0 16 16" fill="none"><path d={checkPath} pathLength="1" /></svg>
      </span>
      <span className="ar-activity-loader-window" style={{width}}>
        <span className="ar-activity-loader-measure" ref={measure}>{label}</span>
        {reduced ? <span className="ar-activity-loader-label">{label}</span> : <AnimatePresence initial={false}><LoaderLabel key={label} label={label} /></AnimatePresence>}
      </span>
    </span>
    <span className="ar-activity-sr">{label}</span>
  </div>;
}

export function AgentRunActivity({steps, status, elapsedMs}: AgentRunActivityProps) {
  const headingId = useId();
  const activeStep = steps.find(step => step.status === 'waiting') ?? steps.find(step => step.status === 'running') ?? steps.filter(step => step.status === 'done').at(-1);
  const loading = status === 'running' || status === 'waiting';
  const done = status === 'completed';
  const caption = done ? elapsedMs === undefined ? 'Done' : `Done in ${runDuration(elapsedMs)}` : status === 'waiting' || activeStep?.status === 'waiting' ? 'Waiting for your approval' : activeStep?.title;
  return <section className="ar-activity" aria-labelledby={headingId}>
    <h2 id={headingId} className="ar-activity-heading">Activity</h2>
    {steps.map((step, index) => {
      if (step.status === 'pending') return null;
      const calls = step.calls.filter(call => call.status !== 'pending');
      const waiting = step.status === 'waiting';
      const denied = step.approval?.status === 'denied';
      const approved = step.approval?.status === 'approved';
      const failedStep = step.status === 'error' && !calls.length && status !== 'stopped';
      return <div className="ar-activity-entry" key={step.id} data-step-id={step.id} data-status={step.status}>
        <div className="ar-activity-entry-head"><span className="ar-activity-number" data-done={step.status === 'done' || undefined}>{index + 1}</span>{step.title}</div>
        {(waiting || approved || denied || failedStep || step.status === 'skipped') && <div className="ar-activity-note" data-state={waiting ? 'waiting' : denied || failedStep ? 'error' : approved ? 'approved' : 'skipped'}>
          <Glyph name="approval" />{waiting ? 'Waiting for your approval' : denied ? 'You denied this step' : step.status === 'error' ? 'Step failed' : approved ? 'You approved this step' : 'Skipped'}
        </div>}
        {calls.length > 0 && <ToolGroup calls={calls} />}
      </div>;
    })}
    {status === 'stopped' && !steps.some(step => step.calls.some(call => call.status === 'error')) && <div className="ar-activity-stopped"><svg className="ar-tool-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><circle cx="12" cy="12" r="9" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>Run stopped</div>}
    {(loading || done) && caption && <ActivityLoader label={caption} done={done} />}
  </section>;
}
