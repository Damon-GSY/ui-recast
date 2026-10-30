import {useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode} from 'react';
import type {RunApproval, RunUser} from './types';
import './panel.css';

export interface AgentRunPanelProps {
  approval?: RunApproval & {stepId: string; stepIndex: number; tool?: string};
  draft?: ReactNode;
  filePreview?: ReactNode;
  details?: ReactNode;
  heading?: ReactNode;
  /** The reference draft-review layout has an empty approval state. */
  showApprovalPlaceholder?: boolean;
  agent?: string;
  user?: RunUser;
  toolCallCount?: number;
  cost?: string;
  onApprove?: (stepId: string) => void;
  onDeny?: (stepId: string, reason?: string) => void;
  onClose?: () => void;
}

// Glyph geometry comes from the public preview's rendered SVG, not component source.
type PanelIconName = 'brain' | 'mail' | 'people' | 'tools' | 'coins' | 'calendar';
const iconGeometry: Record<PanelIconName, ReactNode> = {
  brain: <><path d="M7 4.5C5.34315 4.5 4 5.84315 4 7.5C4 8.06866 4.15822 8.60037 4.43304 9.0535C3.04727 9.31855 2 10.537 2 12C2 13.463 3.04727 14.6814 4.43304 14.9465M7 4.5C7 3.11929 8.11929 2 9.5 2C10.8807 2 12 3.11929 12 4.5V19.5C12 20.8807 10.8807 22 9.5 22C8.11929 22 7 20.8807 7 19.5C5.34315 19.5 4 18.1569 4 16.5C4 15.9313 4.15822 15.3996 4.43304 14.9465M7 4.5C7 5.31791 7.39278 6.04408 8 6.50018M4.43304 14.9465C4.78948 14.3588 5.34207 13.9032 6 13.6707" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 19.4999C18.6569 19.4999 20 18.1567 20 16.4999C20 15.9312 19.8418 15.3995 19.567 14.9464C20.9527 14.6813 22 13.4629 22 11.9999C22 10.5369 20.9527 9.31843 19.567 9.05338M17 19.4999C17 20.8806 15.8807 21.9999 14.5 21.9999C13.1193 21.9999 12 20.8806 12 19.4999L12 4.49988C12 3.11917 13.1193 1.99988 14.5 1.99988C15.8807 1.99988 17 3.11917 17 4.49988C18.6569 4.49988 20 5.84302 20 7.49988C20 8.06854 19.8418 8.60024 19.567 9.05338M17 19.4999C17 18.682 16.6072 17.9558 16 17.4997M19.567 9.05338C19.2105 9.64109 18.6579 10.0966 18 10.3292" strokeLinecap="round" strokeLinejoin="round"/></>,
  mail: <><path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" strokeLinejoin="round"/><path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" strokeLinejoin="round"/></>,
  people: <><path d="M18.4995 20.5C18.2663 17.5685 15.8417 15.2477 12.808 15.0521L11.9995 15C11.7107 15.0076 11.4416 15.0178 11.1877 15.0298C8.18075 15.1723 5.7304 17.5974 5.49951 20.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.2495 9.25C15.2495 11.0449 13.7944 12.5 11.9995 12.5C10.2046 12.5 8.74952 11.0449 8.74952 9.25C8.74952 7.45507 10.2046 6 11.9995 6C13.7944 6 15.2495 7.45507 15.2495 9.25Z" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.50249 8.5C5.17908 7.99485 4.99158 7.39432 4.99158 6.75C4.99158 4.95507 6.44665 3.5 8.24157 3.5C8.68752 3.5 9.1125 3.58982 9.49939 3.75235" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.4963 8.5C18.8197 7.99485 19.0072 7.39432 19.0072 6.75C19.0072 4.95507 17.5521 3.5 15.7572 3.5C15.3113 3.5 14.8863 3.58982 14.4994 3.75235" strokeLinecap="round" strokeLinejoin="round"/><path d="M22.0007 17.9996C21.8208 15.7374 19.9995 13.5 17.9995 13" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.99927 17.9996C2.17923 15.7374 4.00049 13.5 6.00049 13" strokeLinecap="round" strokeLinejoin="round"/></>,
  tools: <><path d="M3 4C3 2.34533 3.34533 2 5 2H9C10.6547 2 11 2.34533 11 4C11 5.65467 10.6547 6 9 6H5C3.34533 6 3 5.65467 3 4Z"/><path d="M13 13C13 11.3453 13.3453 11 15 11H19C20.6547 11 21 11.3453 21 13C21 14.6547 20.6547 15 19 15H15C13.3453 15 13 14.6547 13 13Z"/><path d="M4 20C4 18.3453 4.34533 18 6 18H10C11.6547 18 12 18.3453 12 20C12 21.6547 11.6547 22 10 22H6C4.34533 22 4 21.6547 4 20Z"/><path d="M17 11C17 10.5353 17 10.303 16.9616 10.1098C16.8038 9.31644 16.1836 8.69624 15.3902 8.53843C15.197 8.5 14.9647 8.5 14.5 8.5H9.5C9.03534 8.5 8.80302 8.5 8.60982 8.46157C7.81644 8.30376 7.19624 7.68356 7.03843 6.89018C7 6.69698 7 6.46466 7 6" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 15V16C17 17.8856 17 18.8284 16.4142 19.4142C15.8284 20 14.8856 20 13 20H12" strokeLinecap="round" strokeLinejoin="round"/></>,
  coins: <><ellipse cx="15.5" cy="11" rx="6.5" ry="2"/><path d="M22 15.5C22 16.6046 19.0899 17.5 15.5 17.5C11.9101 17.5 9 16.6046 9 15.5"/><path d="M22 11V19.8C22 21.015 19.0899 22 15.5 22C11.9101 22 9 21.015 9 19.8V11"/><ellipse cx="8.5" cy="4" rx="6.5" ry="2"/><path d="M6 11C4.10819 10.7698 2.36991 10.1745 2 9M6 16C4.10819 15.7698 2.36991 15.1745 2 14" strokeLinecap="round"/><path d="M6 21C4.10819 20.7698 2.36991 20.1745 2 19L2 4" strokeLinecap="round"/><path d="M15 6V4" strokeLinecap="round"/></>,
  calendar: <><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M8 15h3m-3 4h3m4-4h1"/></>,
};

