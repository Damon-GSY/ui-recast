import { useState } from 'react';
import { ToolCallCard, ToolCallGroup, ToolContent } from '../../components/tool-call-card';
import { ToolCallLog, type ToolCallRecord } from './IntegrationExample';
import './study.css';
import SourceStudy from './SourceStudy';

const fixtures: Record<string, ToolCallRecord> = {
  unknown: { id: 'call-1', name: 'read_document', summary: 'Execution record is incomplete', status: 'unknown', args: { document: 'sample-notes' }, result: { state: 'not-captured' } },
  running: { id: 'call-1', name: 'read_document', summary: 'Reading sample notes', status: 'running', args: { document: 'sample-notes' }, result: { state: 'pending' } },
  success: { id: 'call-1', name: 'read_document', summary: 'Read sample notes', status: 'success', duration: 1420, args: { document: 'sample-notes' }, result: { state: 'captured', value: { title: 'Reading notes', paragraphs: 3 } } },
  missing: { id: 'call-1', name: 'read_document', summary: 'Execution succeeded; payload was not retained', status: 'success', result: { state: 'not-captured' } },
  error: { id: 'call-1', name: 'read_document', status: 'error', error: 'The supplied record reports access denied.', result: { state: 'not-captured' } },
  null: { id: 'call-1', name: 'read_document', status: 'success', result: { state: 'captured', value: null } },
  false: { id: 'call-1', name: 'read_document', status: 'success', result: { state: 'captured', value: false } },
  zero: { id: 'call-1', name: 'read_document', status: 'success', result: { state: 'captured', value: 0 } },
  string: { id: 'call-1', name: 'read_document', status: 'success', result: { state: 'captured', value: '' } },
  empty: { id: 'call-1', name: 'read_document', status: 'success', result: { state: 'empty' } },
  custom: { id: 'call-1', name: 'read_document', summary: 'Content supplied by the reader', status: 'unknown' },
  long: { id: 'call-1', name: 'read_document', status: 'success', result: { state: 'captured', value: Array.from({ length: 18 }, (_, i) => ({ paragraph: i + 1, text: 'A sample paragraph from the reading fixture.' })) } },
};

export default function Study() {
  const [comparison, setComparison] = useState(false);
  const [scenario, setScenario] = useState('unknown');
  const [expandedIds, setExpandedIds] = useState<string[]>(['call-1']);
  const [hold, setHold] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [dark, setDark] = useState(false);
  const [contentClicks, setContentClicks] = useState(0);
  const [copyMode, setCopyMode] = useState('native');
  if (comparison) return <section className="tool-tabs-study"><button type="button" onClick={() => setComparison(false)}>Controlled integration</button><SourceStudy/></section>;
  return <section className="tool-tabs-study" data-theme={dark ? 'dark' : 'light'}>
    <header><p className="tool-tabs-study__eyebrow">TOOL CALL CARD · CONTROLLED INTEGRATION</p><h2>Every result has a provenance.</h2><p>Local fixtures exercise caller-owned records, disclosure and content.</p></header>
    <div className="tool-tabs-study__controls">
      <button type="button" onClick={() => setComparison(true)}>Source fixture</button>
      <label>Fixture <select aria-label="Tool fixture" value={scenario} onChange={e => setScenario(e.target.value)}>{Object.keys(fixtures).map(key => <option key={key}>{key}</option>)}</select></label>
      <label><input type="checkbox" checked={hold} onChange={e => setHold(e.target.checked)}/> Hold controlled expansion</label>
      <label><input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)}/> Dark</label>
      <label>Copy <select aria-label="Copy adapter" value={copyMode} onChange={e => setCopyMode(e.target.value)}><option value="native">Clipboard</option><option value="adapter">Caller callback</option><option value="reject">Rejected callback</option></select></label>
      <button type="button" onClick={() => { setScenario('unknown'); setExpandedIds(['call-1']); setEvents([]); setHold(false); }}>Reset preview</button>
    </div>
    <div className="tool-tabs-study__stage" data-capture-root>
      <ToolCallLog calls={[fixtures[scenario]]} expandedIds={expandedIds} onExpandedChange={(id, open) => {
        setEvents(e => [...e, `open:${id}:${open}`]);
        if (!hold) setExpandedIds(open ? [id] : []);
      }} onCopy={copyMode === 'native' ? undefined : async (text, section) => {
        if (copyMode === 'reject') throw new Error('Fixture rejects copy');
        setEvents(e => [...e, `copy:${section}:${text}`]);
      }} renderToolContent={scenario !== 'custom' ? undefined : () => <ToolContent title="ToolContent · supplied React children">
        <article className="tool-tabs-study__custom"><h3>Reading notes</h3><p>This article remains ordinary React content.</p>
          <table><tbody><tr><th>Sections</th><td>3</td></tr><tr><th>Format</th><td>Annotated text</td></tr></tbody></table>
          <button type="button" onClick={() => setContentClicks(n => n + 1)}>Inspect content</button><output aria-label="Content callback count">{contentClicks}</output>
        </article>
      </ToolContent>}/>
      <ToolCallGroup label="Related records" defaultOpen={false}>
        <ToolCallCard name="unclassified_record" summary="No status was supplied"/>
      </ToolCallGroup>
    </div>
    <output className="tool-tabs-study__events" aria-label="Callback events">{events.length ? events.join('\n') : 'No callbacks yet'}</output>
  </section>;
}
