'use client';

import {useCallback, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type ReactNode} from 'react';
import {AnimatePresence, motion, useIsPresent, type HTMLMotionProps} from 'motion/react';
import './agent-tree.css';

export type AgentTreeStatus = 'unknown' | 'queued' | 'running' | 'waiting' | 'done' | 'failed' | 'stopped';
/** Amounts are supplied by the caller. The component never sums branches. */
export interface AgentTreeCost {
  amount: number;
  currency?: string;
  completeness: 'complete' | 'partial';
  scope?: 'self' | 'branch';
  /** Caller confirms that this amount is currently changing. */
  live?: boolean;
}
export interface AgentTreeNode {
  id: string;
  name: string;
  /** Use parentId for flat data, or children for nested data. IDs must be unique and acyclic. */
  parentId?: string | null;
  children?: readonly AgentTreeNode[];
  status?: AgentTreeStatus | null;
  task?: string;
  model?: string;
  avatar?: ReactNode;
  tools?: readonly {id: string; label: string; icon: ReactNode}[];
  cost?: AgentTreeCost | null;
  /** Already formatted by the caller; no implicit elapsed-time clock. */
  durationLabel?: string | null;
}
export interface AgentTreeProps {
  nodes: readonly AgentTreeNode[];
  selectedId?: string | null;
  onSelect?: (node: AgentTreeNode) => void;
  collapsed?: readonly string[];
  defaultCollapsed?: readonly string[];
  onCollapsedChange?: (ids: string[]) => void;
  /** Optional authoritative total. Omit when unavailable; partial totals stay labelled. */
  totalCost?: AgentTreeCost | null;
  formatCost?: (cost: AgentTreeCost) => string;
  title?: string;
  emptyMessage?: ReactNode;
  className?: string;
  reducedMotion?: boolean;
}

const labels: Record<AgentTreeStatus, string> = {unknown:'Unknown', queued:'Queued', running:'Running', waiting:'Needs you', done:'Done', failed:'Failed', stopped:'Stopped'};
const ease = [.32, .72, .24, 1] as const;
const motionQuery='(prefers-reduced-motion: reduce)';
const reducedSnapshot=()=>typeof window!=='undefined'&&window.matchMedia(motionQuery).matches;
function subscribeMotion(callback:()=>void){const media=window.matchMedia(motionQuery);media.addEventListener('change',callback);return()=>media.removeEventListener('change',callback);}
type Entry = {node: AgentTreeNode; parentId: string | null; children: Entry[]; depth: number};
type Link = {id: string; d: string; x: number; y: number; muted: boolean};

function modelOf(nodes: readonly AgentTreeNode[]) {
  const byId = new Map<string, Entry>();
  function add(items: readonly AgentTreeNode[], parent?: string) {
    items.forEach(node => {
      byId.set(node.id, {node, parentId: parent ?? node.parentId ?? null, children: [], depth: 0});
      if(node.children) add(node.children, node.id);
    });
  }
  add(nodes);
  const roots: Entry[] = [];
  byId.forEach(entry => {
    const parent = entry.parentId ? byId.get(entry.parentId) : undefined;
    if(parent) parent.children.push(entry); else roots.push(entry);
  });
  const all: Entry[] = [];
  function visit(entry: Entry, depth: number) {entry.depth=depth; all.push(entry); entry.children.forEach(child=>visit(child, depth+1));}
  roots.forEach(root=>visit(root,0));
  return {roots, all, byId};
}

