import { useState } from 'react';
import { NumberTicker } from '../../components/number-ticker';
import './study.css';

export default function Study() {
  const [count, setCount] = useState(24);
  const [query, setQuery] = useState('');
  const [immediate, setImmediate] = useState(false);
  const [instance, setInstance] = useState(0);
  const results = ['Calendar', 'Camera', 'Clipboard', 'Focus', 'Mail', 'Music'].filter(name => name.toLowerCase().includes(query.toLowerCase()));
  return <section className="mf-ticker-study">
    <header><span>MENUFOLD / STUDY FIXTURE</span><h2>A quieter count.</h2><p>Current values appear immediately. Later updates interpolate from the displayed number.</p></header>
    <div className="mf-ticker-study__stage" data-capture-root>
      <div className="mf-ticker-study__panel"><div className="mf-ticker-study__panel-heading"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="4"/><path d="M7 7h6M7 10h6M7 13h3"/></svg><span>Menu bar overview</span><span className="mf-ticker-study__badge">Local fixture</span></div>
        <div className="mf-ticker-study__metric"><span>Managed items</span><NumberTicker key={instance} value={count} immediate={immediate} label="Managed items"/><small>Caller value · {count}</small></div>
        <div className="mf-ticker-study__actions"><button type="button" onClick={() => setCount(38)}>Set 38</button><button type="button" onClick={() => setCount(12)}>Set 12</button><button type="button" onClick={() => setCount(n => n + 1)}>Add one</button><button type="button" onClick={() => setCount(38)}>Repeat 38</button></div>
        <label className="mf-ticker-study__toggle"><input type="checkbox" checked={immediate} onChange={event => setImmediate(event.target.checked)}/> Immediate updates</label>
      </div>
      <div className="mf-ticker-study__search"><label htmlFor="mf-ticker-search">Find menu items</label><input id="mf-ticker-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search items…"/><p><NumberTicker value={results.length} immediate label="Matching items"/> matching items</p><div>{results.length ? results.map(name => <span key={name}>{name}</span>) : <span>No matches</span>}</div></div>
    </div>
    <footer><button type="button" onClick={() => { setCount(24); setQuery(''); setImmediate(false); setInstance(n => n + 1); }}>Reset fixture</button><p>Fixture controls only. No server requests or automatic changes.</p></footer>
  </section>;
}
