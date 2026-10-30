import { useEffect, useRef, useState } from 'react';
import { SegmentedControl } from './components/segmented-control';

function Icon({ type }: { type: 'list' | 'board' | 'calendar' }) {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    {type === 'list' ? <><path d="M6 4h7M6 8h7M6 12h7"/><path d="M3 4h.01M3 8h.01M3 12h.01"/></>
      : type === 'board' ? <><rect x="2.5" y="2.5" width="4" height="11" rx="1"/><rect x="9.5" y="2.5" width="4" height="7" rx="1"/></>
      : <><rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M5 2v3m6-3v3M3 7h10"/></>}
  </svg>;
}

const dashboardOptions = [
  { value: 'overview', label: 'Overview' }, { value: 'analytics', label: 'Analytics' },
  { value: 'reports', label: 'Reports' }, { value: 'notifications', label: 'Notifications', count: 3 },
];
const layoutOptions = [
  { value: 'list', label: 'List', icon: <Icon type="list"/> },
  { value: 'board', label: 'Board', icon: <Icon type="board"/> },
  { value: 'calendar', label: 'Calendar', icon: <Icon type="calendar"/> },
];
const billingOptions = [{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly', badge: 'Save 20%' }];
const initial = { dashboard: 'overview', layout: 'board', billing: 'yearly' };

export function App() {
  const [selection, setSelection] = useState(initial);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [appearance, setAppearance] = useState<'clean' | 'classic'>('clean');
  const [narrow, setNarrow] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function reset() {
    stop(); setPlaying(false); setSelection(initial);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  }
  async function replay() {
    reset(); setPlaying(true);
    const video = videoRef.current;
    if (video) {
      try { await video.play(); } catch { setPlaying(false); return; }
    }
    const sequence: [number, Partial<typeof initial>][] = [
      [700, { dashboard: 'analytics' }], [1600, { dashboard: 'notifications' }],
      [2500, { dashboard: 'reports' }], [3400, { layout: 'calendar' }], [4300, { billing: 'monthly' }],
    ];
    sequence.forEach(([time, change]) => timers.current.push(setTimeout(() => setSelection(current => ({ ...current, ...change })), time)));
    timers.current.push(setTimeout(() => setPlaying(false), 5300));
  }
  const update = (key: keyof typeof initial, value: string) => { stop(); setPlaying(false); videoRef.current?.pause(); setSelection(s => ({ ...s, [key]: value })); };
  const code = `<SegmentedControl\n  label="Layout"\n  variant="tray"\n  size="sm"\n  options={options}\n  value={layout}\n  onValueChange={setLayout}\n/>`;

  return <div className="site-shell">
    <header className="site-header"><a href="#" className="wordmark"><span className="mark" aria-hidden="true"><i/><i/><i/></span>Component studies</a><span className="edition">NO. 001 <span>／</span> AFFECTUI</span></header>
    <main>
      <section className="intro">
        <p className="eyebrow"><span/> OBSERVE → REBUILD → COMPARE</p>
        <h1>Small control.<br/><span>Every detail matters.</span></h1>
        <div className="intro-bottom"><p>从一段真实交互，复刻一个可复用组件。<br/>Segmented Control 的三种形态，一套状态与运动规则。</p><a className="source-link" href="https://www.affectui.com/components/segmented-control" target="_blank" rel="noreferrer">查看 AffectUI 原版 ↗</a></div>
      </section>

      <section className={`comparison comparison--${appearance}`} aria-label="原版与复刻对照">
        <div className="comparison-toolbar"><div><span className="section-label">01 / THE COMPARISON</span><h2>看原版，也亲手试试。</h2></div><div className="transport"><button className="icon-button" onClick={reset} aria-label="重置预览" title="重置">↺</button><button className="play-button" onClick={replay} disabled={playing}><span aria-hidden="true">▶</span>{playing ? '正在回放' : '播放同一操作'}</button></div></div>
        <div className="comparison-grid">
          <article className="preview-panel"><div className="panel-heading"><span><i className="status-dot original"/>原版采集</span><span className="panel-meta">AffectUI · {appearance === 'clean' ? 'Clean' : 'Classic'} / Light</span></div><div className="reference-stage"><video key={appearance} ref={videoRef} src={appearance === 'clean' ? '/evidence/reference/interaction.mp4' : '/evidence/segmented-control/reference/classic/interaction.mp4'} poster={appearance === 'clean' ? '/evidence/reference/default.jpg' : '/evidence/segmented-control/reference/classic-light.jpg'} muted playsInline preload="auto" aria-label="AffectUI 原版交互采集"/></div><div className="panel-caption"><span>真实浏览器画面</span><span>浏览器连续采样 · 真实时间戳</span></div></article>
          <article className="preview-panel" data-theme={theme}><div className="panel-heading"><span><i className="status-dot"/>复刻 · 可交互</span><button className="theme-button" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="切换复刻主题">{theme === 'light' ? '◐ Dark' : '◑ Light'}</button></div>
            <div className={`replica-stage ${narrow ? 'is-narrow' : ''}`}><div className="demo-card" data-appearance={appearance} data-testid="replica-card">
              <div className="demo-row"><div className="demo-label">Dashboard</div><SegmentedControl appearance={appearance} label="Dashboard" options={dashboardOptions} value={selection.dashboard} onValueChange={v => update('dashboard', v)} disabled={disabled} reduceMotion={reduceMotion}/></div>
              <div className="demo-row"><div className="demo-label">Layout</div><SegmentedControl appearance={appearance} label="Layout" options={layoutOptions} variant="tray" size="sm" value={selection.layout} onValueChange={v => update('layout', v)} disabled={disabled} reduceMotion={reduceMotion}/></div>
              <div className="demo-row"><div className="demo-label">Billing</div><SegmentedControl appearance={appearance} label="Billing" options={billingOptions} variant="underline" value={selection.billing} onValueChange={v => update('billing', v)} disabled={disabled} reduceMotion={reduceMotion}/></div>
            </div></div>
            <div className="panel-caption"><span>点击 · 拖动 · 方向键</span><span>{selection.dashboard} / {selection.layout}</span></div>
          </article>
        </div>
        <div className="options-bar"><p><span className="live-dot"/>在右侧试试快速切换，或拖动选中项。</p><div className="toggles"><label><input type="checkbox" checked={appearance === 'classic'} onChange={e => { reset(); setAppearance(e.target.checked ? 'classic' : 'clean'); }}/>Classic</label><label><input type="checkbox" checked={narrow} onChange={e => setNarrow(e.target.checked)}/>窄容器</label><label><input type="checkbox" checked={reduceMotion} onChange={e => setReduceMotion(e.target.checked)}/>减少动态</label><label><input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)}/>禁用</label></div></div>
      </section>

      <section className="observations" aria-label="复刻要点"><article><span className="note-number">01</span><h3>状态，先于像素。</h3><p>独立按钮、托盘、下划线。三种视觉语言，共享单选状态与键盘操作。</p></article><article><span className="note-number">02</span><h3>两条边，各有节奏。</h3><p>前缘先行，后缘跟随。{appearance === 'classic' ? '270 / 400' : '160 / 220'} ms 的时间差，让指示器轻微伸展后归位。</p></article><article><span className="note-number">03</span><h3>交付可编辑的源码。</h3><p>Motion 管运动，Radix 管交互。两个组件文件，可以带到下一个项目。</p></article></section>

      <section className="source-section"><div><span className="section-label">02 / TAKE IT WITH YOU</span><h2>一个组件，直接带走。</h2><p>React + TypeScript · 三种变体 · 明暗主题<br/>受控状态 · 鼠标拖选 · 键盘导航 · 减少动态</p><a className="download-link" href="/r/segmented-control.json" download>↓ 下载 Registry 源码包</a><a className="text-link" href="/evidence/reference/visual-analysis.md" target="_blank">查看模型视觉分析 ↗</a></div><div className="code-card"><div className="code-heading"><span>usage.tsx</span><button onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); }}> {copied ? '已复制' : '复制'}</button></div><pre><code>{code}</code></pre></div></section>
    </main>
    <footer><span>COMPONENT STUDIES <span className="footer-divider">/</span> 001</span><p>视觉参考 AffectUI · 独立实现 · 2026</p><a href="/evidence/reference/interaction.mp4" target="_blank">打开原版录屏 ↗</a></footer>
  </div>;
}