function Glyph({status}: {status: AgentTreeStatus}) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={status==='running'?'agent-tree__spin':undefined}>
    {status==='running'?<><circle cx="12" cy="12" r="8.5" opacity=".25" strokeWidth="2.5"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" strokeWidth="2.5"/></>:status==='done'?<path d="m5 14 3.5 3.5L19 6.5" strokeWidth="2.4"/>:status==='failed'?<><path d="M13.9248 21H10.0752C5.44476 21 3.12955 21 2.27636 19.4939C1.42317 17.9879 2.60736 15.9914 4.97574 11.9985L6.90057 8.75333C9.17559 4.91778 10.3131 3 12 3C13.6869 3 14.8244 4.91777 17.0994 8.75332L19.0243 11.9985C21.3926 15.9914 22.5768 17.9879 21.7236 19.4939C20.8704 21 18.5552 21 13.9248 21Z"/><path d="M12 9V13" strokeWidth="2.2"/><path d="M12 16.8V17" strokeWidth="2.6"/></>:status==='waiting'?<><circle cx="12" cy="12" r="10"/><path d="M12 7.5V12l2.5 2.5"/></>:status==='stopped'?<rect x="6" y="6" width="12" height="12" rx="2"/>:status==='queued'?<><circle cx="12" cy="12" r="8.5" strokeDasharray="2 3"/><path d="M9 12h6"/></>:<><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.1.7-1.5 1.1-1.5 2m0 3v.1"/></>}
  </svg>;
}

function defaultFormatCost(cost: AgentTreeCost) {
  if((cost.currency??'USD')==='USD' && cost.amount>0 && cost.amount<.01) return '<$0.01';
  return new Intl.NumberFormat('en-US',{style:'currency',currency:cost.currency??'USD'}).format(cost.amount);
}
function Amount({cost,format}: {cost: AgentTreeCost; format: (cost: AgentTreeCost)=>string}) {
  return <span className="agent-tree__amount" data-live={cost.live||undefined} title={cost.scope==='branch'?'Caller-provided branch cost':'Caller-provided cost'}>{format(cost)}{cost.completeness==='partial'&&<span className="agent-tree__partial"> · partial</span>}</span>;
}

