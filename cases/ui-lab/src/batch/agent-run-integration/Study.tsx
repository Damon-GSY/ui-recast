import {useState} from 'react';
import {AppShellInset} from '../../components/app-shell-inset';
import {AgentRun, type AgentRunStatus} from '../../components/agent-run';
import './study.css';

// These records and transitions are local fixtures, not a jobs/files API contract.
const rounds = [
  {id: 'outline', title: 'Outline', summary: 'Organize the supplied notes', state: 'Complete'},
  {id: 'review', title: 'Review', summary: 'Check the draft against the notes', state: 'In progress'},
  {id: 'prepare', title: 'Prepare', summary: 'Prepare the handoff document', state: 'Not started'},
];
const files = [
  {name: 'research-notes.md', text: '# Research notes\n\nGoal: make the task easier to follow.\n\n• Keep each round visible.\n• Show the current process.\n• Keep the selected file alongside it.\n\nQuestions\n\nWhich decisions need more context?\nWhich details belong in the final brief?'},
  {name: 'review-summary.md', text: '# Review summary\n\nThe outline covers the supplied notes.\n\n## Next pass\n\n1. Clarify the opening paragraph.\n2. Keep observations separate from decisions.\n3. Link each finding to its source note.'},
];
const reviewItems = ['Read the task brief', 'Collect the source notes', 'Compare the outline', 'Review the introduction', 'Check the decisions', 'Review the examples', 'Check the source references', 'Prepare the summary'];

export default function Study() {
  const [roundId, setRoundId] = useState('review');
  const [fileIndex, setFileIndex] = useState(0);
  const [status, setStatus] = useState<AgentRunStatus>('running');
  const [event, setEvent] = useState('No actions yet');
  const round = rounds.find(item => item.id === roundId)!;
  const selectRound = (id: string) => {setRoundId(id);setEvent(`Round selected: ${id}`);};
  const selectFile = (index: number) => {setFileIndex(index);setEvent(`File selected: ${files[index].name}`);};
  return <div className="run-integration-study">
    <AppShellInset workspace="Research lab" user={{name: 'Demo user'}} workspaceItems={[{label:'Research lab',current:true}]} footer={<div className="run-integration-fixture"><span>Local fixture</span><output aria-live="polite" data-event>{event}</output></div>}
      onNavigate={label => setEvent(`Navigation: ${label}`)} navigation={navigate=><div className="ar-shell-nav-group">{['Overview','Tasks','Files'].map(label => <button key={label} className="ar-shell-nav-item" aria-current={label==='Tasks'?'page':undefined} onClick={()=>navigate(label)}>{label}</button>)}</div>}>
      <AgentRun shell={false} title="Review the research brief" steps={[]} status={status} elapsedMs={42000}
        onStop={()=>{setStatus('stopped');setEvent('Stop requested');}} onRestart={()=>{setStatus('running');setEvent('Restart requested');}} onNavigate={label=>setEvent(`Run action: ${label}`)}
        taskHeader={<div className="run-integration-heading"><b>Review the research brief</b><span data-state={status}>{status==='running'?'Running':'Stopped'}</span></div>}
        rounds={<section className="run-integration-rounds" aria-label="Rounds"><span className="run-integration-eyebrow">ROUNDS</span><div className="run-integration-round-list" role="tablist" aria-label="Round selection">{rounds.map((item,index)=><button id={`round-${item.id}`} key={item.id} role="tab" aria-selected={roundId===item.id} aria-controls="round-process" tabIndex={roundId===item.id?0:-1} onClick={()=>selectRound(item.id)} onKeyDown={e=>{
          const next=e.key==='ArrowRight'?(index+1)%rounds.length:e.key==='ArrowLeft'?(index+rounds.length-1)%rounds.length:e.key==='Home'?0:e.key==='End'?rounds.length-1:undefined;
          if(next===undefined)return;e.preventDefault();selectRound(rounds[next].id);document.getElementById(`round-${rounds[next].id}`)?.focus();
        }}><span>{String(index+1).padStart(2,'0')}</span><b>{item.title}</b><small>{item.state}</small></button>)}</div></section>}
        process={<section id="round-process" className="run-integration-process" role="tabpanel" aria-labelledby={`round-${round.id}`}><header><span className="run-integration-eyebrow">PROCESS</span><h1>{round.title}</h1><p>{round.summary}</p></header>
          <div className="run-integration-files" aria-label="Round files">{files.map((file,index)=><button key={file.name} aria-pressed={index===fileIndex} onClick={()=>selectFile(index)}><span aria-hidden="true">↗</span>{file.name}</button>)}</div>
          <ol>{reviewItems.map((label,index)=><li key={label}><span aria-hidden="true">{index<3?'✓':String(index+1)}</span><div><b>{label}</b><p>{index<3?'Included in the example record.':index===3?'This is the selected process item.':'Waiting for the next update.'}</p></div></li>)}</ol>
        </section>}
        panelTitle="File preview" panelDetails={null} filePreview={<div className="run-integration-preview"><span className="run-integration-eyebrow">SELECTED FILE</span><h2>{files[fileIndex].name}</h2><pre tabIndex={0} aria-label={`Contents of ${files[fileIndex].name}`}>{files[fileIndex].text}</pre><button onClick={()=>{setFileIndex(index=>(index+1)%files.length);setEvent('Next file requested');}}>Next file</button></div>}/>
    </AppShellInset>
  </div>;
}
