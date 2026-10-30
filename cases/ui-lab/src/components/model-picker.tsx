'use client';
import {useEffect,useLayoutEffect,useId,useRef,useState,type ReactNode,type CSSProperties,type KeyboardEvent} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import './model-picker.css';
export interface PickerModel {id:string;name:string;description?:string;icon?:ReactNode;speed?:number;quality?:number;cost?:number;latencyMs?:number;pricePerM?:number;metricsLabel?:string;disabled?:boolean}
export interface ModelPickerProps {
 models:PickerModel[];value?:string;defaultValue?:string;onChange?:(id:string)=>void;
 open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void;
 align?:'start'|'end';side?:'bottom'|'top';disabled?:boolean;className?:string;
 placeholder?:string;emptyText?:string;metricLabels?:[string,string,string];
 /** Optional application-owned menu content. This picker does not implement model capabilities. */
 children?:ReactNode;indicator?:ReactNode;summary?:ReactNode;onActiveChange?:(model:PickerModel|undefined)=>void;
}
function useTween(value:number|undefined){const reduced=useReducedMotion(),[shown,setShown]=useState(value),current=useRef(value);useEffect(()=>{if(value===undefined||current.current===undefined||reduced){current.current=value;setShown(value);return;}const from=current.current,start=performance.now();let frame=0;function tick(now:number){const progress=Math.min((now-start)/420,1),v=from!+(value!-from!)*(1-Math.pow(1-progress,3));current.current=v;setShown(v);if(progress<1)frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[value,reduced]);return shown;}
function Summary({model}:{model?:PickerModel}){const latency=useTween(model?.latencyMs),price=useTween(model?.pricePerM);if(latency===undefined&&price===undefined)return <span>{model?.description??model?.metricsLabel??''}</span>;return <>{latency!==undefined&&<span>~<b>{(latency/1000).toFixed(1)}s</b> first token</span>}{latency!==undefined&&price!==undefined&&<span className="re-mdp__dot"> · </span>}{price!==undefined&&<span><b>${Math.round(price)}</b> / M tokens</span>}</>;}
function Check(){return <svg className="re-mdp__check" viewBox="0 0 14 14" width="16" height="16" fill="none" aria-hidden="true"><path d="m3.4 7.3 2.4 2.4 4.8-5.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
export function ModelPicker({models,value,defaultValue,onChange,open:controlledOpen,defaultOpen=false,onOpenChange,align='start',side='bottom',disabled=false,className='',placeholder='Choose model',emptyText='No models',metricLabels=['Speed','Quality','Cost'],children,indicator,summary,onActiveChange}:ModelPickerProps){
 const id=useId(),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),list=useRef<HTMLDivElement>(null);const reduced=useReducedMotion();
 const [selected,setSelected]=useState(defaultValue??models[0]?.id),[isOpen,setIsOpen]=useState(defaultOpen),[active,setActive]=useState(-1),[pointing,setPointing]=useState(false),[keyboard,setKeyboard]=useState(false),[menuOffset,setMenuOffset]=useState(0);
 const current=value??selected,chosen=models.find(m=>m.id===current),open=controlledOpen??isOpen,lit=active>=0?active:models.findIndex(m=>m.id===current),activeModel=models[lit]??chosen;
 useLayoutEffect(()=>{function place(){if(!root.current)return;const rect=root.current.getBoundingClientRect(),width=Math.min(320,window.innerWidth-32),left=align==='start'?rect.left:rect.right-width;setMenuOffset(Math.max(16-left,Math.min(0,window.innerWidth-16-left-width)));}place();window.addEventListener('resize',place);return()=>window.removeEventListener('resize',place);},[open,align]);
 function setOpen(next:boolean){if(disabled&&next)return;setIsOpen(next);onOpenChange?.(next);if(next){setActive(models.findIndex(m=>m.id===current));setPointing(false);} }
 function close(returnFocus=false){setOpen(false);if(returnFocus)trigger.current?.focus();}
 function choose(m:PickerModel){if(m.disabled)return;setSelected(m.id);onChange?.(m.id);close(true);}
 useEffect(()=>{if(open){list.current?.focus({preventScroll:true});} },[open]);
 useEffect(()=>{onActiveChange?.(activeModel);},[activeModel,onActiveChange]);
 useEffect(()=>{function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node)){setIsOpen(false);onOpenChange?.(false);}}document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[onOpenChange]);
 useEffect(()=>{if(disabled&&open){setIsOpen(false);onOpenChange?.(false);}},[disabled,open,onOpenChange]);
 function key(e:KeyboardEvent<HTMLDivElement>){const keys=['ArrowDown','ArrowUp','Home','End'];if(keys.includes(e.key)){e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?models.length-1:(lit+(e.key==='ArrowDown'?1:-1)+models.length)%models.length;for(let i=0;i<models.length&&models[n]?.disabled;i++)n=(n+(e.key==='ArrowUp'?-1:1)+models.length)%models.length;setActive(n);setPointing(false);setKeyboard(true);document.getElementById(`${id}-option-${n}`)?.scrollIntoView({block:'nearest'});}else if((e.key==='Enter'||e.key===' ')&&activeModel){e.preventDefault();choose(activeModel);}}
 return <div ref={root} className={`re-mdp ${className}`} data-align={align} data-side={side} data-open={open&&!disabled} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))close();}}>
  <button ref={trigger} type="button" className="re-mdp__trigger" disabled={disabled} aria-haspopup="dialog" aria-expanded={open&&!disabled} aria-controls={`${id}-menu`} aria-label={`Model: ${chosen?.name??placeholder}`} onClick={()=>{setKeyboard(false);setOpen(!open);}} onKeyDown={e=>{if(['ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();setKeyboard(true);setOpen(true);}}}>
   {chosen?.icon&&<span className="re-mdp__glyph" aria-hidden="true">{chosen.icon}</span>}
   <span className="re-mdp__name"><AnimatePresence mode="popLayout" initial={false}><motion.span key={chosen?.id??'empty'} initial={{opacity:0,filter:'blur(2px)'}} animate={{opacity:1,filter:'blur(0px)'}} exit={{opacity:0,filter:'blur(2px)'}} transition={{duration:reduced?0:.32}}>{chosen?.name??placeholder}</motion.span></AnimatePresence></span>
   <span className="re-mdp__indicator" data-visible={!!indicator}><span>{indicator}</span></span>
   <svg className="re-mdp__chevron" width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
  <div id={`${id}-menu`} className="re-mdp__pop" style={align==='start'?{left:menuOffset}:{right:-menuOffset}} role="dialog" aria-label="Model settings" inert={!open||disabled}>
   <div className="re-mdp__card"><div className="re-mdp__head" aria-hidden="true"><span>Model</span><span className="re-mdp__columns">{metricLabels.map(l=><span key={l}>{l}</span>)}</span></div>
    <div ref={list} className="re-mdp__list" role="listbox" aria-label="Model" tabIndex={0} aria-activedescendant={models[lit]?`${id}-option-${lit}`:undefined} onKeyDown={key} data-pointing={pointing||undefined} data-keyboard={keyboard||undefined} onMouseLeave={()=>{setPointing(false);setActive(models.findIndex(m=>m.id===current));}}>
     {models.map((m,i)=><div key={m.id} id={`${id}-option-${i}`} className="re-mdp__option" role="option" aria-selected={m.id===current} aria-disabled={m.disabled||undefined} aria-label={`${m.name}${m.description?', '+m.description:''}${[m.speed,m.quality,m.cost].some(n=>n!==undefined)?'. '+[m.speed,m.quality,m.cost].map((n,j)=>n===undefined?'':`${metricLabels[j]} ${n} of 5`).filter(Boolean).join(', '):''}`} data-active={i===lit||undefined} onMouseMove={()=>{setActive(i);setPointing(true);setKeyboard(false);}} onClick={()=>choose(m)}>
      {m.icon&&<span className="re-mdp__glyph" aria-hidden="true">{m.icon}</span>}
      <span className="re-mdp__text"><span className="re-mdp__title"><span title={m.name}>{m.name}</span>{m.id===current&&<Check/>}</span>{m.description&&<span className="re-mdp__description" title={m.description}>{m.description}</span>}</span>
      {[m.speed,m.quality,m.cost].some(n=>n!==undefined)?<span className="re-mdp__bars" aria-hidden="true">{[m.speed,m.quality,m.cost].map((n,c)=><span className="re-mdp__meter" key={c}>{n===undefined?<span className="re-mdp__missing">—</span>:Array.from({length:5},(_,s)=><span key={s} className="re-mdp__segment" data-on={n!==undefined&&s<n||undefined} style={{'--delay':`${s*45+c*70}ms`} as CSSProperties}/>)}</span>)}</span>:<span className="re-mdp__varies">{m.metricsLabel??''}</span>}
     </div>)}
     {!models.length&&<div className="re-mdp__empty">{emptyText}</div>}
    </div>
    {children&&<div className="re-mdp__extra">{children}</div>}
   </div>
   <div className="re-mdp__foot"><span className="re-mdp__caption" aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><motion.span key={summary?'custom':activeModel?.latencyMs===undefined&&activeModel?.pricePerM===undefined?'description':'metrics'} initial={{opacity:0,filter:'blur(2px)'}} animate={{opacity:1,filter:'blur(0px)'}} exit={{opacity:0,filter:'blur(2px)'}} transition={{duration:reduced?0:.32}}>{summary??<Summary model={activeModel}/>}</motion.span></AnimatePresence></span><span className="re-mdp__keys" aria-hidden="true"><kbd>↑↓</kbd><kbd>↵</kbd></span></div>
   <span className="re-mdp__sr" aria-live="polite">{open&&activeModel?`${activeModel.name}${activeModel.latencyMs!==undefined?`, ${(activeModel.latencyMs/1000).toFixed(1)}s first token`:''}${activeModel.pricePerM!==undefined?`, $${activeModel.pricePerM} per million tokens`:''}`:''}</span>
  </div>
 </div>;
}
export default ModelPicker;
