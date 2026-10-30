import {useEffect, useRef, useState, type FormEvent} from 'react';
import {AgentInbox, type AgentInboxAction, type AgentTask, type AgentTaskPresentation} from '../../components/agent-inbox';
import {Combobox, type ComboboxOption} from '../../components/combobox';
import {IntegrationSettings} from '../../components/integration-settings';
import './study.css';

// These are local caller fixtures, not a service discovery response.
const initialModels: ComboboxOption[] = [
  {value: 'gpt-6.1-sol', label: 'GPT-6.1 Sol'},
  {value: 'gpt-6-astra', label: 'GPT-6 Astra'},
];
const initialTasks: AgentTask[] = [
  {id: 'outline', title: 'Review the outline', description: 'A local approval fixture. Actions emit a request to this page.', agent: 'Review fixture', status: 'waiting'},
  {id: 'retry', title: 'Retry the draft', description: 'A failed fixture with an explicit retry callback.', agent: 'Draft fixture', status: 'failed'},
  {id: 'queue', title: 'Prepare a second draft', agent: 'Queue fixture', status: 'queued'},
  {id: 'paused', title: 'Paused by the caller', agent: 'Paused fixture', status: 'paused'},
  {id: 'unknown', title: 'Unmapped caller status', agent: 'External fixture', status: 'awaiting_capacity'},
];
const taskPresentation: Record<string, AgentTaskPresentation> = {
  queued: {label: 'Queued', lane: 'other', tone: 'neutral', actions: ['open']},
  paused: {label: 'Paused', lane: 'other', tone: 'warning', actions: ['open']},
};
type SecretEdit = {mode: 'unchanged'} | {mode: 'replace'; value: string} | {mode: 'remove'};
type Config = {id: string; name: string; enabled: boolean; settingsText: string; hasSecret: boolean; secret: SecretEdit};
type ConfigPayload = {id: string; name: string; enabled: boolean; settings: Record<string, unknown>; secret?: string | null};
const initialConfig: Config[] = [
  {id: 'harness-local', name: 'Harness', enabled: true, settingsText: '{\n  "example": true\n}', hasSecret: true, secret: {mode: 'unchanged'}},
  {id: 'plugin-local', name: 'Plugin', enabled: false, settingsText: '{\n  "example": "plugin"\n}', hasSecret: false, secret: {mode: 'unchanged'}},
];
function validateConfig(rows: Config[]): string | undefined {
  for (const row of rows) {
    if (!row.name.trim()) return `${row.id}: enter a name.`;
    try {
      const settings: unknown = JSON.parse(row.settingsText);
      if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return `${row.name}: settings must be a JSON object.`;
    } catch { return `${row.name}: enter valid JSON.`; }
    if (row.secret.mode === 'replace' && !row.secret.value.trim()) return `${row.name}: enter a replacement secret or keep the current value.`;
  }
}
function payloadFor(rows: Config[]): ConfigPayload[] {
  return rows.map(row => ({id: row.id, name: row.name, enabled: row.enabled, settings: JSON.parse(row.settingsText), ...(row.secret.mode === 'unchanged' ? {} : {secret: row.secret.mode === 'remove' ? null : row.secret.value})}));
}

/** The example receives model options and selection from its parent; custom entry is a separate callback. */
export function WorkbenchModelAdapter({options, value, onChange, pending, disabled, error, onCustomModel}: {
  options: ComboboxOption[]; value: string[]; onChange?: (value: string[]) => void;
  pending?: boolean; disabled?: boolean; error?: string; onCustomModel?: (id: string) => void;
}) {
  const [custom, setCustom] = useState('');
  function submit(event: FormEvent) {event.preventDefault(); if (custom.trim() && onCustomModel && !pending && !disabled) {onCustomModel(custom.trim()); setCustom('');}}
  return <>
    <Combobox label="Model" placeholder="Choose a model…" options={options} value={value} onChange={onChange} multiple={false} creatable={false} pending={pending} disabled={disabled} error={error} emptyText="No models provided"/>
    <form className="task-workbench__custom" onSubmit={submit}>
      <label>Custom model ID<input value={custom} onChange={event => setCustom(event.target.value)} placeholder="Provider model ID" disabled={pending || disabled || !onCustomModel}/></label>
      <button type="submit" disabled={!custom.trim() || pending || disabled || !onCustomModel}>Use custom model</button>
    </form>
  </>;
}

