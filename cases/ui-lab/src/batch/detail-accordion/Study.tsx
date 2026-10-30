import { useState } from 'react';
import { DetailAccordion } from '../../components/detail-accordion';
import './study.css';

function Mark({ appearance = false }: { appearance?: boolean }) {
  return <svg viewBox="0 0 20 20" fill="none">{appearance ? <><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4"/><path d="M3 8h14M8 8v9" stroke="currentColor" strokeWidth="1.4"/></> : <><path d="M4 6h12M4 14h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="6" r="2" fill="#f5f5f5" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="14" r="2" fill="#f5f5f5" stroke="currentColor" strokeWidth="1.4"/></>}</svg>;
}
export default function Study() {
  const [open, setOpen] = useState<string[]>([]);
  const [delay, setDelay] = useState('3');
  const [notice, setNotice] = useState(true);
  const [error, setError] = useState(false);
  const [launch, setLaunch] = useState(true);
  const [labels, setLabels] = useState(false);
  return <div className="mf-detail-study"><div className="mf-detail-study__stage" data-capture-root>
    <header><span>MENUFOLD / PREFERENCES</span><h2>Quietly, your way.</h2><p>The everyday settings, with a little more when you need it.</p></header>
    <div className="mf-detail-study__settings">
      <section aria-label="Common settings" className="mf-detail-study__common"><label><span>Menu name<small>Shown in your menu bar</small></span><input aria-label="Menu name" defaultValue="Personal"/></label><label><span>Launch at login<small>Ready when you are</small></span><input type="checkbox" checked={launch} onChange={event => setLaunch(event.target.checked)}/></label></section>
      <DetailAccordion label="Additional settings" openItems={open} onOpenChange={setOpen} items={[
        { id: 'behavior', title: 'Advanced behavior', summary: `Hide after ${delay || '—'} seconds · ${labels ? 'Labels visible' : 'Icons only'}`, icon: <Mark/>,
          notice: <>{notice && <p>Study permission fixture: allow Accessibility in System Settings to hide menu bar items.</p>}{error && <p role="alert">Study validation fixture: the hide delay must be between 1 and 30 seconds.</p>}</>,
          children: <div className="mf-detail-study__fields"><label><span>Hide delay<small>Seconds before unused items fold away</small></span><input type="number" min="1" max="30" aria-label="Hide delay" value={delay} aria-invalid={error} onChange={event => setDelay(event.target.value)}/></label><label><span>Show item labels<small>Keep a little more context</small></span><input type="checkbox" checked={labels} onChange={event => setLabels(event.target.checked)}/></label></div> },
        { id: 'appearance', title: 'Appearance details', summary: 'Follow system · Soft corners', icon: <Mark appearance/>, children: <div className="mf-detail-study__fields"><label><span>Color preference</span><select aria-label="Color preference" defaultValue="System"><option>System</option><option>Light</option><option>Dark</option></select></label><p className="mf-detail-study__hint">These are local Study preferences. No system setting is changed.</p></div> },
        { id: 'managed', title: 'Workspace policy', summary: 'Managed by your organization', disabled: true, children: <p>Managed settings</p> },
      ].map(item => item.id === 'behavior' && !notice && !error ? { ...item, notice: undefined } : item)}/>
      <div className="mf-detail-study__neighbor"><span className="mf-detail-study__dot"/> Preferences stay on this page.</div>
    </div>
    <div className="mf-detail-study__fixtures"><span>Study fixtures · no permissions requested</span><div><label><input type="checkbox" checked={notice} onChange={event => setNotice(event.target.checked)}/> Permission message</label><label><input type="checkbox" checked={error} onChange={event => setError(event.target.checked)}/> Validation error</label><button type="button" onClick={() => setOpen([])}>Close all</button></div></div>
  </div></div>;
}
