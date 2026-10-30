import {useEffect, useState} from 'react';
import {ToolCallCard, ToolCallGroup, type ToolCallStatus} from '../../components/tool-call-card';

function SearchIcon(){return <svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.25"/><path d="m10.25 10.25 3 3"/></svg>;}
function PageIcon(){return <svg viewBox="0 0 16 16"><path d="M4 2.75h5l3 3v7.5H4z"/><path d="M9 2.75v3h3M6 9h4M6 11h3"/></svg>;}
const results={results:[{title:'HubSpot Sales Hub pricing',url:'https://www.hubspot.com/pricing/sales',price_per_seat:90},{title:'Pipedrive plans and pricing',url:'https://www.pipedrive.com/en/pricing',price_per_seat:49},{title:'Attio pricing',url:'https://attio.com/pricing',price_per_seat:59},{title:'Salesforce Starter Suite',url:'https://www.salesforce.com/sales',price_per_seat:25},{title:'Close CRM pricing',url:'https://www.close.com/pricing',price_per_seat:49}],total:5,cached:false};
const states=['Running','Succeeded','Failed','Retry','Complete'] as const;
/** Public-preview data and replay are confined to Study; production renders supplied props. */
export default function SourceStudy(){
 const [step,setStep]=useState(0),[playing,setPlaying]=useState(false),[cycle,setCycle]=useState(0),[open,setOpen]=useState(true);
 useEffect(()=>{
  if(!playing)return;
  const timers=[setTimeout(()=>setStep(1),1500),setTimeout(()=>setStep(2),3500),setTimeout(()=>setPlaying(false),5500)];
  return()=>timers.forEach(clearTimeout);
 },[playing,cycle]);
 const status:ToolCallStatus=step===2?'error':step===4?'success':'running';
 const fetchStatus:ToolCallStatus=step===2?'error':step>=4?'success':'running';
 return <div className="tool-source-study">
  <div className="tool-tabs-study__controls"><button onClick={()=>{setStep(0);setOpen(true);setCycle(c=>c+1);setPlaying(true);}}>Replay source fixture</button>{states.map((label,i)=><button key={label} aria-pressed={step===i} onClick={()=>{setPlaying(false);setStep(i);}}>{label}</button>)}</div>
  <p className="tool-source-study__caption">Public-preview comparison · supplied sample records</p>
  <div className="tool-source-study__frame" data-source-capture>
   <ToolCallGroup label={step===4?'Used 2 tools':'Using tools…'} status={status} duration={[800,1800,3500,600,4200][step]} icons={[{id:'search',icon:<SearchIcon/>},...(step>0?[{id:'page',icon:<PageIcon/>}]:[])]} open={open} onOpenChange={setOpen}>
    <ToolCallCard key={`search-${cycle}`} name="search_web" summary={step===0?'Searching the web for CRM pricing':"Searched the web for 'CRM pricing 2026'"} icon={<SearchIcon/>} status={step===0?'running':'success'} duration={step===0?800:1500} args={{query:'CRM pricing 2026 small sales team',max_results:5}} result={step===0?{state:'pending'}:{state:'captured',value:results}}/>
    {step>0&&<ToolCallCard key={`fetch-${cycle}`} name="fetch_page" summary="Reading hubspot.com/pricing" icon={<PageIcon/>} status={fetchStatus} duration={step===2?1800:step===4?2700:300} error={step===2?'Request timed out after 5s — hubspot.com did not respond.':undefined} args={{url:'https://www.hubspot.com/pricing/sales',format:'markdown'}} result={fetchStatus==='success'?{state:'captured',value:{title:'HubSpot Sales Hub',price_per_seat:90}}:fetchStatus==='running'?{state:'pending'}:{state:'not-captured'}}/>}
   </ToolCallGroup>
  </div>
 </div>;
}
