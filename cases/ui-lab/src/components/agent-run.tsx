'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {AppShellInset, type AppShellInsetProps} from './app-shell-inset';
import {AgentRunPlan} from './agent-run/plan';
import {AgentRunActivity} from './agent-run/activity';
import {AgentRunPanel} from './agent-run/panel';
import {HeaderIcon} from './agent-run/header-icons';
import {AgentRunDiff} from './agent-run/diff';
import type {AgentRunStatus, DraftDecisions, RunDraft, RunStep, RunUser} from './agent-run/types';
import './agent-run.css';

export type {AgentRunStatus, DraftDecisions, RunApproval, RunCall, RunDraft, RunStep, RunUser} from './agent-run/types';

export interface AgentRunProps {
  title: string;
  steps: RunStep[];
  status: AgentRunStatus;
  elapsedMs: number;
  draft?: RunDraft;
  /** Set false when the host already provides application navigation. */
  shell?: boolean;
  shellProps?: Omit<AppShellInsetProps, 'children' | 'workspace' | 'user' | 'onNavigate'>;
  /** The host may own the only vertical scroll instead of this component. */
  scrollOwner?: 'component' | 'host';
  taskHeader?: ReactNode;
  rounds?: ReactNode;
  /** Replaces the built-in plan and activity; data and selection stay caller-owned. */
  process?: ReactNode;
  filePreview?: ReactNode;
  panelDetails?: ReactNode;
  panelTitle?: ReactNode;
  agent?: string;
  user?: RunUser;
  workspace?: string;
  startedAt?: string;
  cost?: string;
  toolCallCount?: number;
  undoDecisions?: DraftDecisions;
  onApprove?: (stepId: string) => void;
  onDeny?: (stepId: string, reason?: string) => void;
  onStop?: () => void;
  onRestart?: () => void;
  onRetry?: (stepId:string) => void;
  onStepsChange?: (steps: RunStep[]) => void;
  onDraftChange?: (decisions: DraftDecisions, resolvedText: string) => void;
  onNavigate?: (label: string) => void;
  className?: string;
}

