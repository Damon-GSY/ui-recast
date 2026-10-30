'use client';
import {type ReactNode} from 'react';
import './block-timeline1.css';
export interface ProcessTimelineStep {id:string;title:string;description:ReactNode;icon:ReactNode;href?:string;actionLabel?:string}
export interface BlockTimeline1Props {steps:ProcessTimelineStep[];label?:string;onStepSelect?:(id:string)=>void;className?:string}
/** Icons traced from the public rendered SVG assets, not the Pro component source. */
export function TimelineProcessIcon({kind}:{kind:'files'|'layout'|'growth'}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='files'?<><path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/><path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z"/><path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1"/></>:kind==='layout'?<><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></>:<><path d="M22 12A10 10 0 1 1 12 2M22 2 12 12M16 2h6v6"/></>}</svg>}
export function BlockTimeline1({steps,label='Process',onStepSelect,className=''}:BlockTimeline1Props){return <section className={`block-timeline1 ${className}`} aria-label={label} data-capture-root><ol>{steps.map((step,index)=><li key={step.id} data-step-id={step.id}><div className="tl1-step"><span className="tl1-icon">{step.icon}</span><h2>{step.title}</h2><p>{step.description}</p>{step.href?<a href={step.href}>{step.actionLabel||'Learn more'}</a>:onStepSelect&&<button onClick={()=>onStepSelect(step.id)}>{step.actionLabel||'View step'}</button>}</div>{index<steps.length-1&&<span className="tl1-connector" aria-hidden="true"/>}</li>)}</ol></section>}
export default BlockTimeline1;
