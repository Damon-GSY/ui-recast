import { useState } from 'react';
import { ExpandableCards, type ExpandableCardItem } from '../../components/expandable-cards';
import './study.css';

function RuleIcon({ index }: { index: number }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {index === 0 ? <><path d="M7 8h18M7 16h18M7 24h18"/><circle cx="12" cy="8" r="3" fill="#fafafa"/><circle cx="21" cy="16" r="3" fill="#fafafa"/><circle cx="13" cy="24" r="3" fill="#fafafa"/></> : index === 1 ? <><path d="M5 11h9l3 4h10v12H5zM7 11V7h10l4 4"/><path d="M12 20h8"/></> : <><path d="m6 8 9 8-9 8M18 24h8"/><path d="M21 7v8M17 11h8"/></>}
  </svg>;
}

export default function Study() {
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(location.search).get('initial') === 'open' ? 'triage' : null);
  const [hold, setHold] = useState(false);
  const [events, setEvents] = useState('No fixture action yet');
  const definitions = [
    { id: 'triage', title: 'A quieter menu bar', description: 'Keep everyday tools close. Tuck away the rest.', condition: 'When an app has not been used recently', outcome: 'Move its icon into the hidden section', meta: '3 conditions' },
    { id: 'work', title: 'Make room for focus', description: 'Bring your work tools together in one place.', condition: 'When the Focus group is active', outcome: 'Show the apps assigned to this group', meta: '2 conditions' },
    { id: 'arrive', title: 'Right there when needed', description: 'Let a useful icon return when it needs you.', condition: 'When a caller-supplied event matches', outcome: 'Request that the matching icon be shown', meta: '1 condition' },
  ];
  const items: ExpandableCardItem[] = definitions.map((item, index) => ({
    ...item, icon: <RuleIcon index={index}/>, content: <div className="mf-expand-study__detail">
      <div><span>WHEN</span><p>{item.condition}</p></div><div><span>THEN</span><p>{item.outcome}</p></div>
      <p className="mf-expand-study__fixture-note">Study fixture · these examples do not change your menu bar.</p>
      <label>Rule note<input placeholder="Add a note…" aria-label="Rule note"/></label>
      <button type="button" onClick={() => setEvents(`Study fixture: requested ${item.title}`)}>Use this rule</button>
      <output role="status">{events}</output>
    </div>,
  }));
  items.push({ id: 'unavailable', title: 'Team-managed rule', description: 'This example is unavailable.', icon: <RuleIcon index={1}/>, disabled: true, content: null });
  return <section className="mf-expand-study">
    <header className="mf-expand-study__intro"><span>MENUFOLD / COMPONENT STUDY</span><h2>A little more detail.</h2><p>Aceternity’s list-to-detail interaction, adapted for a quieter workspace.</p></header>
    <div className="mf-expand-study__controls"><label><input type="checkbox" checked={hold} onChange={e => setHold(e.target.checked)}/> Hold caller selection</label><button type="button" onClick={() => { setSelectedId(null); setEvents('No fixture action yet'); }}>Reset fixture</button></div>
    <div className="mf-expand-study__stage" data-capture-root>
      <div className="mf-expand-study__stage-heading"><span>Rules</span><small>STUDY FIXTURE</small></div>
      <ExpandableCards items={items} label="Rule examples" selectedId={selectedId} onSelectedIdChange={id => { setEvents(`Study fixture: selection requested ${id ?? 'close'}`); if (!hold) setSelectedId(id); }}/>
    </div>
    <output className="mf-expand-study__events" aria-live="polite">{events}</output>
  </section>;
}