function PanelIcon({name, size = 14}: {name: PanelIconName; size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconGeometry[name]}</svg>;
}

function ApprovalCard({approval, onApprove, onDeny}: Pick<AgentRunPanelProps, 'onApprove' | 'onDeny'> & {approval: NonNullable<AgentRunPanelProps['approval']>}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const pendingCard = useRef<HTMLDivElement>(null);
  const resultCard = useRef<HTMLDivElement>(null);
  const previousStatus = useRef(approval.status ?? 'pending');
  const status = approval.status ?? 'pending';
  const pending = status === 'pending';

  // Only the visual height is retained here; approval decisions belong to the caller.
  useLayoutEffect(() => {
    const element = root.current;
    const content = pending ? pendingCard.current : resultCard.current;
    if (!element || !content || !label.current) return;
    const measure = () => {
      element.style.height = `${label.current!.getBoundingClientRect().height + content.getBoundingClientRect().height + 8}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    observer.observe(label.current);
    if (previousStatus.current === 'pending' && !pending) resultCard.current?.focus({preventScroll: true});
    previousStatus.current = status;
    return () => observer.disconnect();
  }, [pending, status]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!pending || event.defaultPrevented || event.repeat || event.nativeEvent.isComposing) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && onApprove) {
      event.preventDefault();
      event.stopPropagation();
      onApprove(approval.stepId);
    } else if (event.key === 'Escape' && onDeny) {
      event.preventDefault();
      event.stopPropagation();
      onDeny(approval.stepId);
    }
  };

  return <div ref={root} onKeyDown={handleKeyDown} className="ar-run-approval" data-status={status} role="group" aria-labelledby={`${id}-${pending ? 'title' : 'result-title'}`} aria-describedby={pending ? `${id}-description` : undefined}>
    <div ref={label} className="ar-run-approval-label" title={`Step ${approval.stepIndex + 1}${approval.tool ? ` · ${approval.tool}` : ''}`}>Step {approval.stepIndex + 1}{approval.tool && ` · ${approval.tool}`}</div>
    <div ref={pendingCard} className="ar-run-approval-card ar-run-approval-pending" aria-hidden={!pending || undefined} inert={!pending}>
      <div className="ar-run-approval-head">
        <span className="ar-run-approval-icon"><PanelIcon name={approval.tool?.startsWith('calendar') ? 'calendar' : 'mail'} size={15}/></span>
        <div className="ar-run-approval-titles">
          <h3 id={`${id}-title`} title={approval.title} dir="auto">{approval.title}</h3>
          <p id={`${id}-description`} title={approval.description} dir="auto">{approval.description}</p>
        </div>
        <span className="ar-run-approval-risk" data-risk={approval.risk}><span aria-hidden="true"/>{approval.risk[0].toUpperCase() + approval.risk.slice(1)}<span className="ar-run-approval-risk-word"> risk</span></span>
      </div>
      {approval.details.length > 0 && <div className="ar-run-approval-preview"><dl className="ar-run-approval-details">{approval.details.map(({label: name, value}, index) => <div key={`${name}-${index}`}><dt>{name}</dt><dd dir="auto">{value}</dd></div>)}</dl></div>}
      <div className="ar-run-approval-foot"><div className="ar-run-approval-actions">
        <button type="button" className="ar-run-approval-button" onClick={() => onDeny?.(approval.stepId)} disabled={!onDeny} aria-keyshortcuts="Escape">Deny<kbd aria-hidden="true">Esc</kbd></button>
        <button type="button" className="ar-run-approval-button ar-run-approval-button-primary" onClick={() => onApprove?.(approval.stepId)} disabled={!onApprove} aria-keyshortcuts="Meta+Enter Control+Enter">Approve<kbd aria-hidden="true">⌘↵</kbd></button>
      </div></div>
    </div>
    {!pending && <div ref={resultCard} className="ar-run-approval-card ar-run-approval-result" tabIndex={-1}>
      <span className="ar-run-approval-result-icon"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true">{status === 'approved' ? <path d="M4.2 8.4 6.9 11 11.8 5.6" pathLength="1"/> : <path d="M5.2 5.2 10.8 10.8M10.8 5.2 5.2 10.8" pathLength="1"/>}</svg></span>
      <span className="ar-run-approval-result-title" id={`${id}-result-title`} title={approval.title} dir="auto">{approval.title}</span>
      <span className="ar-run-approval-result-status" title={status === 'denied' ? approval.reason : undefined}>{status === 'approved' ? 'Approved' : 'Denied'}</span>
    </div>}
    <span className="ar-panel-sr" role="status" aria-live="polite">{!pending ? `${status === 'approved' ? 'Approved' : 'Denied'}: ${approval.title}` : ''}</span>
  </div>;
}

export function AgentRunPanel({approval, draft, filePreview, details, heading, showApprovalPlaceholder = false, agent, user, toolCallCount, cost, onApprove, onDeny, onClose}: AgentRunPanelProps) {
  const pending = approval && (approval.status ?? 'pending') === 'pending';
  const hasDetails = agent !== undefined || user !== undefined || toolCallCount !== undefined || cost !== undefined;
  return <aside className="ar-panel" aria-label="Run details">
    <header className="ar-panel-header"><span className="ar-panel-heading"><b>{heading ?? (approval || showApprovalPlaceholder ? 'Needs your input' : 'Run details')}</b>{pending && <span className="ar-panel-count">1</span>}</span>{onClose && <button type="button" className="ar-panel-close" aria-label="Close run details" onClick={onClose}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8"/></svg></button>}</header>
    <div className="ar-panel-body">
      {(approval || showApprovalPlaceholder) && <section className="ar-panel-section" aria-label="Approvals">
        {approval ? <ApprovalCard key={approval.stepId} approval={approval} onApprove={onApprove} onDeny={onDeny}/> : <div className="ar-panel-empty"><span className="ar-panel-empty-icon"><PanelIcon name="brain" size={16}/></span><b>Nothing needs you yet</b><p>The agent asks here before it sends or books anything.</p></div>}
      </section>}
      {draft != null && <section className="ar-panel-section" aria-label="Draft"><span className="ar-panel-label">Draft</span>{draft}</section>}
      {filePreview != null && <section className="ar-panel-section ar-panel-file-preview" aria-label="File preview">{filePreview}</section>}
      {details !== undefined ? details : hasDetails && <section className="ar-panel-section" aria-label="Details"><span className="ar-panel-label">Details</span><dl className="ar-panel-details">
        {agent !== undefined && <div><dt><PanelIcon name="brain"/>Agent</dt><dd>{agent}</dd></div>}
        {user !== undefined && <div><dt><PanelIcon name="people"/>Triggered by</dt><dd>{user.name}</dd></div>}
        {toolCallCount !== undefined && <div><dt><PanelIcon name="tools"/>Tool calls</dt><dd>{toolCallCount}</dd></div>}
        {cost !== undefined && <div><dt><PanelIcon name="coins"/>Cost</dt><dd>{cost}</dd></div>}
      </dl></section>}
    </div>
  </aside>;
}
