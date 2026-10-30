import { createElement, useEffect, useMemo, useState } from 'react';
import type { GraphNode, GraphCall } from '../components/agent-graph';
import observed from './agent-graph-observed.json';
const iconFiles = import.meta.glob('./agent-graph-icons/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const names: Record<string,string> = {'orchestrator':'Orchestrator',researcher:'Researcher',analyst:'Analyst',coder:'Coder',writer:'Writer','web-search':'Web search',notion:'Notion',hubspot:'HubSpot',database:'Database',github:'GitHub',stripe:'Stripe',slack:'Slack',you:'You'};
const details: Record<string,string> = {orchestrator:'Opus 5.5',researcher:'Sonnet 5.5',analyst:'Gemini 3.8 Pro',coder:'GPT-6 Sol',writer:'Sonnet 5.5'};
const costShare:Record<string,number>={orchestrator:.11/.33,researcher:.055/.33,analyst:.055/.33,coder:.065/.33,writer:.045/.33};
export const demoEdges: [string,string][] = [['you','orchestrator'],['orchestrator','researcher'],['orchestrator','coder'],['orchestrator','analyst'],['orchestrator','writer'],['orchestrator','slack'],['researcher','web-search'],['researcher','notion'],['analyst','database'],['analyst','hubspot'],['coder','github'],['writer','notion'],['writer','slack'],['writer','you']];
const labels:Record<string,string[]>={
 'orchestrator/researcher':['Compare plans and competitors'], 'orchestrator/coder':['Build the pricing page'], 'orchestrator/analyst':['Check usage and lost deals'], 'orchestrator/writer':['Write and announce the copy'],
 'writer/notion':['Read the brief','Draft the plan copy','Draft the announcement',"Add the Analyst’s numbers"], 'writer/you':['Post the announcement to #launch?'], 'writer/slack':['Post the announcement','Confirm delivery'],
 'coder/github':['Read the repository','Create a branch','Update pricing','Run checks','Retry the build','Open PR #482'], 'coder/stripe':['Read active prices','Compare price tiers','Update the plan mapping'],
 'researcher/web-search':['Search competitor pricing'], 'researcher/notion':['Save the comparison'], 'analyst/database':['Query plan usage'], 'analyst/hubspot':['Read lost deals'], 'orchestrator/slack':['Send the summary'], 'you/orchestrator':['Plan the pricing launch'],
};
export function useAgentGraphDemo(replay: number) {
 const [elapsed,setElapsed]=useState(0);
 useEffect(()=>{const start=performance.now();setElapsed(0);const timer=window.setInterval(()=>setElapsed(performance.now()-start),33);return()=>window.clearInterval(timer);},[replay]);
 const cycle=Math.floor(elapsed/31000),now=elapsed%31000;
 return useMemo(()=>{
  const track=[...observed.tracks].reverse().find(s=>s.at<=now)??observed.tracks[0];
  const hasStripe=track.nodes.some(n=>n.id==='stripe');
  const layout:Record<string,number[]>=hasStripe?observed.layouts.stripe:observed.layouts.base;
  const nodes:GraphNode[]=track.nodes.map(n=>({id:n.id,name:names[n.id],kind:n.id==='you'?'user':details[n.id]?'agent':'tool',lead:n.id==='orchestrator',detail:details[n.id],doing:n.doing,status:n.status as GraphNode['status'],position:(layout[n.id]??[282,314.1]) as [number,number],cost:Math.round(track.totalCost*(costShare[n.id]??0)*1000)/1000,icon:createElement('img',{src:iconFiles[`./agent-graph-icons/${n.id}.svg`],alt:'',draggable:false})}));
  const counts:Record<string,number>={};
  const calls:GraphCall[]=observed.calls.filter(c=>c.at<=now&&nodes.some(n=>n.id===c.fromId)&&nodes.some(n=>n.id===c.toId)).map((c,i)=>{
   const pair=`${c.fromId}/${c.toId}`;const ix=counts[pair]??0;counts[pair]=ix+1;
   const phaseTime=c.at>15000?c.at-14000:c.at;
   const isError=pair==='coder/github'&&phaseTime>=9300&&phaseTime<=9800;
   const ms=pair==='writer/you'?2200:isError?1000:c.fromId==='orchestrator'?500:pair==='writer/notion'?(ix===0?700:800):700;
   const options=labels[pair]??['Call'];return {id:`${cycle}-${i}`,from:c.fromId,to:c.toId,at:c.at,status:now<c.at+ms?'pending':isError?'error':'ok',ms,label:options[ix%options.length]};
  });
  return {nodes,calls,edges:hasStripe?[...demoEdges,['coder','stripe'] as [string,string]]:demoEdges,now};
 },[now,cycle]);
}
