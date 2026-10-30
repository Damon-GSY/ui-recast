import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AgentInbox, type AgentTask} from '../../components/agent-inbox';
import '@fontsource-variable/inter';
const initial:AgentTask[] = [
{id:'waiting',title:'Waiting task',description:'Waiting for caller approval.',agent:'A',status:'waiting',elapsed:10,steps:[{label:'Ready for approval',time:'now'}]},
{id:'running',title:'Running task',agent:'B',status:'running',startedAt:Date.now()-1000},
{id:'failed',title:'Failed task',agent:'C',status:'failed',steps:[{label:'An error occurred',time:'now'}]},
{id:'done',title:'Done task',agent:'D',status:'done',elapsed:20}];
function Contract(){
 const [tasks,setTasks]=useState(initial);const [event,setEvent]=useState('');
 return <><button onClick={()=>setTasks(ts=>ts.map(t=>t.id==='waiting'?{...t,status:'running'}:t))}>Apply running</button><button onClick={()=>setTasks(ts=>ts.map(t=>t.id==='waiting'?{...t,status:'failed'}:t))}>Apply failed</button><output data-events>{event}</output><div style={{width:'min(718px,100%)',marginTop:30}}><AgentInbox tasks={tasks} view="board" onViewChange={v=>setEvent(`view:${v}`)} onAction={(action,t)=>setEvent(`${action}:${t.id}`)}/></div></>;
}
createRoot(document.getElementById('root')!).render(<Contract/>);
