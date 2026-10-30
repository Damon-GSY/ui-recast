import { useCallback, useState } from 'react';
import { FluidNotch } from '../component/FluidNotch';
import { complete, people, questions } from './fixtures';
import './example.css';

export function App() {
  const params = new URLSearchParams(location.search);
  const [reviewed, setReviewed] = useState(0);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(Number(params.get('width')) || 340);
  const [grain, setGrain] = useState(params.has('grain') ? Number(params.get('grain')) : .22);
  const [dust, setDust] = useState(params.get('dust') !== 'off');
  const [backgroundGrain, setBackgroundGrain] = useState(params.get('background') === 'on');
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [decisions, setDecisions] = useState<string[]>([]);
  const dismiss = useCallback(() => {
    setOpen(false);
    setReviewed(count => Math.min(questions.length, count + 1));
    setDecisions(items => [...items, 'dismiss']);
  }, []);
  const act = (id: string) => {
    setOpen(false);
    if (id === 'restart') { setReviewed(0); setDecisions([]); }
    else { setReviewed(count => Math.min(questions.length, count + 1)); setDecisions(items => [...items, id]); }
  };
  return <main className="example" data-theme={theme}>
    {backgroundGrain && <div className="example-grain" aria-hidden="true" />}
    <FluidNotch label="Launch assistant" card={questions[reviewed] || complete} people={people} morePeople={2} reviewed={reviewed} total={questions.length} open={open} onOpenChange={setOpen} onAction={act} onDismiss={dismiss} width={width} grain={grain} dust={dust} theme={theme} />
    {!params.has('capture') && <details className="example-controls"><summary>Fluid Notch · controls</summary><div className="example-control-grid">
      <label>Card width <input aria-label="Card width" type="range" min="280" max="480" step="10" value={width} onChange={e => setWidth(Number(e.target.value))} /><output>{width}</output></label>
      <label>Grain <input aria-label="Grain" type="range" min="0" max=".5" step=".01" value={grain} onChange={e => setGrain(Number(e.target.value))} /><output>{grain.toFixed(2)}</output></label>
      <label><input type="checkbox" checked={dust} onChange={e => setDust(e.target.checked)} /> Dust</label>
      <label><input type="checkbox" checked={backgroundGrain} onChange={e => setBackgroundGrain(e.target.checked)} /> Grain background</label>
      <label><input type="checkbox" checked={theme === 'dark'} onChange={e => setTheme(e.target.checked ? 'dark' : 'light')} /> Dark</label>
      <button type="button" onClick={() => { setOpen(false); setReviewed(0); setDecisions([]); }}>Replay</button>
    </div><p className="example-decisions" aria-live="polite">{decisions.length ? `Decisions: ${decisions.join(', ')}` : 'Three decisions to review'}</p></details>}
  </main>;
}