/** An exiting group is immediately absent from keyboard and accessibility navigation. */
function ChildGroup({children, first, reduced}: {children: ReactNode; first: boolean; reduced: boolean}) {
  const present=useIsPresent();
  return <motion.div className={`agent-tree__group ${first?'agent-tree__level':'agent-tree__below'}`} role="group" inert={!present} aria-hidden={!present||undefined}
    initial={reduced?false:{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
    transition={{duration:reduced?0:.28,ease}}>{children}</motion.div>;
}

function TreeBranch({children,...props}:HTMLMotionProps<'div'>) {
  const present=useIsPresent();
  return <motion.div {...props} inert={!present} aria-hidden={!present||undefined}>{children}</motion.div>;
}

export function AgentTree({nodes, selectedId, onSelect, collapsed: controlledCollapsed, defaultCollapsed=[], onCollapsedChange, totalCost, formatCost=defaultFormatCost, title='Agents', emptyMessage='No agents', className='', reducedMotion}: AgentTreeProps) {
  const preference=useSyncExternalStore(subscribeMotion,reducedSnapshot,()=>false), reduced=!!reducedMotion||preference;
  const uid=useId(), tree=useRef<HTMLDivElement>(null), focusRefs=useRef(new Map<string,HTMLDivElement>()), cardRefs=useRef(new Map<string,HTMLDivElement>());
  const [localCollapsed,setLocalCollapsed]=useState<readonly string[]>(defaultCollapsed), [focusId,setFocusId]=useState<string|null>(null), [width,setWidth]=useState(760), [links,setLinks]=useState<Link[]>([]);
  const folded=controlledCollapsed??localCollapsed;
  const model=useMemo(()=>modelOf(nodes),[nodes]);
  const hidden=useMemo(()=>new Set(folded),[folded]);
  const visible: Entry[]=[];
  function walk(entry:Entry) {visible.push(entry); if(!hidden.has(entry.node.id))entry.children.forEach(walk);}
  model.roots.forEach(walk);
  const visibleIds=visible.map(e=>e.node.id), visibleKey=JSON.stringify(visibleIds);
  const activeId=focusId&&visibleIds.includes(focusId)?focusId:visibleIds[0];
  const maxDepth=Math.max(0,...model.all.map(e=>e.depth));
  const columns=Math.max(1,...model.roots.map(e=>e.children.length));
  const narrow=width<560, reserve=Math.max(0,maxDepth-1)*32;
  const cardWidth=narrow?Math.max(0,width-maxDepth*28):Math.max(100,Math.min(220,(width-(columns-1)*8)/columns-reserve));
  const focus=(id: string) => {setFocusId(id);focusRefs.current.get(id)?.focus({preventScroll:true});};
  const previousVisible=useRef(visibleIds), previousParents=useRef(model.byId);

  useLayoutEffect(()=>{
    const element=tree.current;if(!element)return;
    const observer=new ResizeObserver(()=>setWidth(element.clientWidth));
    setWidth(element.clientWidth);observer.observe(element);return()=>observer.disconnect();
  },[]);

  useLayoutEffect(()=>{
    // A caller may fold/remove the focused branch. Keep the next keyboard stop in the tree.
    if(focusId&&!visibleIds.includes(focusId)) {
      let ancestor=previousParents.current.get(focusId)?.parentId;
      while(ancestor&&!visibleIds.includes(ancestor))ancestor=previousParents.current.get(ancestor)?.parentId;
      const next=ancestor??visibleIds[Math.min(previousVisible.current.indexOf(focusId),visibleIds.length-1)];
      if(next) {
        setFocusId(next);
        if(document.activeElement===document.body || tree.current?.contains(document.activeElement))focusRefs.current.get(next)?.focus({preventScroll:true});
      } else setFocusId(null);
    }
    previousVisible.current=visibleIds;previousParents.current=model.byId;
  },[visibleKey,focusId,model]); // Derived traversal intentionally follows authoritative inputs.

  const frame=useRef(0);
  const measure=useCallback(()=>{
    const element=tree.current;if(!element)return;
    const rect=element.getBoundingClientRect();
    const next:Link[]=[];
    visible.forEach(entry=>{
      if(!entry.parentId)return;
      const parent=model.byId.get(entry.parentId), from=cardRefs.current.get(entry.parentId)?.getBoundingClientRect(), to=cardRefs.current.get(entry.node.id)?.getBoundingClientRect();
      if(!parent||!from||!to||!visibleIds.includes(parent.node.id))return;
      const topLevel=entry.depth===1&&!narrow;
      const x=from.left-rect.left+(topLevel?from.width/2:21),y=from.bottom-rect.top;
      const tx=to.left-rect.left+(topLevel?to.width/2:0),ty=to.top-rect.top+(topLevel?0:21);
      let d:string;
      if(topLevel){const middle=y+20,dir=tx>x?1:-1,r=Math.min(8,Math.abs(tx-x));d=Math.abs(tx-x)<1?`M${x} ${y}V${ty}`:`M${x} ${y}V${middle}H${tx-dir*r}Q${tx} ${middle} ${tx} ${middle+r}V${ty}`;}
      else d=`M${x} ${y}V${ty-6}Q${x} ${ty} ${x+6} ${ty}H${tx}`;
      next.push({id:entry.node.id,d,x,y,muted:['unknown','queued','stopped'].includes(entry.node.status??'unknown')});
    });
    setLinks(previous=>JSON.stringify(previous)===JSON.stringify(next)?previous:next);
  },[visibleKey,model,narrow]);
  const track=useCallback(()=>{
    cancelAnimationFrame(frame.current);const start=performance.now();
    const tick=()=>{measure();if(!reduced&&performance.now()-start<720)frame.current=requestAnimationFrame(tick);};
    frame.current=requestAnimationFrame(tick);
  },[measure,reduced]);
  useLayoutEffect(()=>{track();return()=>cancelAnimationFrame(frame.current);},[track,width]);

  function toggle(entry:Entry) {
    const next=hidden.has(entry.node.id)?folded.filter(id=>id!==entry.node.id):[...folded,entry.node.id];
    if(controlledCollapsed===undefined)setLocalCollapsed(next);
    onCollapsedChange?.([...next]);
  }
  function key(event:KeyboardEvent<HTMLDivElement>, entry:Entry) {
    if(event.target!==event.currentTarget)return;
    const i=visibleIds.indexOf(entry.node.id), parent=entry.parentId;
    switch(event.key) {
      case 'ArrowDown': event.preventDefault(); if(visibleIds[i+1])focus(visibleIds[i+1]);break;
      case 'ArrowUp': event.preventDefault(); if(visibleIds[i-1])focus(visibleIds[i-1]);break;
      case 'Home': event.preventDefault(); if(visibleIds[0])focus(visibleIds[0]);break;
      case 'End': event.preventDefault(); if(visibleIds.length)focus(visibleIds[visibleIds.length-1]);break;
      case 'ArrowRight': event.preventDefault();if(entry.children.length){if(hidden.has(entry.node.id))toggle(entry);else focus(entry.children[0].node.id);}break;
      case 'ArrowLeft': event.preventDefault();if(entry.children.length&&!hidden.has(entry.node.id))toggle(entry);else if(parent&&visibleIds.includes(parent))focus(parent);break;
      case 'Enter': case ' ': event.preventDefault();onSelect?.(entry.node);break;
    }
  }
  function render(entry:Entry,index:number) {
    const {node,children,depth}=entry, status=node.status??'unknown', closed=hidden.has(node.id), groupId=`${uid}-group-${node.id}`;
    return <TreeBranch key={node.id} initial={false} animate={{opacity:1}} exit={{opacity:0,transition:{duration:reduced?0:.18,delay:reduced?0:Math.max(0,maxDepth-depth)*.035}}} className={`agent-tree__branch${depth===0?' agent-tree__root':''}`} role="treeitem"
      aria-label={`${node.name}: ${labels[status]}`} aria-level={depth+1} aria-expanded={children.length?!closed:undefined}
      aria-selected={onSelect||selectedId!==undefined?selectedId===node.id:undefined} tabIndex={activeId===node.id?0:-1}
      ref={el=>{if(el)focusRefs.current.set(node.id,el);else focusRefs.current.delete(node.id);}} data-node-id={node.id}
      onFocus={e=>{if(e.target===e.currentTarget)setFocusId(node.id);}} onKeyDown={e=>key(e,entry)}>
      <motion.div layout="position" className="agent-tree__card" data-status={status} data-depth={depth} data-selected={selectedId===node.id||undefined} data-selectable={!!onSelect||undefined}
        ref={el=>{if(el)cardRefs.current.set(node.id,el);else cardRefs.current.delete(node.id);}}
        initial={reduced?false:{opacity:0,y:6,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-3,transition:{duration:reduced?0:.18,delay:reduced?0:Math.max(0,maxDepth-depth)*.035}}}
        transition={{duration:reduced?0:.36,ease,delay:reduced?0:depth===0?0:.16+index*.035,layout:{duration:reduced?0:.36,ease}}}
        onLayoutAnimationStart={track} onAnimationComplete={measure}
        onClick={()=>{focus(node.id);onSelect?.(node);}}>
        <div className="agent-tree__top">
          <span className="agent-tree__avatar" aria-hidden="true">{node.avatar??node.name.slice(0,1)}</span>
          <span className="agent-tree__who"><span className="agent-tree__name" title={node.name}>{node.name}</span>{node.model&&<span className="agent-tree__model" title={node.model}>{node.model}</span>}</span>
          <span className="agent-tree__status" data-status={status}><Glyph status={status}/>{labels[status]}</span>
        </div>
        {node.task&&<p className="agent-tree__task" title={node.task}>{!!node.tools?.length&&<span className="agent-tree__tools">{node.tools.map(tool=><span className="agent-tree__tool" key={tool.id} title={tool.label} aria-label={tool.label}>{tool.icon}</span>)}</span>}{node.task}</p>}
        {(node.cost||node.durationLabel||children.length>0)&&<div className="agent-tree__meta">
          <span className="agent-tree__metadata">{node.cost&&<Amount cost={node.cost} format={formatCost}/>} {node.durationLabel&&<span className="agent-tree__time">{node.cost?'· ':''}{node.durationLabel}</span>}</span>
          {!!children.length&&<button type="button" className="agent-tree__fold" aria-expanded={!closed} aria-controls={groupId}
            aria-label={closed?`Show ${children.length} sub-agents of ${node.name}`:`Fold the sub-agents of ${node.name}`}
            onClick={e=>{e.stopPropagation();toggle(entry);}}>
            {closed?'+':''}{children.length}<motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" animate={{rotate:closed?-90:0}} transition={{duration:reduced?0:.16}}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></motion.svg>
          </button>}
        </div>}
      </motion.div>
      {!!children.length&&<div id={groupId} className="agent-tree__group-slot"><AnimatePresence initial={!reduced}>{!closed&&<ChildGroup key="children" first={depth===0&&!narrow} reduced={reduced}><AnimatePresence initial={!reduced}>{children.map(render)}</AnimatePresence></ChildGroup>}</AnimatePresence></div>}
    </TreeBranch>;
  }
  const counts=model.all.reduce((result,entry)=>{const status=entry.node.status??'unknown';result[status]=(result[status]??0)+1;return result;},{} as Partial<Record<AgentTreeStatus,number>>);
  return <div className={`agent-tree ${className}`} data-reduced-motion={reduced||undefined} data-narrow={narrow||undefined} style={{'--agt-card-width':`${cardWidth}px`,'--agt-reserve':`${reserve}px`,'--agt-indent':narrow?'28px':'32px'} as CSSProperties}>
    <div className="agent-tree__bar"><span className="agent-tree__heading"><span className="agent-tree__spark" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1.2c.4 2.9 1.9 4.4 4.8 4.8-2.9.4-4.4 1.9-4.8 4.8C6.6 7.9 5.1 6.4 2.2 6 5.1 5.6 6.6 4.1 7 1.2Z" fill="currentColor"/><circle cx="11.6" cy="11.4" r="1.1" fill="currentColor" opacity=".55"/></svg></span>{title}</span>
      <span className="agent-tree__summary" aria-live="polite" aria-atomic="true"><span>{model.all.length} {model.all.length===1?'agent':'agents'}</span>
        {(['unknown','running','waiting','failed'] as const).map(status=>counts[status]?<span key={status} data-status={status}>{counts[status]} {status==='waiting'?'needs you':status}</span>:null)}
        {totalCost&&<Amount cost={totalCost} format={formatCost}/>}</span>
    </div>
    <div className="agent-tree__tree" role="tree" aria-label={title} ref={tree}>
      <svg className="agent-tree__links" aria-hidden="true"><AnimatePresence initial={!reduced}>{links.map(link=><motion.path key={link.id} d={link.d} pathLength={1} className="agent-tree__link" data-muted={link.muted||undefined} initial={reduced?false:{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}} exit={{pathLength:0,opacity:0,transition:{duration:reduced?0:.24}}} transition={{duration:reduced?0:.42,ease}}/>)}</AnimatePresence></svg>
      <AnimatePresence initial={!reduced}>{model.roots.map(render)}</AnimatePresence>
      <svg className="agent-tree__links agent-tree__dots" aria-hidden="true">{links.filter((l,i,a)=>a.findIndex(v=>v.x===l.x&&v.y===l.y)===i).map(link=><circle key={link.id} cx={link.x} cy={link.y} r="3.25"/>)}</svg>
      {!model.all.length&&<div className="agent-tree__empty" role="status">{emptyMessage}</div>}
    </div>
  </div>;
}
