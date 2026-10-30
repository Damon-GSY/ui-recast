import {useEffect, useRef, useState} from 'react';
import {AgentInbox, type AgentInboxAction, type AgentInboxView, type AgentTask} from '../../components/agent-inbox';
import './study.css';

function fixtures(): AgentTask[] {
  const now = Date.now();
  return [
    {id:'migrate',title:'Migrate users table',description:'Split users into accounts and profiles on Postgres 17. The dry run on staging passed.',agent:'Opus 5.5',status:'waiting',startedAt:now-372000,sources:9,tools:14,steps:[{label:'Read schema and 14 migrations',time:'6m ago'},{label:'Wrote migration 0042_split_users',time:'4m ago'},{label:'Dry run on staging – no errors',time:'2m ago'},{label:'Wants to run it on production',time:'1m ago'}]},
    {id:'crm',title:'Clean up CRM contacts',description:'Matched 1,312 likely duplicates, then the merge hit the API rate limit.',agent:'Haiku 5.5',status:'failed',sources:2,tools:6,steps:[{label:'Loaded 18,240 contacts',time:'9m ago'},{label:'Matched 1,312 likely duplicates',time:'8m ago'},{label:'Merge stopped – API rate limit (429)',time:'7m ago'}]},
    {id:'review',title:'Review PR #482',description:'Billing webhooks: reading the diff and the test run, writing comments.',agent:'Sonnet 5.5',status:'running',startedAt:now-220000,sources:12,tools:21,steps:[{label:'Read 12 changed files',time:'2m ago'},{label:'Ran the test suite – 214 passed',time:'1m ago'},{label:'Writing review comments',time:'now'}]},
    {id:'notes',title:'Release notes v2.4',description:'Grouping 23 merged pull requests into features and fixes.',agent:'Sonnet 5.5',status:'running',startedAt:now-78000,sources:23,tools:5,steps:[{label:'Collected 23 merged pull requests',time:'1m ago'},{label:'Drafting the highlights',time:'now'}]},
    {id:'digest',title:'Weekly metrics digest',description:'Pulled numbers from three dashboards and posted the summary to #metrics.',agent:'Haiku 5.5',status:'done',elapsed:252,sources:3,tools:8,steps:[{label:'Pulled numbers from 3 dashboards',time:'22m ago'},{label:'Posted to #metrics',time:'18m ago'}]},
  ];
}
const step = (task: AgentTask, label: string) => [...task.steps ?? [], {label,time:'now'}].slice(-4);
export default function Study() {
  const [tasks,setTasks] = useState(fixtures);
  const [open,setOpen] = useState<string|null>(null);
  const [view,setView] = useState<AgentInboxView>('board');
  const [playing,setPlaying] = useState(true);
  const [cycle,setCycle] = useState(0);
  const [log,setLog] = useState('');
  const completions = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearCompletions = () => {completions.current.forEach(clearTimeout);completions.current=[];};
  const approve = (id:string) => setTasks(ts=>ts.map(t=>t.id===id?{...t,status:'running',startedAt:Date.now()-359000,steps:step(t,'Approved by you – running on production')}:t));
  const finish = (id:string) => setTasks(ts=>ts.map(t=>t.id===id?{...t,status:'done',elapsed:id==='migrate'?408:4,tools:(t.tools??0)+3,steps:step(t,id==='migrate'?'Migrated 48,210 rows':'Merged 1,312 duplicates')}:t));
  useEffect(()=>{
    if(!playing)return;
    setTasks(fixtures());setOpen(null);setView('board');
    const timers = [setTimeout(()=>setOpen('migrate'),700),setTimeout(()=>approve('migrate'),3300),setTimeout(()=>setOpen(null),4700),setTimeout(()=>finish('migrate'),7500),setTimeout(()=>{setTasks(fixtures());setOpen(null);setView('board');setCycle(c=>c+1);},11700)];
    return ()=>timers.forEach(clearTimeout);
  },[cycle,playing]);
  useEffect(()=>()=>clearCompletions(),[]);
  const reset = () => {clearCompletions();setTasks(fixtures());setOpen(null);setView('board');setLog('');setPlaying(true);setCycle(c=>c+1);};
  const action = (kind:AgentInboxAction,task:AgentTask) => {
    setPlaying(false);setLog(`${kind[0].toUpperCase()+kind.slice(1)}: ${task.title}`);
    if(kind==='approve')approve(task.id);
    if(kind==='retry')setTasks(ts=>ts.map(t=>t.id===task.id?{...t,status:'running',startedAt:Date.now(),steps:step(t,'Retrying with a slower pace')}:t));
    if(kind==='reject')setTasks(ts=>ts.map(t=>t.id===task.id?{...t,status:'failed',steps:step(t,'Rejected by you')}:t));
    if(kind==='approve'||kind==='retry')completions.current.push(setTimeout(()=>finish(task.id),4200));
  };
  return <div className="agent-inbox-study">
    <div className="agent-inbox-study__controls"><button type="button" onClick={reset}>Reset preview</button><button type="button" aria-pressed={playing} onClick={()=>setPlaying(p=>!p)}>{playing?'Pause demo':'Play demo'}</button><span role="status">{log || 'Clean · Light'}</span></div>
    <div className="agent-inbox-study__canvas" onPointerDownCapture={()=>setPlaying(false)} onKeyDownCapture={()=>setPlaying(false)}>
      <AgentInbox key={cycle} tasks={tasks} expandedTaskId={open} onExpandedTaskChange={setOpen} view={view} onViewChange={setView} onAction={action}/>
    </div>
  </div>;
}
