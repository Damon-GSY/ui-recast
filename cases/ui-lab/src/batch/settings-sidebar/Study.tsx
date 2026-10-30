import { useId, useState, type ReactNode } from 'react';
import { SettingsSidebar, type SettingsSidebarGroup } from '../../components/settings-sidebar';
import './study.css';

// All labels, values, and local responses here are Study fixtures.
const paths: Record<string, ReactNode> = {
  general: <><path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="17" r="2"/></>,
  appearance: <><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9Z"/><path d="M7 10h.01M10 6.5h.01M15 7h.01M17 11h.01" strokeWidth="2.5"/></>,
  'menu-bar': <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M6 7.5h.01M9 7.5h.01"/></>,
  'command-bar': <><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m7 10 2 2-2 2m5 0h5"/></>,
  shortcuts: <><path d="M9 7V5a2 2 0 1 0-2 2h10a2 2 0 1 0-2-2v14a2 2 0 1 0 2-2H7a2 2 0 1 0 2 2V7Z"/></>,
  focus: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/></>,
  workspaces: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  applications: <><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 4v16M4 10h5m5-2h2m-2 4h2m-2 4h2"/></>,
  integrations: <><path d="M8 3v5m8-5v5M6 8h12v4a6 6 0 0 1-12 0V8Zm6 10v3"/></>,
  notifications: <><path d="M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3V9Zm4 11h4"/></>,
  privacy: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>,
  advanced: <><path d="m14 3-3 7H5l5 4-2 7 11-12h-7l2-6Z"/></>,
  updates: <><path d="M19 8a8 8 0 0 0-14-2L3 8m0-5v5h5m-3 8a8 8 0 0 0 14 2l2-2m0 5v-5h-5"/></>,
  license: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18m-14 5h4m4 0h2"/></>,
  about: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></>,
};
function Icon({ name }: { name: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.general}</svg>; }
const sections = [
  { id: 'preferences', label: 'Preferences', items: [['general', 'General'], ['appearance', 'Appearance'], ['menu-bar', 'Menu Bar'], ['command-bar', 'Command Bar'], ['shortcuts', 'Shortcuts']] },
  { id: 'workflow', label: 'Workflow', items: [['focus', 'Focus'], ['workspaces', 'Workspaces'], ['applications', 'Applications'], ['integrations', 'Integrations'], ['notifications', 'Notifications']] },
  { id: 'system', label: 'System', items: [['privacy', 'Privacy'], ['advanced', 'Advanced'], ['updates', 'Updates'], ['license', 'License'], ['about', 'About']] },
];
const descriptions: Record<string, string> = {
  general: 'A few thoughtful defaults for your everyday workspace.', appearance: 'Make MenuFold feel at home on your desktop.', 'menu-bar': 'Keep the things you need close, and the rest out of the way.', 'command-bar': 'A faster path to the things you do most.', shortcuts: 'Make your favorite actions second nature.', focus: 'A little less noise. A little more room to think.', workspaces: 'A place for each kind of work.', applications: 'Choose what belongs in your workspace.', notifications: 'Choose when MenuFold can ask for your attention.', privacy: 'Your workspace, on your terms.', advanced: 'Fine-tune how MenuFold fits into your workflow.', updates: 'Choose how you hear about new releases.', license: 'A home for your plan and license details.', about: 'A quieter menu bar. A clearer head.',
};

export default function Study() {
  const panelId = useId();
  const [value, setValue] = useState('appearance');
  const [theme, setTheme] = useState('Light');
  const [compact, setCompact] = useState(false);
  const [hold, setHold] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const groups: SettingsSidebarGroup[] = sections.map(group => ({ ...group, items: group.items.map(([key, label]) => ({
    value: key, label, icon: <Icon name={key}/>, controls: panelId,
    disabled: key === 'integrations', trailing: key === 'integrations' ? 'Soon' : undefined,
  })) }));
  const title = groups.flatMap(group => group.items).find(item => item.value === value)!.label;
  return <section className="mf-sidebar-study">
    <div className="mf-sidebar-study__stage" data-capture-root>
      <div className="mf-sidebar-study__caption"><span>MENUFOLD</span><span>Settings · Study fixture</span></div>
      <div className="mf-sidebar-study__window">
        <SettingsSidebar groups={groups} value={value} disabled={disabled} onValueChange={next => { setEvents(old => [...old, next]); if (!hold) setValue(next); }}
          header={<div className="mf-sidebar-study__brand"><span className="mf-sidebar-study__mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 7h14M5 12h10M5 17h6" strokeLinecap="round"/></svg></span><div><strong>MenuFold</strong><span>Make room for focus.</span></div></div>}
          footer={<div className="mf-sidebar-study__account"><span>JD</span><div><strong>Jamie Davis</strong><small>Personal workspace</small></div></div>}/>
        <section className="mf-sidebar-study__content" id={panelId} aria-label={`${title} settings`}>
          <div className="mf-sidebar-study__breadcrumb">Settings <span>/</span> {title}</div>
          <header><span className="mf-sidebar-study__heading-icon"><Icon name={value}/></span><h2>{title}</h2><p>{descriptions[value]}</p></header>
          {value === 'appearance' ? <>
            <div className="mf-sidebar-study__row"><div><h3>Color theme</h3><p>A familiar look, in every light.</p></div><select aria-label="Color theme" value={theme} onChange={e => setTheme(e.target.value)}><option>Light</option><option>Dark</option><option>System</option></select></div>
            <div className="mf-sidebar-study__previews">{['Light', 'Dark', 'System'].map(option => <button type="button" key={option} aria-pressed={theme === option} onClick={() => setTheme(option)} className="mf-sidebar-study__theme"><span className="mf-sidebar-study__mini" data-theme={option.toLowerCase()} aria-hidden="true"><span/><span><i/><i/><i/></span></span><span>{option}<span className="mf-sidebar-study__radio"/></span></button>)}</div>
            <div className="mf-sidebar-study__row"><div><h3>Compact spacing</h3><p>Give your workspace a little more breathing room.</p></div><input type="checkbox" aria-label="Compact spacing" checked={compact} onChange={e => setCompact(e.target.checked)}/></div>
            <div className="mf-sidebar-study__sample" data-compact={compact}><span className="mf-sidebar-study__sample-icon"><Icon name="workspaces"/></span><div><strong>Your workspace</strong><span>{compact ? 'Compact preview' : 'Comfortable preview'}</span></div><span className="mf-sidebar-study__sample-dot"/></div>
          </> : <div className="mf-sidebar-study__placeholder"><Icon name={value}/><h3>{title} preview</h3><p>This local Study owns the selected section. Connect this navigation to your settings content.</p><span>Selected: {value}</span></div>}
          <p className="mf-sidebar-study__fixture">Study fixture · local preview only</p>
        </section>
      </div>
    </div>
    <div className="mf-sidebar-study__controls"><label><input type="checkbox" checked={hold} onChange={e => setHold(e.target.checked)}/> Hold controlled selection</label><label><input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)}/> Disable navigation</label><button type="button" onClick={() => { setValue('appearance'); setEvents([]); }}>Reset selection</button><output aria-label="Sidebar selection callbacks">{events.length ? events.join(' → ') : 'No selection callbacks'}</output></div>
  </section>;
}
