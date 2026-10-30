import { useCallback, useEffect, useState } from 'react';
import { ReadingTabs, type ReadingTabsProps } from '../../components/reading-tabs';
import { SegmentedControl } from '../../components/segmented-control';
import { ReadingWorkspace } from './IntegrationExample';
import './study.css';

function ReadingPanel({ name, onMount }: { name: string; onMount: (name: string) => void }) {
  useEffect(() => { onMount(name); }, [name, onMount]);
  return <article className="reading-study__article" data-reading-content={name}>
    <p className="reading-study__eyebrow">READING ROOM / {name.toUpperCase()}</p>
    <h3>{name === 'Article' ? 'A quieter place to read.' : name === 'Annotations' ? 'Thoughts in the margins.' : 'Follow the evidence.'}</h3>
    <p>{name === 'Article' ? 'Reading a long document takes attention. Move between sections at your own pace, with the words and your notes ready when you return.'
      : name === 'Annotations' ? 'This editor is mounted only after you activate Annotations. Keep visited panels mounted to retain your draft.'
      : 'Sources can host an application’s document list or its own loading boundary.'}</p>
    <label>Notes for {name}<textarea aria-label={`Notes for ${name}`} placeholder="Write a reading note…"/></label>
  </article>;
}

export default function Study() {
  const [value, setValue] = useState('article');
  const [keepMounted, setKeepMounted] = useState(false);
  const [mode, setMode] = useState<ReadingTabsProps['activationMode']>('manual');
  const [variant, setVariant] = useState<ReadingTabsProps['variant']>('buttons');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<string[]>([]);
  const [instance, setInstance] = useState(0);
  const [dark, setDark] = useState(false);
  const [hold, setHold] = useState(false);
  const [density, setDensity] = useState('comfortable');
  const [secondary, setSecondary] = useState('article');
  const mounted = useCallback((name: string) => setCounts(current => ({ ...current, [name]: (current[name] ?? 0) + 1 })), []);
  return <section className="reading-study" data-theme={dark ? 'dark' : 'light'}>
    <header><p className="reading-study__eyebrow">READING TABS · SEMANTIC ADAPTATION</p><h2>Focus first. Open when ready.</h2><p>Arrow keys move focus. Enter or Space opens the panel. Mount counts are observed React effects.</p></header>
    <div className="reading-study__controls">
      <label><input type="checkbox" checked={keepMounted} onChange={e => setKeepMounted(e.target.checked)}/> Keep visited panels</label>
      <label><input type="checkbox" checked={hold} onChange={e => setHold(e.target.checked)}/> Hold controlled selection</label>
      <label>Activation <select aria-label="Activation mode" value={mode} onChange={e => setMode(e.target.value as typeof mode)}><option value="manual">Manual</option><option value="automatic">Automatic</option></select></label>
      <label>Appearance <select aria-label="Tab appearance" value={variant} onChange={e => setVariant(e.target.value as typeof variant)}><option>buttons</option><option>tray</option><option>underline</option></select></label>
      <label><input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)}/> Dark</label>
      <button type="button" onClick={() => { setValue('article'); setCounts({}); setEvents([]); setInstance(n => n + 1); }}>Reset preview</button>
    </div>
    <div className="reading-study__stage" data-capture-root>
      <ReadingTabs key={instance} label="Reading sections" value={value} onValueChange={next => { setEvents(e => [...e, next]); if (!hold) setValue(next); }} activationMode={mode} keepMounted={keepMounted} variant={variant} tabs={[
        { value: 'article', label: 'Article', render: () => <ReadingPanel name="Article" onMount={mounted}/> },
        { value: 'annotations', label: 'Annotations', count: 3, render: () => <ReadingPanel name="Annotations" onMount={mounted}/> },
        { value: 'archived', label: 'Archived', disabled: true, render: () => <p>Unavailable</p> },
        { value: 'sources', label: 'Sources', render: () => <ReadingPanel name="Sources" onMount={mounted}/> },
      ]}/>
    </div>
    <div className="reading-study__metrics"><output aria-label="Panel mount counts">{JSON.stringify(counts)}</output><output aria-label="Selection callbacks">{events.length ? events.join(' → ') : 'No selection callbacks'}</output></div>
    <aside className="reading-study__radio"><span>Independent preference · actual radios</span><SegmentedControl label="Reading density" value={density} onValueChange={setDensity} variant="tray" options={[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]}/></aside>
    <div className="reading-study__secondary"><ReadingWorkspace title="Second reading instance" selectedSection={secondary} onSectionChange={setSecondary}
      renderArticle={() => <p>Separate instance; separate IDs.</p>} renderAnnotations={() => <p>Independent annotation content.</p>} renderSources={() => <p>Independent source content.</p>}/></div>
  </section>;
}
