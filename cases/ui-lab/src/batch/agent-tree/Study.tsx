import {useEffect, useState} from 'react';
import {AgentTree, type AgentTreeNode, type AgentTreeCost, type AgentTreeStatus} from '../../components/agent-tree';
import marks from './rendered-marks.json';
import './study.css';

/** Publicly rendered SVG marks, captured 2026-10-29. Only used in the comparison fixture. */
const svgImage=(svg:string)=><img alt="" src={`data:image/svg+xml,${encodeURIComponent(svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replaceAll('currentColor','#151515'))}`}/>;
function branding(name:string) {
  const value=marks[name as keyof typeof marks];
  return value?{avatar:svgImage(value.avatar),tools:value.tools.map((svg,i)=>({id:String(i),label:`Reference tool ${i+1}`,icon:svgImage(svg)}))}:{};
}
export const relationshipExample: readonly AgentTreeNode[] = [
  {id:'orchestrator',name:'Orchestrator',task:'Launch the new pricing page',children:[
    {id:'researcher',name:'Researcher',task:'Compare competitor pricing',children:[
      {id:'scraper',name:'Scraper',task:'Read the public pricing pages'},
      {id:'analyst',name:'Analyst',task:'Summarize research findings'},
    ]},
    {id:'writer',name:'Writer',task:'Write the pricing page copy'},
    {id:'coder',name:'Coder',task:'Build the pricing page',children:[
      {id:'tester',name:'Tester',task:'Test the checkout flow'},
    ]},
  ]},
];

type Sample = {id:string;parentId?:string;name:string;model:string;task:string;start:number;end:number;cost:number;failed?:boolean};
const samples: Sample[] = [
  {id:'orchestrator',name:'Orchestrator',model:'Opus 5.5',task:'Launch the new pricing page by Friday',start:0,end:101,cost:1.11},
  {id:'researcher',parentId:'orchestrator',name:'Researcher',model:'Sonnet 5.5',task:'Compare the pricing of five competitors',start:6,end:51,cost:.18},
  {id:'scraper',parentId:'researcher',name:'Scraper',model:'Gemini 3.8 Flash',task:'Read the pricing pages of Linear, Notion and three more',start:14,end:36,cost:.03},
  {id:'analyst',parentId:'researcher',name:'Analyst',model:'Sonnet 5.5',task:'Summarize 120 G2 reviews that mention price',start:21,end:48,cost:.08},
  {id:'writer',parentId:'orchestrator',name:'Writer',model:'Sonnet 5.5',task:'Write the copy for the three plans',start:11,end:80,cost:.19},
  {id:'coder',parentId:'orchestrator',name:'Coder',model:'GPT-6 Sol',task:'Build the page and wire up checkout',start:16,end:96,cost:.48},
  {id:'tester',parentId:'coder',name:'Tester',model:'GPT-6 Mini',task:'Write and run the checkout tests',start:29,end:56,cost:.04,failed:true},
  {id:'retry',parentId:'coder',name:'Tester',model:'GPT-6 Mini',task:'Fix the coupon test and run all again',start:61,end:87,cost:.04},
];
const duration=(seconds:number)=>seconds<60?`${seconds}s`:`${Math.floor(seconds/60)}m ${String(seconds%60).padStart(2,'0')}s`;
/** Labelled source-comparison simulation. No runtime component imports this fixture. */
export function sourceSample(seconds=112): {nodes:AgentTreeNode[];totalCost:AgentTreeCost} {
  const started=samples.filter(item=>seconds>=item.start);
  const ownCost=(sample:Sample)=>sample.cost*Math.min(1,Math.max(0,(seconds-sample.start)/(sample.end-sample.start)));
  const branch=(sample:Sample):number=>ownCost(sample)+started.filter(child=>child.parentId===sample.id).reduce((sum,child)=>sum+branch(child),0);
  const running=(sample:Sample):boolean=>seconds<sample.end||started.some(child=>child.parentId===sample.id&&running(child));
  const nodes=started.map(item=>{
    const status:AgentTreeStatus=seconds>=item.end?(item.failed?'failed':'done'):item.id==='writer'&&seconds>=46&&seconds<60?'waiting':'running';
    const assets=branding(item.name);
    if(item.id==='tester')assets.tools=assets.tools?.slice(0,1);
    return {id:item.id,parentId:item.parentId,name:item.name,model:item.model,task:item.task,...assets,status,cost:{amount:branch(item),completeness:'complete' as const,scope:'branch' as const,live:running(item)},durationLabel:duration(Math.floor(Math.min(seconds,item.end)-item.start))};
  });
  return {nodes,totalCost:{amount:branch(samples[0]),completeness:'complete',live:seconds<101}};
}

export default function Study({initialMode='integration'}:{initialMode?:'integration'|'source'}) {
  const [mode,setMode]=useState(initialMode),[selected,setSelected]=useState<string|null>(null),[collapsed,setCollapsed]=useState<string[]>([]),[seconds,setSeconds]=useState(0),[playing,setPlaying]=useState(initialMode==='source'),[cycle,setCycle]=useState(0);
  const [lastEvent,setLastEvent]=useState('No selection'),[dark,setDark]=useState(false);
  useEffect(()=>{
    if(!playing||mode!=='source')return;
    const start=performance.now();
    const timer=setInterval(()=>{
      const elapsed=(performance.now()-start)/1000,phase=elapsed%18.5,t=Math.min(101,Math.floor(phase*8));
      setSeconds(t);
      setCollapsed(phase>=8.8&&phase<16?['researcher']:[]);
    },125);
    return()=>clearInterval(timer);
  },[mode,playing,cycle]);
  const fixture=sourceSample(seconds);
  function reset(){setSeconds(0);setSelected(null);setCollapsed([]);setPlaying(mode==='source');setCycle(c=>c+1);setLastEvent('No selection');}
  return <div className="agent-tree-study" data-theme={dark?'dark':'light'}>
    <div className="agent-tree-study__controls">
      <button type="button" aria-pressed={mode==='integration'} onClick={()=>{setMode('integration');setPlaying(false);setCollapsed([]);}}>Integration · Unknown</button>
      <button type="button" aria-pressed={mode==='source'} onClick={()=>{setMode('source');setSeconds(0);setPlaying(true);setCycle(c=>c+1);}}>Source fixture</button>
      <button type="button" onClick={reset}>Reset preview</button>
      {mode==='source'&&<><button type="button" onClick={()=>setPlaying(p=>!p)}>{playing?'Pause sample':'Play sample'}</button><button type="button" onClick={()=>{setPlaying(false);setSeconds(112);setCollapsed([]);}}>Completed sample</button></>}
      <button type="button" aria-pressed={dark} onClick={()=>setDark(value=>!value)}>Dark</button>
    </div>
    <p className="agent-tree-study__caption">{mode==='source'?'Sample timeline · simulated data for public preview comparison':'Integration example · relationships supplied, telemetry unavailable'}</p>
    <div className="agent-tree-study__canvas" onPointerDownCapture={()=>setPlaying(false)} onKeyDownCapture={()=>setPlaying(false)}>
      <AgentTree nodes={mode==='source'?fixture.nodes:relationshipExample} totalCost={mode==='source'?fixture.totalCost:undefined} selectedId={selected} onSelect={node=>{setSelected(node.id);setLastEvent(`onSelect: ${node.id}`);}} collapsed={collapsed} onCollapsedChange={ids=>{setCollapsed(ids);setLastEvent(`onCollapsedChange: ${ids.join(', ')||'none'}`);}}/>
    </div>
    <output className="agent-tree-study__event">{lastEvent}</output>
  </div>;
}
