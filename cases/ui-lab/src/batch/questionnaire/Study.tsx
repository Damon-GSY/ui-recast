import {useState} from 'react';
import {SequentialQuestionnaire, type QuestionnaireAnswers, type QuestionnaireDraft, type SequentialQuestion} from '../../components/questionnaire';
import './study.css';

// Reference content: Animate UI v2.4.1 public questionnaire demo.
// All host actions below are explicit in-memory fixtures, with no transport.
const referenceQuestions: readonly SequentialQuestion[] = [
  {name:'direction',required:true,title:'What should the agent build next?',description:'Choose a direction or describe another task.',choices:[
    {value:'tool-calls',label:'Tool call timeline',description:'Show what the agent ran and what came back.'},
    {value:'approvals',label:'Approval checkpoints',description:'Ask before sensitive or destructive actions.'},
    {value:'handoffs',label:'Sub-agent handoffs',description:'Make delegated work and results easier to follow.'},
  ],input:{label:'Another agent feature',placeholder:'Describe another feature…'}},
  {name:'signals',multiple:true,required:false,title:'What should every progress update include?',description:'Select all that apply, or skip this question.',choices:[
    {value:'progress',label:'Progress'},{value:'decisions',label:'Decisions'},{value:'risks',label:'Risks'},{value:'next-step',label:'Next step'},
  ]},
  {name:'timing',required:true,title:'When should work begin?',description:'Choose when the agent should begin the work.',choices:[
    {value:'now',label:'Start now'},{value:'next-cycle',label:'Next development cycle'},{value:'backlog',label:'Add it to the backlog'},
  ]},
];
const freeformQuestions: readonly SequentialQuestion[] = [
  {name:'brief',required:true,title:'What should be different?',description:'Describe the result you need.',input:{label:'Your brief',placeholder:'Describe the result…'}},
  {name:'notes',required:false,title:'Any other context?',description:'Add a note, or explicitly skip this last question.',input:{label:'Additional context',placeholder:'Optional context…'}},
];

export default function Study() {
  const [answers,setAnswers]=useState<QuestionnaireAnswers>({});
  const [activeQuestion,setActiveQuestion]=useState('direction');
  const [submission,setSubmission]=useState<'idle'|'pending'|'error'|'success'>('idle');
  const [expired,setExpired]=useState(false);
  const [draft,setDraft]=useState<QuestionnaireDraft|null>(null);
  const [revision,setRevision]=useState(0);
  const [calls,setCalls]=useState(0);
  const [entries,setEntries]=useState<[string,FormDataEntryValue][]>([]);
  const [preset,setPreset]=useState('reference');
  const [theme,setTheme]=useState<'light'|'dark'>('light');
  const questions=preset==='reference'?referenceQuestions:freeformQuestions;
  const reset=(nextPreset=preset) => {
    setPreset(nextPreset);setAnswers({});setActiveQuestion(nextPreset==='reference'?'direction':'brief');
    setSubmission('idle');setExpired(false);setRevision(v=>v+1);setEntries([]);setCalls(0);
  };
  return <div className="questionnaire-study" data-theme={theme}>
    <div className="questionnaire-study__stage">
      <div className="questionnaire-study__frame" data-theme={theme}>
        <SequentialQuestionnaire key={revision} questions={questions} answers={answers} onAnswersChange={setAnswers}
          activeQuestion={activeQuestion} onActiveQuestionChange={setActiveQuestion} expired={expired} submission={submission}
          error="Fixture response: submission failed. Review your answers before trying again."
          onErrorAcknowledge={()=>setSubmission('idle')} submitLabel={preset==='reference'?'Save plan':'Submit brief'}
          onSubmit={(_next,data)=>{setEntries([...data.entries()]);setCalls(n=>n+1);setSubmission('pending');}}/>
      </div>
    </div>
    <aside className="questionnaire-study__controls" aria-label="Questionnaire host fixture">
      <p><strong>Host integration example</strong> · In-memory fixture</p>
      <div className="questionnaire-study__buttons">
        <button type="button" onClick={()=>reset()}>Reset preview</button>
        <button type="button" onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>Toggle theme</button>
        <label>Scenario <select value={preset} onChange={e=>{setDraft(null);reset(e.target.value);}}><option value="reference">Reference workflow</option><option value="freeform">Freeform and last-question skip</option></select></label>
      </div>
      <div className="questionnaire-study__buttons">
        <button type="button" onClick={()=>setDraft(structuredClone({answers,activeQuestion}))}>Save draft in memory</button>
        <button type="button" disabled={!draft} onClick={()=>{if(draft){setAnswers(structuredClone(draft.answers));setActiveQuestion(draft.activeQuestion);setSubmission('idle');setRevision(v=>v+1);}}}>Restore saved draft</button>
        <button type="button" onClick={()=>setExpired(v=>!v)}>{expired?'Reopen questionnaire':'Expire questionnaire'}</button>
      </div>
      <div className="questionnaire-study__buttons">
        <button type="button" disabled={submission!=='pending'} onClick={()=>setSubmission('error')}>Reject submission</button>
        <button type="button" disabled={submission!=='pending'} onClick={()=>setSubmission('success')}>Accept submission</button>
      </div>
      <p>The host controls the active question, answers, draft restoration, expiry and submission response. Failure requires acknowledgement and a fresh confirmation. These controls do not call a backend.</p>
      <output data-testid="host-state">{JSON.stringify({activeQuestion,submission,expired,submitCalls:calls,answers,formEntries:entries},null,2)}</output>
    </aside>
  </div>;
}
