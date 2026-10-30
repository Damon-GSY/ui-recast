import { useState } from 'react';
import { StackedEmptyState, type StackedEmptyStateKind } from '../../components/stacked-empty-state';
import './study.css';

const fixtures = {
  rules: { title: 'No rules yet', description: 'Start with one small rule to make your menu bar feel more like you.', actionLabel: 'Create a rule' },
  groups: { title: 'No groups yet', description: 'Create your first group and bring related tools together.', actionLabel: 'Create a group' },
  stash: { title: 'Your stash is clear', description: 'Add a file to your temporary shelf and keep it close while you work.', actionLabel: 'Add a file' },
};

export default function Study() {
  const [kind, setKind] = useState<StackedEmptyStateKind>('rules');
  const [disabled, setDisabled] = useState(false);
  const [instance, setInstance] = useState(0);
  const [event, setEvent] = useState('No fixture action yet');
  return <section className="mf-stack-study">
    <header><span>MENUFOLD / COMPONENT STUDY</span><h2>A calm place to begin.</h2><p>A layered empty state with one clear next step.</p></header>
    <div className="mf-stack-study__controls"><div role="group" aria-label="Empty state fixture">{(['rules','groups','stash'] as const).map(value => <button type="button" key={value} aria-pressed={kind === value} onClick={() => { setKind(value); setEvent('No fixture action yet'); }}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div><label><input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)}/> Disable action</label></div>
    <div className="mf-stack-study__stage" data-capture-root><small>STUDY FIXTURE</small><StackedEmptyState key={instance} kind={kind} {...fixtures[kind]} disabled={disabled} onAction={() => setEvent(`Study fixture: requested ${fixtures[kind].actionLabel.toLowerCase()}`)}/></div>
    <footer><output aria-live="polite">{event}</output><button type="button" onClick={() => setInstance(value => value + 1)}>Replay entrance</button></footer>
  </section>;
}
