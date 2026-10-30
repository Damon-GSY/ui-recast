import { useState } from 'react';
import { BentoGrid, type BentoGridItem } from '../../components/bento-grid';
import './study.css';

function Glyph({ shape }: { shape: 'rules' | 'group' | 'stash' | 'layout' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{shape === 'rules' ? <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#f5f5f5"/><circle cx="15" cy="12" r="2" fill="#f5f5f5"/></> : shape === 'group' ? <><rect x="3" y="5" width="8" height="14" rx="2"/><rect x="14" y="5" width="7" height="6" rx="2"/><rect x="14" y="14" width="7" height="5" rx="2"/></> : shape === 'stash' ? <><path d="m3 10 4-6h10l4 6v10H3zM3 12h6l2 3h2l2-3h6"/></> : <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M10 10v10"/></>}</svg>;
}
function MiniMenu() {
  return <div className="mf-bento-study__menu" aria-hidden="true"><span>MenuFold</span><i/><Glyph shape="rules"/><Glyph shape="group"/><b/><Glyph shape="stash"/><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12a8 8 0 0 1 16 0M7 14a5 5 0 0 1 10 0M10 16a2 2 0 0 1 4 0"/></svg><small>10:24</small></div>;
}
export default function Study() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [event, setEvent] = useState('No fixture action yet');
  const action = (id: string, label: string, disabled = false) => ({ label, disabled, onAction: () => { setSelectedId(id); setEvent(`Study fixture: requested ${id}`); } });
  const items: BentoGridItem[] = [
    { id: 'rules', title: 'A few thoughtful rules', description: 'Small routines that keep your menu bar feeling calm.', icon: <Glyph shape="rules"/>, header: <div className="mf-bento-study__rule-visual" aria-hidden="true"><Glyph shape="rules"/><div><i/><i/><i/></div></div>, action: action('rules','View rules') },
    { id: 'groups', title: 'Everything in its place', description: 'Bring related tools together, ready when you are.', icon: <Glyph shape="group"/>, header: <div className="mf-bento-study__tiles" aria-hidden="true">{['rules','group','stash','layout'].map(shape => <span key={shape}><Glyph shape={shape as 'rules'}/></span>)}</div>, action: action('groups','View groups') },
    { id: 'stash', title: 'Keep something close', description: 'A temporary shelf for files and what you’re working with.', icon: <Glyph shape="stash"/>, header: <div className="mf-bento-study__stash" aria-hidden="true"><Glyph shape="stash"/><span>Ready for now</span></div>, action: action('stash','Open stash') },
    { id: 'layout', title: 'Your menu bar, considered', description: 'A wider preview gives the whole arrangement room to breathe.', columnSpan: 2, icon: <Glyph shape="layout"/>, header: <MiniMenu/>, action: action('layout','Arrange icons') },
    { id: 'sync', title: 'One workspace at a time', description: 'This example keeps unavailable actions visible and disabled.', icon: <Glyph shape="group"/>, header: <div className="mf-bento-study__disabled-visual" aria-hidden="true"><span/><span/><span/></div>, action: action('sync','Sync workspace',true) },
  ];
  return <section className="mf-bento-study">
    <header><span>MENUFOLD / COMPONENT STUDY</span><h2>Room for what matters.</h2><p>Five content-driven modules. A wider space for the arrangement preview.</p></header>
    <div className="mf-bento-study__stage" data-capture-root><div className="mf-bento-study__stage-heading"><span>Workspace</span><small>STUDY FIXTURE</small></div><BentoGrid label="MenuFold workspace modules" items={items} selectedId={selectedId}/></div>
    <footer><output aria-live="polite">{event}</output><button type="button" onClick={() => { setSelectedId(null); setEvent('No fixture action yet'); }}>Clear selection</button></footer>
  </section>;
}
