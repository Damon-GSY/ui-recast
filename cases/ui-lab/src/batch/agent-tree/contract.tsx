import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource-variable/inter';
import {AgentTree,type AgentTreeNode} from '../../components/agent-tree';
import {relationshipExample,sourceSample} from './Study';

const nested:readonly AgentTreeNode[]=[{id:'a',name:'Root',children:[{id:'b',name:'Branch',children:[{id:'c',name:'Child',children:[{id:'d',name:'Deep leaf'}]},{id:'e',name:'Sibling'}]},{id:'f',name:'Last leaf'}]}];
function Contract(){
 const [nodes,setNodes]=useState<readonly AgentTreeNode[]>(relationshipExample),[selected,setSelected]=useState<string|null>(null),[collapsed,setCollapsed]=useState<string[]>([]),[accept,setAccept]=useState(true),[acceptFold,setAcceptFold]=useState(true),[event,setEvent]=useState(''),[calls,setCalls]=useState(0),[dark,setDark]=useState(false);
 const load=(value:readonly AgentTreeNode[])=>{setNodes(value);setSelected(null);setCollapsed([]);};
 return <main style={{padding:20,fontFamily:'Inter, sans-serif',background:dark?'#19191c':undefined}} data-theme={dark?'dark':'light'}>
 <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
  <button onClick={()=>load(relationshipExample)}>Unknown</button><button onClick={()=>load([])}>Empty</button><button onClick={()=>load(nested)}>Nested</button>
  <button onClick={()=>load([{id:'a',name:'Flat root'},{id:'b',parentId:'a',name:'Flat child'},{id:'orphan',parentId:'absent',name:'Parent unavailable'}])}>Flat</button>
  <button onClick={()=>load([{id:'a',name:'Partial root',cost:{amount:1.2,completeness:'partial',scope:'branch'},children:[{id:'b',name:'Unknown cost'},{id:'z',name:'Actual zero',cost:{amount:0,completeness:'complete'}}]}])}>Partial costs</button>
  <button onClick={()=>load([{id:'live',name:'Live state',status:'running'}])}>Running</button>
  <button onClick={()=>setNodes(value=>value.map(n=>({...n,status:'done'})))}>Complete from parent</button>
  <button onClick={()=>load(sourceSample(112).nodes)}>Completed fixture</button>
  <button onClick={()=>setNodes([{id:'a',name:'Root',children:[{id:'b',name:'Branch'}]}])}>Remove descendants</button>
  <label><input type="checkbox" checked={accept} onChange={e=>setAccept(e.target.checked)}/>Accept selection</label>
  <label><input type="checkbox" checked={acceptFold} onChange={e=>setAcceptFold(e.target.checked)}/>Accept folds</label>
  <button onClick={()=>setDark(v=>!v)}>Dark</button>
 </div>
 <div style={{maxWidth:760,margin:'auto'}}><AgentTree nodes={nodes} selectedId={selected} collapsed={collapsed} onSelect={node=>{setCalls(v=>v+1);setEvent(`select:${node.id}`);if(accept)setSelected(node.id);}} onCollapsedChange={ids=>{setEvent(`fold:${ids.join(',')}`);if(acceptFold)setCollapsed(ids);}}/></div>
 <output data-testid="events" data-calls={calls} data-selected={selected??''} style={{display:'block',marginTop:30}}>{event}</output>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Contract/>);
