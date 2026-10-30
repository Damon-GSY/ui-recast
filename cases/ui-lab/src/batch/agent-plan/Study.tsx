import {useState} from 'react';
import {AgentPlan} from '../../components/agent-plan';
import {fixtureChoices, snapshots} from './fixtures';
import './study.css';

export default function Study() {
  const [choice, setChoice] = useState('pending');
  const [dark, setDark] = useState(false);
  const [narrow, setNarrow] = useState(false);
  return <div className="agent-plan-study" data-theme={dark ? 'dark' : 'light'}>
    <div className="agent-plan-study__controls" aria-label="External snapshot fixtures">
      <p>TodoWrite snapshot fixtures</p>
      <div className="agent-plan-study__buttons">{fixtureChoices.map(([id, label]) => <button type="button" key={id}
        aria-pressed={choice === id} onClick={() => setChoice(id)}>{label}</button>)}</div>
      <div className="agent-plan-study__buttons">
        <button type="button" aria-pressed={dark} onClick={() => setDark(value => !value)}>Dark theme</button>
        <button type="button" aria-pressed={narrow} onClick={() => setNarrow(value => !value)}>320px container</button>
      </div>
      <p className="agent-plan-study__note">These buttons replace local fixtures outside the read-only component. They do not execute tasks or connect to a backend.</p>
    </div>
    <div className="agent-plan-study__stage">
      <div className="agent-plan-study__frame" data-capture-root style={{maxWidth: narrow ? 320 : 440}}>
        <AgentPlan title="Prepare the Q3 board update" snapshot={snapshots[choice]} />
      </div>
    </div>
    <output className="agent-plan-study__selection" aria-live="polite">Selected fixture: {choice}</output>
  </div>;
}
