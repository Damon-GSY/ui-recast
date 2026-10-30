import { useState, type ReactNode } from 'react';
import { InstantTabs } from '../../components/instant-tabs';
import './study.css';

function Icon({ kind }: { kind: string }) {
  const paths: Record<string, ReactNode> = {
    menu: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 7.5h.01M10 7.5h.01"/></>,
    command: <><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m7 10 2 2-2 2m5 0h4"/></>,
    sidebar: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16m-3-11h.01M6 12h.01M6 15h.01"/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-7l1-7Z"/>,
    folder: <path d="M3 8V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    settings: <><path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="17" r="2"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[kind] ?? paths.grid}</svg>;
}
const rows: Record<string, { name: string; hint: string; icon: string }[]> = {
  all: [{ name: 'Open workspace', hint: 'Action', icon: 'folder' }, { name: 'Notes', hint: 'Application', icon: 'grid' }, { name: 'Appearance', hint: 'Settings', icon: 'settings' }],
  applications: [{ name: 'Notes', hint: 'Application', icon: 'grid' }, { name: 'Calendar', hint: 'Application', icon: 'grid' }, { name: 'Browser', hint: 'Application', icon: 'grid' }],
  actions: [{ name: 'Open workspace', hint: 'Action', icon: 'folder' }, { name: 'Start focus session', hint: 'Action', icon: 'bolt' }, { name: 'Show menu bar', hint: 'Action', icon: 'menu' }],
  files: [], settings: [{ name: 'Appearance', hint: 'Settings', icon: 'settings' }, { name: 'Command Bar', hint: 'Settings', icon: 'command' }],
};

export default function Study() {
  const [scope, setScope] = useState('menu-bar');
  const [category, setCategory] = useState('all');
  const [hold, setHold] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [previewEvent, setPreviewEvent] = useState('');
  const changeScope = (next: string) => { setEvents(old => [...old, `scope:${next}`]); if (!hold) setScope(next); };
  const changeCategory = (next: string) => { setEvents(old => [...old, `category:${next}`]); if (!hold) setCategory(next); };
  function preview(kind: string, title: string, description: string) {
    return <div className="mf-tabs-study__scope-panel" data-preview={kind}>
      <div><h3>{title}</h3><p>{description}</p></div>
      <div className="mf-tabs-study__desktop" data-scope={kind} aria-label={`${title} sample`}>
        <div className="mf-tabs-study__desktop-bar"><span>MenuFold</span><span>File</span><span>View</span><span className="mf-tabs-study__desktop-spacer"/><Icon kind="menu"/><span>9:41</span></div>
        {kind === 'menu-bar' ? <div className="mf-tabs-study__menu-popover"><span>YOUR WORKSPACE</span><div><Icon kind="folder"/>Design studio</div><div><Icon kind="bolt"/>Focus time</div><div><Icon kind="settings"/>Preferences</div></div>
          : kind === 'command-bar' ? <div className="mf-tabs-study__command-preview"><div><Icon kind="search"/><span>What would you like to do?</span><kbd>esc</kbd></div><p><Icon kind="folder"/>Open workspace <kbd>↵</kbd></p><p><Icon kind="bolt"/>Start focus session</p></div>
          : <div className="mf-tabs-study__sidebar-preview"><div><strong>Settings</strong><span>General</span><span>Appearance</span><span>Command Bar</span></div><div><i/><i/><i/></div></div>}
        <span className="mf-tabs-study__desktop-label">{title} preview</span>
      </div>
    </div>;
  }
  function results(key: string) {
    return <div className="mf-tabs-study__results" data-results={key}>
      {rows[key].map((row, index) => <button type="button" key={row.name} onClick={() => setPreviewEvent(`Study fixture selected: ${row.name}`)}><span className="mf-tabs-study__result-icon"><Icon kind={row.icon}/></span><span><strong>{row.name}</strong><small>{row.hint}</small></span><kbd>{index === 0 ? '↵' : `⌘ ${index + 1}`}</kbd></button>)}
      {!rows[key].length && <p>No file fixture is connected.</p>}
    </div>;
  }
  return <section className="mf-tabs-study">
    <div className="mf-tabs-study__stage" data-capture-root>
      <div className="mf-tabs-study__caption"><span>MENUFOLD</span><span>Instant Tabs · Study fixture</span></div>
      <article className="mf-tabs-study__card">
        <header><span className="mf-tabs-study__eyebrow">PERSONALIZE YOUR SPACE</span><h2>Small details. Your way.</h2><p>A familiar workspace, wherever you are.</p></header>
        <section className="mf-tabs-study__appearance"><div className="mf-tabs-study__section-title"><h3>Appearance</h3><span>Choose a preview</span></div>
          <InstantTabs label="Appearance scopes" value={scope} onValueChange={changeScope} disabled={disabled} minPanelHeight={278} tabs={[
            { value: 'menu-bar', label: 'Menu Bar', icon: <Icon kind="menu"/>, content: preview('menu-bar', 'Menu Bar', 'Just the essentials, always within reach.') },
            { value: 'command-bar', label: 'Command Bar', icon: <Icon kind="command"/>, content: preview('command-bar', 'Command Bar', 'Your next action is a keystroke away.') },
            { value: 'sidebar', label: 'Sidebar', icon: <Icon kind="sidebar"/>, content: preview('sidebar', 'Sidebar', 'A little structure for the way you work.') },
          ]}/>
        </section>
        <section className="mf-tabs-study__command"><div className="mf-tabs-study__section-title"><h3>Command Bar</h3><span>Browse categories</span></div>
          <InstantTabs label="Command Bar categories" value={category} onValueChange={changeCategory} disabled={disabled} minPanelHeight={220} tabs={[
            { value: 'all', label: 'All', content: results('all') },
            { value: 'applications', label: 'Applications', content: results('applications') },
            { value: 'actions', label: 'Actions', content: results('actions') },
            { value: 'files', label: 'Files', disabled: true, content: results('files') },
            { value: 'settings', label: 'Settings', content: results('settings') },
          ]}/>
          <output className="mf-tabs-study__preview-event" aria-live="polite">{previewEvent || 'Study fixture · local preview only'}</output>
        </section>
      </article>
    </div>
    <div className="mf-tabs-study__controls"><label><input type="checkbox" checked={hold} onChange={e => setHold(e.target.checked)}/> Hold controlled selection</label><label><input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)}/> Disable tabs</label><button type="button" onClick={() => { setScope('menu-bar'); setCategory('all'); setEvents([]); setPreviewEvent(''); }}>Reset selection</button><output aria-label="Tab selection callbacks">{events.length ? events.join(' → ') : 'No selection callbacks'}</output></div>
  </section>;
}