export default function Study() {
  const [tasks, setTasks] = useState(initialTasks);
  const [events, setEvents] = useState<string[]>([]);
  const [callbacks, setCallbacks] = useState(true);
  const [taskPending, setTaskPending] = useState(false);
  const [models, setModels] = useState(initialModels);
  const [selected, setSelected] = useState<string[]>([]);
  const [modelState, setModelState] = useState('ready');
  const [baseline, setBaseline] = useState(initialConfig);
  const [draft, setDraft] = useState(initialConfig);
  const [activeId, setActiveId] = useState(initialConfig[0].id);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [failNext, setFailNext] = useState(true);
  const [payload, setPayload] = useState<ConfigPayload[] | null>(null);
  const [saveStatus, setSaveStatus] = useState('No save submitted');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const log = (message: string) => setEvents(old => [...old.slice(-5), message]);
  const active = draft.find(row => row.id === activeId)!;
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const validationError = validateConfig(draft);
  const patch = (patch: Partial<Config>) => {setDraft(rows => rows.map(row => row.id === activeId ? {...row, ...patch} : row)); setSaveError(undefined);};
  const move = (direction: number) => setDraft(rows => {
    const next = [...rows], index = next.findIndex(row => row.id === activeId), destination = index + direction;
    if (destination < 0 || destination >= rows.length) return rows;
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  });
  const action = (kind: AgentInboxAction, task: AgentTask) => log(`${kind}: ${task.id} · caller status remains ${task.status}`);
  function save() {
    if (pending || !dirty || validationError) return;
    const snapshot = draft;
    setPayload(payloadFor(snapshot)); setPending(true); setSaveError(undefined); setSaveStatus('Waiting for the local fixture response');
    // The asynchronous response exists only in this Study. No backend is called.
    timer.current = setTimeout(() => {
      setPending(false);
      if (failNext) {setSaveError('Local fixture rejected this save. Your draft is retained.'); setFailNext(false); setSaveStatus('Fixture rejected'); return;}
      const accepted = snapshot.map(row => ({...row, hasSecret: row.secret.mode === 'unchanged' ? row.hasSecret : row.secret.mode === 'replace', secret: {mode: 'unchanged'} as SecretEdit}));
      setBaseline(accepted); setDraft(accepted); setSaveStatus('Fixture accepted in memory');
    }, 750);
  }
  return <div className="task-workbench">
    <header className="task-workbench__header"><span>LOCAL INTEGRATION STUDY</span><h1>Task workbench</h1><p>Caller-owned tasks, model choices, and configuration. This page uses in-memory fixtures.</p>
      <nav aria-label="Component source"><a href="/r/agent-inbox.json">AgentInbox source</a><a href="/r/combobox.json">Combobox source</a><a href="/r/integration-settings.json">IntegrationSettings source</a></nav>
    </header>
    <div className="task-workbench__grid">
      <div className="task-workbench__column">
        <section className="task-workbench__panel" aria-label="Model adapter"><div className="task-workbench__panel-title"><h2>Model selection</h2><label>Options state<select value={modelState} onChange={event => setModelState(event.target.value)}><option value="ready">Ready</option><option value="pending">Pending</option><option value="disabled">Disabled</option><option value="empty">Empty</option><option value="error">Error</option></select></label></div>
          <WorkbenchModelAdapter options={modelState === 'empty' ? [] : models} value={selected} onChange={value => {setSelected(value); log(`model: ${value[0] ?? 'none'}`);}} pending={modelState === 'pending'} disabled={modelState === 'disabled'} error={modelState === 'error' ? 'Local fixture: model options could not be loaded.' : undefined} onCustomModel={id => {setModels(old => old.some(model => model.value === id) ? old : [...old, {value: id, label: id}]); setSelected([id]); log(`custom model: ${id}`);}}/>
          <output aria-label="Selected model">{selected[0] ?? 'No model selected'}</output>
        </section>
        <section className="task-workbench__panel" aria-label="Task adapter">
          <AgentInbox tasks={tasks} title="Task workbench" statusPresentation={taskPresentation} onAction={callbacks ? action : undefined} pendingTaskIds={taskPending ? ['outline', 'retry'] : []}/>
          <details className="task-workbench__fixture"><summary>Task fixture controls</summary><label><input type="checkbox" checked={callbacks} onChange={event => setCallbacks(event.target.checked)}/>Action callbacks connected</label><label><input type="checkbox" checked={taskPending} onChange={event => setTaskPending(event.target.checked)}/>Actions pending</label><button type="button" onClick={() => setTasks(rows => rows.map(row => row.id === 'outline' ? {...row, status: 'running'} : row))}>Parent sets outline running</button><button type="button" onClick={() => setTasks(initialTasks)}>Restore task fixtures</button></details>
        </section>
      </div>
      <div className="task-workbench__column">
        <IntegrationSettings name="Harness & plugins" meta="Caller-provided fields · local fixture" dirty={dirty} pending={pending} validationError={validationError} saveError={saveError} onSave={save} onDiscard={() => {setDraft(baseline); setSaveError(undefined); setSaveStatus('Draft discarded');}}>
          <div className="task-workbench__config-list" role="group" aria-label="Configuration order">{draft.map((row, index) => <button key={row.id} type="button" aria-pressed={row.id === activeId} onClick={() => setActiveId(row.id)}><span>{index + 1}</span>{row.name}<small>{row.id}</small></button>)}</div>
          <div className="task-workbench__order"><span>Stable ID: <code data-testid="active-id">{active.id}</code></span><button type="button" disabled={activeId === draft[0].id} onClick={() => move(-1)}>Move up</button><button type="button" disabled={activeId === draft.at(-1)?.id} onClick={() => move(1)}>Move down</button></div>
          <label className="task-workbench__field">Display name<input value={active.name} onChange={event => patch({name: event.target.value})}/></label>
          <label className="task-workbench__checkbox"><input type="checkbox" checked={active.enabled} onChange={event => patch({enabled: event.target.checked})}/>Enabled</label>
          <label className="task-workbench__field">Settings JSON<textarea rows={5} spellCheck={false} value={active.settingsText} onChange={event => patch({settingsText: event.target.value})} aria-invalid={!!validationError} aria-describedby="task-workbench-json-help"/></label>
          <p id="task-workbench-json-help" className="task-workbench__hint">The fixture accepts a JSON object. Field names and schema belong to the caller.</p>
          <label className="task-workbench__field">Secret update<select value={active.secret.mode} onChange={event => patch({secret: event.target.value === 'replace' ? {mode: 'replace', value: ''} : {mode: event.target.value as 'unchanged' | 'remove'}})}><option value="unchanged">Keep unchanged</option><option value="replace">Replace secret</option><option value="remove">Remove secret</option></select></label>
          {active.secret.mode === 'replace' ? <label className="task-workbench__field">Replacement secret<input type="password" autoComplete="new-password" value={active.secret.value} onChange={event => patch({secret: {mode: 'replace', value: event.target.value}})}/></label> : <p className="task-workbench__secret" data-testid="secret-state">{active.secret.mode === 'remove' ? 'Removal requested' : active.hasSecret ? '•••••••• · stored secret unchanged' : 'No stored secret'}</p>}
        </IntegrationSettings>
        <aside className="task-workbench__panel task-workbench__fixture" aria-label="Save fixture"><label><input type="checkbox" checked={failNext} disabled={pending} onChange={event => setFailNext(event.target.checked)}/>Reject next save (local fixture)</label><output aria-live="polite">{saveStatus}</output><details open={!!payload}><summary>Last submitted payload</summary><pre data-testid="payload">{payload ? JSON.stringify(payload.map(row => ({...row, ...('secret' in row ? {secret: row.secret === null ? null : '[replacement supplied]'} : {})})), null, 2) : 'No payload yet'}</pre></details></aside>
        <aside className="task-workbench__panel" aria-label="Callback events"><h2>Callback events</h2><ol className="task-workbench__events" aria-live="polite">{events.map((event, index) => <li key={index}>{event}</li>)}</ol>{!events.length && <p className="task-workbench__hint">Choose a model or request a task action.</p>}</aside>
      </div>
    </div>
  </div>;
}
