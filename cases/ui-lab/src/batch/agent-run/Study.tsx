import {useEffect, useRef, useState} from 'react';
import {AgentRun, type AgentRunStatus, type DraftDecisions, type RunStep} from '../../components/agent-run';
import {makeSteps, runDraft, runTitle} from './fixtures';
import './study.css';

// Only this demo drives time. The distributable component is entirely controlled.
export default function Study(){
  const [steps,setSteps]=useState(makeSteps);
  const [status,setStatus]=useState<AgentRunStatus>('idle');
  const [elapsed,setElapsed]=useState(0);
  const [decisions,setDecisions]=useState<DraftDecisions>({});
  const [undoDecisions,setUndoDecisions]=useState<DraftDecisions>();
  const [cycle,setCycle]=useState(0);
  const [viewVersion,setViewVersion]=useState(0);
  const resume=useRef<{steps:RunStep[];startIndex:number}|null>(null);
  const [notice,setNotice]=useState('');
  const [startedAt,setStartedAt]=useState('');
  const abort=useRef<AbortController|null>(null);
  const approval=useRef<{stepId:string;resolve:(accepted:boolean)=>void}|null>(null);
  const started=useRef(0);
  const stepStarted=useRef(0);
  const callStarted=useRef(0);
  const liveStatus=useRef<AgentRunStatus>('idle');
  const currentStep=useRef<string|null>(null);
  const currentCall=useRef<string|null>(null);
  const changeStatus=(next:AgentRunStatus)=>{liveStatus.current=next;setStatus(next);};
  const updateStep=(id:string,update:(step:RunStep)=>RunStep)=>setSteps(all=>all.map(step=>step.id===id?update(step):step));
  useEffect(()=>{
    const controller=new AbortController();abort.current=controller;
    let timer:ReturnType<typeof setTimeout>|undefined;
    const pause=(ms:number)=>new Promise<boolean>(resolve=>{
      const cancel=()=>{clearTimeout(timer);resolve(false);};
      if(controller.signal.aborted)return resolve(false);
      controller.signal.addEventListener('abort',cancel,{once:true});
      timer=setTimeout(()=>{controller.signal.removeEventListener('abort',cancel);resolve(true);},ms);
    });
    async function run(){
      const continuation=resume.current;resume.current=null;
      const initial=continuation?.steps??makeSteps();setSteps(initial);
      if(!continuation){setDecisions({});setUndoDecisions(undefined);setElapsed(0);}
      currentStep.current=null;currentCall.current=null;approval.current=null;
      if(!continuation){changeStatus('idle');if(!await pause(150))return;started.current=Date.now();setStartedAt(new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}));}
      changeStatus('running');
      for(const step of initial.slice(continuation?.startIndex??0)){
        if(controller.signal.aborted)return;
        currentStep.current=step.id;stepStarted.current=Date.now();
        updateStep(step.id,s=>({...s,status:'running',elapsedMs:0}));
        if(step.approval){
          if(!await pause(450))return;
          updateStep(step.id,s=>({...s,status:'waiting'}));changeStatus('waiting');
          const accepted=await new Promise<boolean>(resolve=>{approval.current={stepId:step.id,resolve};controller.signal.addEventListener('abort',()=>resolve(false),{once:true});});
          approval.current=null;
          if(!accepted||controller.signal.aborted)return;
          changeStatus('running');updateStep(step.id,s=>({...s,status:'running'}));
        }
        if(!await pause(200))return;
        for(const [callIndex,call] of step.calls.entries()){
          currentCall.current=call.id;callStarted.current=Date.now();
          updateStep(step.id,s=>({...s,calls:s.calls.map(c=>c.id===call.id?{...c,status:'running',elapsedMs:0}:c)}));
          if(!await pause(call.durationMs))return;
          updateStep(step.id,s=>({...s,calls:s.calls.map(c=>c.id===call.id?{...c,status:'done',elapsedMs:c.durationMs}:c)}));
          currentCall.current=null;
          if(callIndex<step.calls.length-1&&!await pause(200))return;
        }
        if(!await pause(300))return;
        const duration=Date.now()-stepStarted.current;
        updateStep(step.id,s=>({...s,status:'done',elapsedMs:duration,durationMs:duration}));
        currentStep.current=null;
        if(step!==initial.at(-1)&&!await pause(300))return;
      }
      currentStep.current=null;currentCall.current=null;setElapsed(Date.now()-started.current);changeStatus('completed');
    }
    void run();
    const clock=setInterval(()=>{
      if(liveStatus.current!=='running'&&liveStatus.current!=='waiting')return;
      const now=Date.now();setElapsed(now-started.current);
      if(currentStep.current)updateStep(currentStep.current,s=>({...s,elapsedMs:now-stepStarted.current,calls:s.calls.map(c=>c.id===currentCall.current?{...c,elapsedMs:now-callStarted.current}:c)}));
    },100);
    return()=>{controller.abort();clearTimeout(timer);clearInterval(clock);};
  },[cycle]);
  useEffect(()=>{if(!notice)return;const id=setTimeout(()=>setNotice(''),2500);return()=>clearTimeout(id);},[notice]);
  function stop(next:AgentRunStatus='stopped'){
    changeStatus(next);abort.current?.abort();
    if(currentStep.current)updateStep(currentStep.current,s=>({...s,status:'error',error:next==='denied'?'You denied this step':'Stopped by you',calls:s.calls.map(c=>c.status==='running'?{...c,status:'error'}:c)}));
    currentStep.current=null;currentCall.current=null;
  }
  function approve(id:string){
    if(approval.current?.stepId!==id||liveStatus.current!=='waiting')return;
    updateStep(id,s=>({...s,approval:s.approval?{...s.approval,status:'approved'}:undefined}));
    approval.current.resolve(true);
  }
  function deny(id:string,reason?:string){
    if(approval.current?.stepId!==id||liveStatus.current!=='waiting')return;
    updateStep(id,s=>({...s,approval:s.approval?{...s.approval,status:'denied',reason}:undefined}));
    stop('denied');
  }
  function restart(){resume.current=null;setViewVersion(v=>v+1);setCycle(c=>c+1);}
  function retry(id:string){
    const index=steps.findIndex(s=>s.id===id);if(index<0)return;
    resume.current={startIndex:index,steps:steps.map((s,i)=>i<index?s:{...s,status:'pending',elapsedMs:0,durationMs:undefined,error:undefined,approval:s.approval?{...s.approval,status:'pending'}:undefined,calls:s.calls.map(c=>({...c,status:'pending',elapsedMs:0,error:undefined}))})};
    setCycle(c=>c+1);
  }
  return <div className="agent-run-study">
    <AgentRun key={viewVersion} title={runTitle} steps={steps} status={status} elapsedMs={elapsed} draft={{...runDraft,decisions}} undoDecisions={undoDecisions} startedAt={startedAt} agent="Board prep" workspace="Acme" user={{name:'Alex Morgan'}} cost="$0.14" toolCallCount={8}
      onApprove={approve} onDeny={deny} onStop={()=>stop()} onRestart={restart} onRetry={retry} onStepsChange={setSteps} onDraftChange={next=>{setUndoDecisions(decisions);setDecisions(next);}}
      onNavigate={label=>setNotice(label==='Runs'?'You are viewing this run.':`${label} selected`)}/>
    {notice&&<div className="agent-run-study-notice" role="status">{notice}</div>}
  </div>;
}
