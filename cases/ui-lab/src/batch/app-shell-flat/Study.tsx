import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AppShellFlat, AppShellIcon} from '../../components/app-shell-flat';
import './study.css';

const tasks = [
  {label:'Set up your workspace', items:['Name your workspace','Invite your teammates','Connect your first app']},
  {label:'Start working', items:['Create a folder','Start your first chat','Upload a file']},
  {label:'Make it yours', items:['Add a profile picture','Choose your notifications']},
];
function SetupGuide() {
  const [open, setOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [group, setGroup] = useState<number | null>(0);
  const [done, setDone] = useState(['Name your workspace']);
  const [height, setHeight] = useState(259);
  const content = useRef<HTMLDivElement>(null);
  const summary = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (!content.current) return;
    const node = content.current;
    const measure = () => setHeight(Math.ceil(node.getBoundingClientRect().height));
    const observer = new ResizeObserver(measure); observer.observe(node); measure();return () => observer.disconnect();
  }, [open]);
  const progress = Math.round(done.length / 8 * 100);
  useEffect(() => {
    if (open || !showContent) return;
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    const timer = window.setTimeout(() => {
      setShowContent(false);
      requestAnimationFrame(() => summary.current?.focus());
    }, delay);
    return () => window.clearTimeout(timer);
  }, [open, showContent]);
  const close = () => setOpen(false);
  return <div className="asf-guide-slot"><div className="asf-guide" data-open={open} style={{height:open ? height : 70}}>
    {showContent ? <div className="asf-guide-content" data-exiting={!open} inert={!open} key="expanded"><div className="asf-setup" ref={content}>
      <div className="asf-setup-head"><b>Getting started</b><button type="button" aria-label="Close setup guide" onClick={close}><AppShellIcon name="close" size={18}/></button></div>
      <div className="asf-setup-progress" role="progressbar" aria-label="Setup progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{transform:`scaleX(${done.length / 8})`}}/></div>
      {tasks.map((section,i) => <div className="asf-setup-group" key={section.label} data-open={group === i}>
        <button type="button" className="asf-setup-group-head" aria-expanded={group === i} onClick={() => setGroup(group === i ? null : i)}><span>{section.label}</span><AppShellIcon name="chevron" size={14}/></button>
        <div className="asf-setup-panel" inert={group !== i}><div className="asf-setup-tasks">{section.items.map((label,j) => {
          const complete = done.includes(label), disabled = j > 0 && !done.includes(section.items[j-1]);
          return <button type="button" key={label} className="asf-setup-task" disabled={disabled && !complete} aria-pressed={complete} data-done={complete}
            onClick={() => setDone(complete ? done.filter(x => x !== label) : [...done,label])}>
            <span className="asf-task-mark">{complete ? <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="m5 8 2 2 4-4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : disabled ? <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="m4 12 8-8" stroke="currentColor" strokeWidth="1.5"/></svg> : null}</span><span>{label}</span>
          </button>;
        })}</div></div>
      </div>)}
    </div></div> : <button type="button" ref={summary} className="asf-guide-summary asf-guide-content" key="summary" onClick={() => {setGroup(0);setShowContent(true);setOpen(true);}} aria-expanded={false}>
      <span className="asf-guide-title">Getting started<AppShellIcon name="right" size={13}/></span>
      <span className="asf-guide-sub">{progress}% done · <span>Great start!</span></span><span className="asf-guide-progress"><span style={{width:`${progress}%`}}/></span>
    </button>}
  </div></div>;
}
function News() {
  const [index, setIndex] = useState(0);
  if (index > 1) return null;
  return <div className="asf-news" data-stacked={index === 0}>
    {index === 0 && <div className="asf-news-back"><span>New in Acme</span><AppShellIcon name="close" size={13}/></div>}
    <div className="asf-news-card" key={index}><div className="asf-news-top"><span>New in Acme</span><button type="button" aria-label="Dismiss" onClick={() => setIndex(index + 1)}><AppShellIcon name="close" size={13}/></button></div>
      <b>{index === 0 ? 'Shared folders' : 'Scheduled chats'}</b><button type="button" className="asf-news-more">Full changelog<AppShellIcon name="right" size={13}/></button>
    </div>
  </div>;
}
export default function Study() {
  const capture = new URLSearchParams(window.location.search).has('capture');
  const [version, setVersion] = useState(0);
  const [active, setActive] = useState('New chat');
  const [longContent, setLongContent] = useState(false);
  const reset = () => {setVersion(v => v + 1); setActive('New chat');setLongContent(false);window.scrollTo(0,0);};
  const childPage = active !== 'New chat';
  return <div className={`asf-study ${capture ? 'asf-study--capture' : ''}`}>
    <div className="asf-study-stage">
      <AppShellFlat key={version} workspace="Acme" user={{name:'Alex Morgan'}} active={active} onNavigate={setActive}
        nav={[{label:'New chat',icon:<AppShellIcon name="compose"/>},{label:'Folders',icon:<AppShellIcon name="folder"/>},{label:'Integrations',icon:<AppShellIcon name="integrations"/>}]}
        projects={['Q3 Campaign','Brand assets','Hiring','Research']} header={childPage ? false : {title:'New chat'}}
        workspaceMenu={[{label:'Acme',description:'Pro · 8 members',current:true},{label:'Personal',description:'Free'},{label:'Create workspace',icon:<AppShellIcon name="plus"/>}]}
        profileMenu={[{label:'Profile',icon:<AppShellIcon name="profile"/>},{label:'Settings',icon:<AppShellIcon name="settings"/>},{label:'Help & feedback',icon:<AppShellIcon name="help"/>},{label:'Log out',icon:<AppShellIcon name="logout"/>,danger:true}]}
        sidebarFooter={<><News/><SetupGuide/></>}>
        {childPage ? <div className="asf-slot-page"><h1>{active}</h1><p>Page content slot</p><p>Navigation selected “{active}”. Supply this screen through the shell’s children.</p><button type="button" onClick={() => setActive('New chat')}>Back to shell preview</button></div> : <div className="asf-empty-center"><div className="asf-empty"><span className="asf-empty-icon"><AppShellIcon name="document" size={18}/></span><b>Your page goes here</b><p>The flat shell brings the sidebar and the<br className="asf-empty-break"/> scroll container – put any screen inside.</p></div></div>}
        {longContent && <div className="asf-scroll-fixture">{Array.from({length:16},(_,i) => <section key={i}><h2>Content section {i+1}</h2><p>Caller-provided content in the shell’s principal scroll container.</p></section>)}</div>}
      </AppShellFlat>
    </div>
    <div className="asf-study-controls"><button type="button" onClick={reset}>Reset preview</button><label><input type="checkbox" checked={longContent} onChange={e => setLongContent(e.target.checked)}/> Long content</label>{!capture && <span>Clean / light · navigation demonstrates the content slot</span>}</div>
  </div>;
}
