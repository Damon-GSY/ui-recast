'use client';
import {useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type KeyboardEvent} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import './combobox.css';

export interface ComboboxOption { value: string; label: string; hint?: string; group?: string; avatar?: string | boolean; icon?: ReactNode; color?: string; keywords?: string[]; disabled?: boolean }
export interface ComboboxProps {
  options: ComboboxOption[]; value?: string[]; defaultValue?: string[];
  onChange?: (values: string[], options: ComboboxOption[]) => void;
  multiple?: boolean; label?: string; placeholder?: string; emptyText?: string;
  defaultOpen?: boolean; disabled?: boolean; maxVisibleTags?: number;
  /** Caller-owned option loading and failure. Existing selection remains visible. */
  pending?: boolean; pendingText?: string; error?: string;
  creatable?: boolean; onCreate?: (text: string) => ComboboxOption | void;
  createLabel?: (text: string) => string; className?: string;
}
const ease = [.22, 1, .36, 1] as const;
function Glyph({kind, className = ''}: {kind: 'check'|'close'|'arrow'|'plus'; className?: string}) {
  return <svg className={`re-cbx__glyph ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={kind==='check'?'M5.5 12.5l4 4L18.5 8':kind==='close'?'M7 7l10 10M17 7 7 17':kind==='plus'?'M12 6v12M6 12h12':'M8 10l4 4 4-4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Avatar({option}: {option: ComboboxOption}) {
  if(option.icon) return <span className="re-cbx__icon" aria-hidden="true">{option.icon}</span>;
  if(option.avatar) return typeof option.avatar==='string'?<img className="re-cbx__avatar" src={option.avatar} alt=""/>:<span className="re-cbx__avatar" aria-hidden="true">{option.label.split(/\s+/).slice(0,2).map(s=>s[0]).join('')}</span>;
  return option.color?<span className="re-cbx__dot" style={{background:option.color}}/>:null;
}
function Match({text,query}: {text:string;query:string}) {
  const at=text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  return query&&at>=0?<>{text.slice(0,at)}<mark>{text.slice(at,at+query.length)}</mark>{text.slice(at+query.length)}</>:<>{text}</>;
}
export function Combobox({options,value,defaultValue=[],onChange,multiple=false,label,placeholder='Search…',emptyText='No results',defaultOpen=false,disabled=false,pending=false,pendingText='Loading options…',error,maxVisibleTags=Infinity,creatable=false,onCreate,createLabel=t=>`Create “${t}”`,className=''}:ComboboxProps) {
  const id=useId();const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),list=useRef<HTMLDivElement>(null),inner=useRef<HTMLDivElement>(null),measure=useRef<HTMLDivElement>(null),hoverOrigin=useRef(false);
  const reduced=useReducedMotion();const [internal,setInternal]=useState(defaultValue),[created,setCreated]=useState<ComboboxOption[]>([]),[open,setOpen]=useState(defaultOpen),[query,setQuery]=useState(''),[active,setActive]=useState(0),[pointing,setPointing]=useState(true),[armed,setArmed]=useState<string>(),[limit,setLimit]=useState(99),[height,setHeight]=useState(300),[pill,setPill]=useState({top:28,height:32}),[announcement,setAnnouncement]=useState('');
  const locked=disabled||pending||!!error||(value!==undefined&&!onChange);
  const all=useMemo(()=>[...options,...created],[options,created]);const selection=value??internal;const picked=selection.map(v=>all.find(o=>o.value===v)).filter((o):o is ComboboxOption=>!!o);
  const filtered=(error?[]:all).filter(o=>[o.label,o.hint,...o.keywords??[]].some(s=>s?.toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  const groups=[...new Set(filtered.map(o=>o.group??''))];const ordered=groups.flatMap(g=>filtered.filter(o=>(o.group??'')===g));
  const canCreate=!error&&!locked&&creatable&&!!query.trim()&&!all.some(o=>o.label.toLocaleLowerCase()===query.trim().toLocaleLowerCase());const count=ordered.length+(canCreate?1:0);
  const available=Array.from({length:count},(_,i)=>i).filter(i=>!ordered[i]?.disabled);
  const activeIndex=available.includes(active)?active:available[0]??-1;
  const visible=picked.slice(0,Math.min(limit,maxVisibleTags));
  function change(next:string[], option?:ComboboxOption){if(locked)return;if(value===undefined)setInternal(next);onChange?.(next,next.map(v=>all.find(o=>o.value===v)??(option?.value===v?option:undefined)).filter((o):o is ComboboxOption=>!!o));setArmed(undefined);setAnnouncement(`${next.length} selected`);}
  function pick(option:ComboboxOption){if(locked||option.disabled)return;change(multiple?(selection.includes(option.value)?selection.filter(v=>v!==option.value):[...selection,option.value]):[option.value],option);setQuery('');if(!multiple)setOpen(false);input.current?.focus();}
  function choose(index:number){if(index===ordered.length&&canCreate){const text=query.trim();const option=onCreate?onCreate(text):{value:text,label:text};if(!option)return;setCreated(c=>[...c,option]);pick(option);}else if(ordered[index])pick(ordered[index]);}
  function openList(){if(!locked){setOpen(true);setPointing(true);}}
  useEffect(()=>{function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false);}document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[]);
  useEffect(()=>{if(locked)setOpen(false);},[locked]);
  useLayoutEffect(()=>{if(!open||!inner.current)return;const resize=new ResizeObserver(()=>setHeight(Math.min(inner.current!.offsetHeight+8,300)));resize.observe(inner.current);return()=>resize.disconnect();},[open]);
  useLayoutEffect(()=>{if(!open)return;const row=document.getElementById(`${id}-option-${activeIndex}`);if(row&&list.current){setPill({top:row.offsetTop+(inner.current?.offsetTop??0),height:row.offsetHeight});if(row.offsetTop<list.current.scrollTop)list.current.scrollTop=row.offsetTop;if(row.offsetTop+row.offsetHeight>list.current.scrollTop+list.current.clientHeight)list.current.scrollTop=row.offsetTop+row.offsetHeight-list.current.clientHeight;}},[activeIndex,open,query,id,options,error]);
  useLayoutEffect(()=>{if(!measure.current||!root.current)return;function size(){const widths=Array.from(measure.current!.children).map(e=>e.getBoundingClientRect().width+4);const available=root.current!.clientWidth-36-80;let used=0,n=0;for(const w of widths){if(used+w+(n<widths.length-1?36:0)>available)break;used+=w;n++;}setLimit(n);}size();const ro=new ResizeObserver(size);ro.observe(root.current);return()=>ro.disconnect();},[picked.map(o=>o.value).join('\0')]);
  function key(e:KeyboardEvent<HTMLInputElement>){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const direction=e.key==='ArrowDown'?1:-1;if(!open){setActive(direction===1?available[0]??-1:available.at(-1)??-1);openList();return;}if(available.length)setActive(available[(available.indexOf(activeIndex)+direction+available.length)%available.length]);setPointing(true);hoverOrigin.current=false;}
    else if((e.key==='Home'||e.key==='End')&&open){e.preventDefault();setActive(e.key==='Home'?available[0]??-1:available.at(-1)??-1);}
    else if(e.key==='Enter'&&open){e.preventDefault();choose(activeIndex);}
    else if(e.key==='Escape'){e.preventDefault();if(open)setOpen(false);else setQuery('');setArmed(undefined);}
    else if(e.key==='Tab')setOpen(false);
    else if(e.key==='Backspace'&&!query&&picked.length){const last=picked[picked.length-1].value;if(armed===last)change(selection.filter(v=>v!==last));else setArmed(last);}
    else setArmed(undefined);
  }
  const chip=(o:ComboboxOption,measuring=false)=><motion.span initial={measuring||reduced?false:{opacity:0,scale:.6}} animate={{opacity:1,scale:measuring||reduced?1:[.6,1.05,1]}} exit={{opacity:0,scale:.8}} transition={{duration:reduced?0:.34,ease,times:[0,.6,1]}} className="re-cbx__chip-body" data-armed={armed===o.value||undefined}><Avatar option={o}/><span className="re-cbx__chip-label">{o.label}</span><button type="button" tabIndex={measuring?-1:0} disabled={locked} aria-label={`Remove ${o.label}`} onMouseDown={e=>e.preventDefault()} onClick={()=>{change(selection.filter(v=>v!==o.value));input.current?.focus();}}><Glyph kind="close"/></button></motion.span>;
  return <div ref={root} className={`re-cbx ${className}`} data-open={open} data-disabled={locked||undefined} aria-busy={pending} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
    {label&&<label className="re-cbx__label" id={`${id}-label`} htmlFor={`${id}-input`}>{label}</label>}
    <div className="re-cbx__field" onClick={()=>input.current?.focus()}>
      <div className="re-cbx__field-inner">
        <div ref={measure} className="re-cbx__measure" aria-hidden="true" inert>{picked.map(o=><span key={o.value}>{chip(o,true)}</span>)}</div>
        <AnimatePresence initial={false}>{visible.map(o=><motion.span key={o.value} className="re-cbx__chip" initial={{width:0,marginRight:0}} animate={{width:'auto',marginRight:4}} exit={{width:0,marginRight:0,opacity:0,transition:{width:{duration:reduced?0:.26,delay:reduced?0:.16,ease},marginRight:{duration:reduced?0:.26,delay:reduced?0:.16,ease},opacity:{duration:reduced?0:.2,delay:reduced?0:.14}}}} transition={{duration:reduced?0:.26,ease}}>{chip(o)}</motion.span>)}</AnimatePresence>
        {picked.length>visible.length&&<span className="re-cbx__more">+<span key={picked.length-visible.length} className="re-cbx__roll">{picked.length-visible.length}</span></span>}
        <input ref={input} id={`${id}-input`} className="re-cbx__input" autoComplete="off" spellCheck={false} disabled={locked} role="combobox" aria-label={label??placeholder} aria-expanded={open&&!locked} aria-invalid={!!error} aria-describedby={pending||error?`${id}-feedback`:undefined} aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={open&&!locked&&activeIndex>=0?`${id}-option-${activeIndex}`:undefined} placeholder={picked.length?'':placeholder} value={query} onChange={e=>{setQuery(e.target.value);hoverOrigin.current=false;setActive(0);setPointing(true);setArmed(undefined);openList();}} onClick={openList} onKeyDown={key}/>
      </div>
      <button type="button" className="re-cbx__toggle" disabled={locked} tabIndex={-1} aria-label={open?'Close list':'Open list'} onMouseDown={e=>e.preventDefault()} onClick={e=>{e.stopPropagation();setOpen(!open);input.current?.focus();}}><Glyph kind="arrow"/></button>
    </div>
    <AnimatePresence>{open&&!locked&&<motion.div className="re-cbx__pop" initial={{opacity:0,y:-4,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-3,scale:.98}} transition={{duration:reduced?0:.24,ease}}>
      <div ref={list} id={`${id}-list`} role="listbox" aria-label={label??placeholder} aria-multiselectable={multiple||undefined} className="re-cbx__list" style={{height}} onMouseLeave={()=>{if(hoverOrigin.current)setPointing(false);}}>
        <span className="re-cbx__pill" style={{height:pill.height,transform:`translateY(${pill.top}px)`,opacity:pointing&&activeIndex>=0?1:0}}/>
        <div ref={inner} className="re-cbx__list-inner">
          {groups.map((group,gi)=><div key={group} role="group" aria-labelledby={group?`${id}-group-${gi}`:undefined} className="re-cbx__group">{group&&<div className="re-cbx__group-label" id={`${id}-group-${gi}`}>{group}</div>}{ordered.filter(o=>(o.group??'')===group).map(o=>{const index=ordered.indexOf(o);return <div key={o.value} id={`${id}-option-${index}`} role="option" aria-selected={selection.includes(o.value)} aria-disabled={o.disabled||undefined} className="re-cbx__option" onMouseMove={()=>{if(o.disabled)return;setActive(index);setPointing(true);hoverOrigin.current=true;}} onMouseDown={e=>e.preventDefault()} onClick={()=>pick(o)}><Avatar option={o}/><span className="re-cbx__text"><span className="re-cbx__name"><Match text={o.label} query={query}/></span>{o.hint&&<span className="re-cbx__hint"><Match text={o.hint} query={query}/></span>}</span><Glyph kind="check" className="re-cbx__check"/></div>;})}</div>)}
          {!filtered.length&&<div className="re-cbx__empty">{error||emptyText}{!error&&query?` for “${query}”`:''}</div>}
          {canCreate&&<div id={`${id}-option-${ordered.length}`} role="option" aria-selected={false} className="re-cbx__option re-cbx__create" onMouseMove={()=>{setActive(ordered.length);setPointing(true);hoverOrigin.current=true;}} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(ordered.length)}><Glyph kind="plus"/>{createLabel(query.trim())}</div>}
        </div>
      </div>
      <div className="re-cbx__foot" aria-hidden="true"><span><span className="re-cbx__roll" key={selection.length}>{selection.length}</span> selected</span><span className="re-cbx__keys"><kbd>↑</kbd><kbd>↓</kbd> to move <kbd>↵</kbd> to {multiple?'toggle':'select'}</span></div>
    </motion.div>}</AnimatePresence>
    {(pending||error)&&<p id={`${id}-feedback`} className="re-cbx__feedback" role={error?'alert':'status'}>{pending?pendingText:error}</p>}
    <span className="re-cbx__sr" aria-live="polite">{announcement}</span>
  </div>;
}
export default Combobox;
