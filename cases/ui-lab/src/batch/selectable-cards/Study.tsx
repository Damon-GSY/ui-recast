import { useState } from 'react';
import { SelectableCards } from '../../components/selectable-cards';
import './study.css';

function BackgroundPreview({ kind }: { kind: 'solid' | 'glass' | 'subtle' }) {
  return <svg viewBox="0 0 120 56" fill="none"><rect width="120" height="56" rx="6" fill="#e4e4e7"/><path d="M0 44C32 12 56 51 120 9V56H0Z" fill="#a1a1aa"/><circle cx="99" cy="9" r="29" fill="#d4d4d8"/><rect x="12" y="14" width="96" height="28" rx="8" fill={kind === 'solid' ? '#fff' : '#fff'} fillOpacity={kind === 'solid' ? 1 : kind === 'glass' ? .52 : .12} stroke={kind === 'subtle' ? '#71717a' : '#fff'} strokeOpacity=".7"/>{[29,49,69,89].map(x => <rect key={x} x={x-4} y="24" width="8" height="8" rx="2" fill="#3f3f46" fillOpacity=".75"/>)}</svg>;
}
function ShapePreview({ radius }: { radius: number }) {
  return <svg viewBox="0 0 120 56" fill="none"><rect x="7" y="11" width="106" height="34" rx={radius} fill="#e4e4e7" stroke="#a1a1aa"/>{[29,49,69,89].map(x => <rect key={x} x={x-4} y="24" width="8" height="8" rx="2" fill="#52525b"/>)}</svg>;
}
export default function Study() {
  const [value, setValue] = useState<string | null>('solid');
  const [shape, setShape] = useState<string | null>('rounded');
  const [disabled, setDisabled] = useState(false);
  const [unlock, setUnlock] = useState(false);
  const [last, setLast] = useState('No selection changes yet');
  return <div className="mf-cards-study"><div className="mf-cards-study__stage" data-capture-root>
    <header><span>MENUFOLD / APPEARANCE</span><h2>A comfortable fit.</h2><p>A background and shape that feel like yours.</p></header>
    <div className="mf-cards-study__surface"><div className="mf-cards-study__label"><span>Background</span><small>A quiet layer for your menu</small></div>
      <SelectableCards label="Menu background" name="background" value={value} disabled={disabled} onValueChange={next => { setValue(next); setLast(`Caller received background: ${next}`); }} options={[
        { value:'solid',label:'Solid',description:'A solid, opaque surface.',preview:<BackgroundPreview kind="solid"/> },
        { value:'glass',label:'Glass',description:'A soft translucent layer.',preview:<BackgroundPreview kind="glass"/> },
        { value:'subtle',label:'Subtle',description:unlock ? 'Just a hint of structure.' : 'Unavailable in this fixture.',preview:<BackgroundPreview kind="subtle"/>,disabled:!unlock },
      ]}/>
      <div className="mf-cards-study__label mf-cards-study__shape-label"><span>Shape</span><small>The finishing touch</small></div>
      <SelectableCards label="Menu shape" name="shape" value={shape} disabled={disabled} onValueChange={next => { setShape(next); setLast(`Caller received shape: ${next}`); }} options={[
        { value:'rounded',label:'Rounded',description:'Gently softened corners.',preview:<ShapePreview radius={8}/> },
        { value:'pill',label:'Pill',description:'A continuous, curved edge.',preview:<ShapePreview radius={17}/> },
        { value:'square',label:'Square',description:'Simple and precise.',preview:<ShapePreview radius={2}/> },
      ]}/>
      <div className="mf-cards-study__selection"><svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.7" stroke="currentColor" strokeWidth="1.2"/><path d="m5.5 8 1.7 1.7 3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg><span>{value && shape ? `${value} background · ${shape} shape` : 'Choose a background and shape'}</span></div>
    </div>
    <div className="mf-cards-study__fixtures"><span>Study fixture · local selection only</span><div><label><input type="checkbox" checked={unlock} onChange={event => setUnlock(event.target.checked)}/> Enable subtle</label><label><input type="checkbox" checked={disabled} onChange={event => setDisabled(event.target.checked)}/> Disable selection</label><button type="button" onClick={() => { setValue(null); setShape(null); setLast('Caller cleared selection'); }}>Clear selection</button></div><output aria-live="polite">{last}</output></div>
  </div></div>;
}