const labels: Record<AgentRunStatus, string> = {idle:'Ready',running:'Running',waiting:'Needs input',completed:'Done',stopped:'Stopped',denied:'Stopped',error:'Failed'};
const defaultUser = {name:'Account'};
function clock(ms:number) {const s=Math.max(0,Math.floor(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function doneTime(ms:number) {const s=Math.max(0,Math.floor(ms/1000));return s<60?`${s}s`:`${Math.floor(s/60)}m ${s%60}s`;}

/** Caller-owned run data: this screen never advances tools or approves actions by itself. */
export function AgentRun({title,steps,status,elapsedMs,draft,shell=true,shellProps,scrollOwner='component',taskHeader,rounds,process,filePreview,panelDetails,panelTitle,agent,user,workspace='Workspace',startedAt,cost,toolCallCount,undoDecisions,onApprove,onDeny,onStop,onRestart,onRetry,onStepsChange,onDraftChange,onNavigate,className=''}:AgentRunProps) {
  const root=useRef<HTMLDivElement>(null);
  const options=useRef<HTMLDivElement>(null);
  const optionsButton=useRef<HTMLButtonElement>(null);
  const panelToggle=useRef<HTMLButtonElement>(null);
  const panelSlot=useRef<HTMLDivElement>(null);
  const [panelOpen,setPanelOpen]=useState(true);
  const [overlay,setOverlay]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [notice,setNotice]=useState('');
  const running=status==='running'||status==='waiting';
  const pendingApprovalIndex=steps.findIndex(s=>s.status==='waiting'&&s.approval&&(s.approval.status??'pending')==='pending');
  const approvalIndex=pendingApprovalIndex>=0?pendingApprovalIndex:steps.reduce((last,s,index)=>s.approval?.status==='approved'||s.approval?.status==='denied'?index:last,-1);
  const approval=approvalIndex<0?undefined:{...steps[approvalIndex].approval!,stepId:steps[approvalIndex].id,stepIndex:approvalIndex,tool:steps[approvalIndex].tool};
  const hasPanel = Boolean(approval || draft || filePreview != null || panelDetails != null || agent !== undefined || user !== undefined || cost !== undefined || toolCallCount !== undefined);
  const panelVisible = hasPanel && panelOpen;
  function closePanel(){setPanelOpen(false);requestAnimationFrame(()=>panelToggle.current?.focus());}
  useEffect(()=>{
    if(!overlay || !panelVisible)return;
    panelSlot.current?.querySelector<HTMLButtonElement>('.ar-panel-close')?.focus({preventScroll:true});
  },[overlay,panelVisible]);
  useEffect(()=>{
    if(!root.current)return;
    let previous:boolean|undefined;
    const observer=new ResizeObserver(([entry])=>{const narrow=entry.contentRect.width<=1000;setOverlay(narrow);if(previous!==narrow){setPanelOpen(!narrow);previous=narrow;}});
    observer.observe(root.current);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!menuOpen)return;
    options.current?.querySelector<HTMLButtonElement>('[role=menuitem]')?.focus();
    const outside=(e:PointerEvent)=>{if(!options.current?.contains(e.target as Node))setMenuOpen(false);};
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();setMenuOpen(false);optionsButton.current?.focus();}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};
  },[menuOpen]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),2000);return()=>clearTimeout(timer);},[notice]);
  async function copyRun(){
    try{await navigator.clipboard.writeText(window.location.href);setNotice('Run link copied');}catch{setNotice('Could not copy run link');}
    setMenuOpen(false);
  }
  const body = <div ref={root} className="ar-run-body" onKeyDown={event=>{if(overlay&&panelVisible&&event.key==='Escape'&&!event.defaultPrevented&&!menuOpen){event.preventDefault();closePanel();}}} data-overlay={overlay} data-panel-open={panelVisible}>
        <div className="ar-run-main" inert={overlay&&panelVisible}>
          <header className="ar-run-bar">
            {taskHeader !== undefined ? <div className="ar-run-task-header">{taskHeader}</div> : <div className="ar-run-breadcrumb"><span className="ar-run-breadcrumb-icon"><HeaderIcon name="run"/></span><button type="button" onClick={()=>onNavigate?.('Runs')}>Runs</button><span className="ar-run-slash">/</span><b title={title}>{title}</b><span className="ar-run-badge" data-state={status}><i/>{labels[status]}</span></div>}
            <div className="ar-run-bar-tools">
              <span className="ar-run-time"><HeaderIcon name="clock" size={14}/>{status==='completed'?`Done in ${doneTime(elapsedMs)}`:status==='idle'?'Ready':`${startedAt?`Started ${startedAt} · `:''}${clock(elapsedMs)}`}</span>
              {running?<button type="button" className="ar-run-action" onClick={onStop} disabled={!onStop}><HeaderIcon name="stop" size={16}/>Stop run</button>:<button type="button" className="ar-run-action" onClick={onRestart} disabled={!onRestart}><HeaderIcon name="run" size={16}/>{status==='idle'?'Start run':'Run again'}</button>}
              <div className="ar-run-options" ref={options}><button type="button" ref={optionsButton} className="ar-run-icon-button" aria-label="Run options" aria-expanded={menuOpen} aria-haspopup="menu" onClick={()=>setMenuOpen(v=>!v)}><HeaderIcon name="more"/></button>
                {menuOpen&&<div className="ar-run-menu" role="menu" onKeyDown={event=>{const items=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const index=items.indexOf(document.activeElement as HTMLButtonElement);let next=index;if(event.key==='ArrowDown')next=(index+1)%items.length;else if(event.key==='ArrowUp')next=(index-1+items.length)%items.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=items.length-1;else return;event.preventDefault();items[next]?.focus();}}><button role="menuitem" onClick={()=>void copyRun()}><HeaderIcon name="copy"/>Copy run link</button><button role="menuitem" disabled={!onNavigate} onClick={()=>{setMenuOpen(false);onNavigate?.('Share');}}><HeaderIcon name="share"/>Share</button><button role="menuitem" disabled={!onNavigate} onClick={()=>{setMenuOpen(false);onNavigate?.('Chat');}}><HeaderIcon name="chat"/>View in Chat</button></div>}
              </div>
              {hasPanel && <button ref={panelToggle} type="button" className="ar-run-icon-button ar-run-panel-toggle" aria-label={panelOpen?'Hide side panel':'Show side panel'} aria-pressed={panelOpen} onClick={()=>setPanelOpen(v=>!v)}><HeaderIcon name="panel"/></button>}
            </div>
          </header>
          <div className="ar-run-scroll"><div className="ar-run-column">
            {rounds}
            {process !== undefined ? process : <><AgentRunPlan title={title} steps={steps} status={status} elapsedMs={elapsedMs} onStepsChange={onStepsChange} onRetry={onRetry}/>
            <AgentRunActivity steps={steps} status={status} elapsedMs={elapsedMs}/></>}
          </div></div>
        </div>
        {overlay&&panelVisible&&<button type="button" className="ar-run-panel-scrim" aria-label="Close run details backdrop" tabIndex={-1} onClick={closePanel}/>}
        {panelVisible&&<div ref={panelSlot} className="ar-run-panel-slot" role={overlay?'dialog':undefined} aria-modal={overlay||undefined} aria-label={overlay?'Run details':undefined} onKeyDown={event=>{
          if(!overlay || event.key!=='Tab')return;
          const items=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter(node=>!node.closest('[inert]') && node.getClientRects().length>0);
          const first=items[0],last=items.at(-1);
          if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
          else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
        }}>
          <AgentRunPanel approval={approval} draft={draft ? <AgentRunDiff draft={draft} onChange={onDraftChange} undoDecisions={undoDecisions}/> : undefined} showApprovalPlaceholder={draft !== undefined} filePreview={filePreview} details={panelDetails} heading={panelTitle} agent={agent} user={user} cost={cost} toolCallCount={toolCallCount??steps.reduce((n,s)=>n+s.calls.length,0)} onApprove={onApprove} onDeny={onDeny} onClose={overlay?closePanel:undefined}/>
        </div>}
        <span className="ar-run-notice" role="status">{notice}</span>
      </div>;
  return <div className={`agent-run ${className}`} data-run-status={status} data-shell={shell} data-scroll-owner={scrollOwner}>
    {shell ? <AppShellInset {...shellProps} workspace={workspace} user={user??defaultUser} onNavigate={onNavigate}>{body}</AppShellInset> : body}
  </div>;
}
