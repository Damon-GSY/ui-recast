'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import '@fontsource-variable/inter';
import { ThinkingLoader, type ThinkingLoaderProps } from '../components/thinking-loader';
import './ThinkingLoaderStudy.css';

type Appearance = NonNullable<ThinkingLoaderProps['appearance']>;
type StudyMode = 'live' | 'interactive' | 'recordings';
const lifecyclePhases = ['Thinking', 'Searching the web', 'Reading 12 sources', 'Comparing pricing', 'Writing response'];
const cycleMs = 12600;
const videoStart = 0.08;
const initialDemo = { phase: 0, done: false };

export function ThinkingLoaderStudy() {
  const id = useId();
  const [appearance, setAppearance] = useState<Appearance>(() =>
    new URLSearchParams(window.location.search).get('capture') === 'classic' ? 'classic' : 'clean');
  const [mode, setMode] = useState<StudyMode>('live');
  const [replay, setReplay] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [demo, setDemo] = useState(initialDemo);
  const referenceVideo = useRef<HTMLVideoElement>(null);
  const replicaVideo = useRef<HTMLVideoElement>(null);
  const [referenceReady, setReferenceReady] = useState(false);
  const [replicaReady, setReplicaReady] = useState(false);
  const [referenceError, setReferenceError] = useState(false);
  const [replicaError, setReplicaError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [detail, setDetail] = useState(false);
  const [playbackMessage, setPlaybackMessage] = useState('');
  const [phaseText, setPhaseText] = useState(lifecyclePhases.join('\n'));
  const phases = useMemo(() => phaseText.split('\n').map(text => text.trim()).filter(Boolean), [phaseText]);
  const labels = phases.length ? phases : ['Thinking'];
  const [phase, setPhase] = useState<number | undefined>();
  const [interval, setInterval] = useState(2000);
  const [loop, setLoop] = useState(false);
  const [done, setDone] = useState(false);
  const [doneText, setDoneText] = useState('Done');
  const [elapsedLabel, setElapsedLabel] = useState(false);
  const [size, setSize] = useState<ThinkingLoaderProps['size']>('md');
  const [variant, setVariant] = useState<ThinkingLoaderProps['variant']>('pill');
  const [dark, setDark] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [inlineDone, setInlineDone] = useState(false);
  const selectedPhase = phase === undefined ? undefined : Math.min(phase, labels.length - 1);
  const interactive = mode === 'interactive';
  const videoBase = '/evidence/thinking-loader/motion-study';
  const videoFile = detail ? 'detail.webm' : 'lifecycle.webm';
  const referenceSource = `${videoBase}/reference/${appearance}/${videoFile}`;
  const replicaSource = `${videoBase}/replica/${appearance}/${videoFile}`;

  function replayFullProcess() {
    setPlaybackMessage('');
    setDemo(initialDemo);
    setMode('live');
    setReplay(value => value + 1);
  }

  function changeView(nextMode: StudyMode, nextAppearance = appearance) {
    referenceVideo.current?.pause();
    replicaVideo.current?.pause();
    setReferenceReady(false);
    setReplicaReady(false);
    setReferenceError(false);
    setReplicaError(false);
    setPlaybackMessage('');
    setPlaying(false);
    setDemo(initialDemo);
    setMode(nextMode);
    setAppearance(nextAppearance);
  }

  // The study owns simulated work and completion; the component only renders props.
  // The reference demo mounts a fresh Thinking instance on automatic restart.
  useEffect(() => {
    if (mode !== 'live') return;
    const video = referenceVideo.current;
    if (video) {
      video.currentTime = videoStart;
      video.playbackRate = 1;
      void video.play().catch(error => {
        if (error.name === 'NotAllowedError') setPlaybackMessage('点击「重播完整过程」播放参考录像。');
      });
    }
    const timers = new Set<number>();
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => { timers.delete(timer); callback(); }, delay);
      timers.add(timer);
    };
    const startCycle = () => {
      setDemo(initialDemo);
      lifecyclePhases.slice(1).forEach((_, index) => {
        schedule(() => setDemo({ phase: index + 1, done: false }), (index + 1) * 2000);
      });
      schedule(() => setDemo({ phase: 4, done: true }), 10000);
      schedule(() => { setCycle(value => value + 1); startCycle(); }, cycleMs);
    };
    startCycle();
    return () => { timers.forEach(window.clearTimeout); video?.pause(); };
  }, [mode, appearance, replay]);

  useEffect(() => {
    for (const video of [referenceVideo.current, replicaVideo.current]) {
      if (video) video.playbackRate = mode === 'recordings' ? speed : 1;
    }
  }, [speed, mode, appearance, detail]);

  function pauseRecordings() {
    referenceVideo.current?.pause();
    replicaVideo.current?.pause();
    setPlaying(false);
  }

  async function playRecordings(fromStart: boolean) {
    const videos = [referenceVideo.current, replicaVideo.current];
    setPlaybackMessage('');
    if (fromStart || videos.some(video => video?.ended)) {
      videos.forEach(video => { if (video) video.currentTime = videoStart; });
    }
    try {
      await Promise.all(videos.map(video => video?.play()));
      setPlaying(true);
    } catch {
      pauseRecordings();
      setPlaybackMessage('录像暂未开始播放，请待加载完成后点击「从头播放」。');
    }
  }

  // Recording mode never mounts the reference decoder or its replay callbacks.
  if (new URLSearchParams(window.location.search).has('capture')) return <section
    className="thinking-study thinking-study--capture" data-appearance={appearance}>
    <div className="thinking-study__scene"><div className="thinking-study__chat">
      <p className="thinking-study__question">Which CRM fits a 10-person sales team best?</p>
      <div className="thinking-study__loader-row"><ThinkingLoader key={`${appearance}-${replay}-${cycle}`}
        appearance={appearance} phases={lifecyclePhases} phase={demo.phase} done={demo.done}
        doneLabel="Thought for 10s" className="thinking-study__loader" /></div>
    </div></div>
    <button type="button" onClick={replayFullProcess}>重播完整过程</button>
  </section>;

  return <section className="thinking-study" data-appearance={appearance} data-detail={detail || undefined} aria-labelledby={`${id}-title`}>
    <header className="thinking-study__heading">
      <div><p className="thinking-study__eyebrow">04 / MOTION STUDY</p>
        <h2 id={`${id}-title`}>Thinking Loader</h2></div>
      <p>图标、文字微光与阶段切换 · 完整生命周期对照</p>
    </header>

    <div className="thinking-study__toolbar">
      <div className="thinking-study__switch" role="group" aria-label="外观">
        {(['clean', 'classic'] as const).map(value => <button key={value} type="button"
          aria-pressed={appearance === value} onClick={() => { if (appearance !== value) changeView(mode, value); }}>
          {value === 'clean' ? 'Clean' : 'Classic'}
        </button>)}
      </div>
      <div className="thinking-study__switch" role="group" aria-label="对照模式">
        {([['live', '完整过程'], ['interactive', '参数调试'], ['recordings', '录像对照']] as const).map(([value, label]) =>
          <button key={value} type="button" aria-pressed={mode === value}
            onClick={() => { if (mode !== value) changeView(value); }}>{label}</button>)}
      </div>
      {mode !== 'recordings' && <button className="thinking-study__replay" type="button" onClick={replayFullProcess}>重播完整过程</button>}
      <button type="button" aria-pressed={detail} onClick={() => { changeView(mode); setDetail(value => !value); }}>放大细节 2×</button>
    </div>

    <div className="thinking-study__comparison">
      <figure className="thinking-study__panel">
        <figcaption>原版录像 <span>{appearance === 'clean' ? 'Clean' : 'Classic'} · 18 s · 原生 25 fps</span></figcaption>
        <div className="thinking-study__video-scene">
          <video key={`${appearance}-${mode}-${detail}`} ref={referenceVideo} src={referenceSource}
            muted playsInline preload="auto" controls={interactive} loop={interactive}
            aria-label="原版完整生命周期录像"
            onCanPlay={() => { setReferenceReady(true); if (!referenceReady && mode === 'live') replayFullProcess(); }}
            onPlaying={() => setReferenceReady(true)}
            onError={() => setReferenceError(true)}
            onEnded={() => { if (mode === 'live') replayFullProcess(); else if (mode === 'recordings') pauseRecordings(); }} />
          {(!referenceReady || referenceError) && <p className="thinking-study__video-message" role="status">
            {referenceError ? '参考录像暂不可用，生成后重新加载页面。' : '正在加载完整参考录像…'}
          </p>}
        </div>
      </figure>

      <div className="thinking-study__panel">
        <div className="thinking-study__panel-heading">{mode === 'recordings' ? '复刻录像' : '实时复刻'}
          <span>{mode === 'recordings' ? '完整录制 · 共用播放控制' : interactive ? '可操作参数' : '12.6 s 一轮 · 演示自动循环'}</span>
        </div>
        {mode === 'recordings' ? <div className="thinking-study__video-scene">
          <video key={`${appearance}-${detail}`} ref={replicaVideo} src={replicaSource} muted playsInline preload="auto"
            aria-label="复刻完整生命周期录像" onCanPlay={() => setReplicaReady(true)}
            onError={() => setReplicaError(true)} onEnded={pauseRecordings} />
          {(!replicaReady || replicaError) && <p className="thinking-study__video-message" role="status">
            {replicaError ? '复刻录像暂不可用，录制后重新加载页面。' : '正在加载完整复刻录像…'}
          </p>}
        </div> : <div className="thinking-study__scene" data-theme={interactive && dark ? 'dark' : 'light'}>
          <div className="thinking-study__chat">
            <p className="thinking-study__question">Which CRM fits a 10-person sales team best?</p>
            <div className="thinking-study__loader-row">
              <ThinkingLoader key={`${appearance}-${mode}-${replay}-${cycle}`} appearance={appearance}
                phases={interactive ? labels : lifecyclePhases} interval={interactive ? interval : 2000}
                phase={interactive ? selectedPhase : demo.phase} loop={interactive && loop}
                done={interactive ? done : demo.done}
                doneLabel={interactive ? (elapsedLabel ? seconds => `${doneText} in ${seconds}s` : doneText) : 'Thought for 10s'}
                size={interactive ? size : 'md'} variant={interactive ? variant : 'pill'}
                reduceMotion={interactive && reduceMotion} className="thinking-study__loader" />
            </div>
          </div>
        </div>}
      </div>
    </div>

    {mode === 'recordings' ? <div className="thinking-study__transport">
      <button type="button" onClick={() => void playRecordings(true)} disabled={!referenceReady || !replicaReady}>从头播放</button>
      <button type="button" onClick={() => playing ? pauseRecordings() : void playRecordings(false)}
        disabled={!referenceReady || !replicaReady}>{playing ? '暂停' : '继续播放'}</button>
      <label>播放速度 <select aria-label="录像播放速度" value={speed} onChange={event => setSpeed(Number(event.target.value))}>
        <option value={1}>1×</option><option value={0.25}>0.25×</option>
      </select></label>
      <span>两段录像共用起点、暂停与速度</span>
    </div> : interactive ? <div className="thinking-study__transport">
      <button type="button" onClick={() => setDone(true)} disabled={done}>完成</button>
      <button type="button" onClick={() => setDone(false)} disabled={!done}>重新开始</button>
      <span>{done ? '已完成' : selectedPhase === undefined ? (loop ? '自动循环' : '自动推进 · 末阶段停留') : '受控阶段 · 计时器停止'}</span>
    </div> : <ol className="thinking-study__timeline" aria-label="演示生命周期">
      {[...lifecyclePhases, 'Thought for 10s'].map((label, index) => <li key={label}
        aria-current={(demo.done ? index === 5 : index === demo.phase) ? 'step' : undefined}>
        <span>{index * 2} s</span>{label}
      </li>)}
      <li><span>12.6 s</span>重新开始</li>
    </ol>}
    {playbackMessage && <p className="thinking-study__note" role="status">{playbackMessage}</p>}

    {interactive && <>
      <form className="thinking-study__controls" onSubmit={event => event.preventDefault()} aria-label="Thinking Loader 参数">
        <label className="thinking-study__phases">phases · 每行一个标签
          <textarea rows={5} value={phaseText} onChange={event => setPhaseText(event.target.value)} />
        </label>
        <label>phase · controlledPhase
          <select value={selectedPhase ?? 'auto'} onChange={event => setPhase(event.target.value === 'auto' ? undefined : Number(event.target.value))}>
            <option value="auto">自动计时</option>
            {labels.map((label, index) => <option key={index} value={index}>{index} · {label}</option>)}
          </select>
        </label>
        <label>interval
          <select value={interval} onChange={event => setInterval(Number(event.target.value))}>
            {[800, 1400, 2000, 2200, 3600].map(ms => <option key={ms} value={ms}>{ms} ms</option>)}
          </select>
        </label>
        <label>size
          <select value={size} onChange={event => setSize(event.target.value as ThinkingLoaderProps['size'])}>
            <option value="sm">sm · {appearance === 'clean' ? 26 : 28}px</option>
            <option value="md">md · {appearance === 'clean' ? 32 : 34}px</option>
          </select>
        </label>
        <label>variant
          <select value={variant} onChange={event => setVariant(event.target.value as ThinkingLoaderProps['variant'])}>
            <option value="pill">pill</option><option value="plain">plain</option>
          </select>
        </label>
        <label>doneLabel<input value={doneText} onChange={event => setDoneText(event.target.value)} /></label>
        <div className="thinking-study__toggles">
          <label><input type="checkbox" checked={loop} onChange={event => setLoop(event.target.checked)} />loop</label>
          <label><input type="checkbox" checked={elapsedLabel} onChange={event => setElapsedLabel(event.target.checked)} />doneLabel 函数（秒数）</label>
          <label><input type="checkbox" checked={dark} onChange={event => setDark(event.target.checked)} />暗色</label>
          <label><input type="checkbox" checked={reduceMotion} onChange={event => setReduceMotion(event.target.checked)} />减弱动态</label>
        </div>
      </form>

      <div className="thinking-study__inline" data-theme={dark ? 'dark' : 'light'}>
        <div><span className="thinking-study__inline-title">行内摘要 · sm / plain</span>
          <ThinkingLoader appearance={appearance} phases={['正在核对来源']} size="sm" variant="plain" done={inlineDone}
            doneLabel="来源已核对" reduceMotion={reduceMotion} />
        </div>
        <button type="button" onClick={() => setInlineDone(value => !value)}>{inlineDone ? '再试一次' : '完成摘要'}</button>
      </div>
    </>}
    <p className="thinking-study__note">已采集 Clean / Classic 各 18 秒完整过程，录像为原生 25 fps。
      {interactive ? '参数调试可独立调整复刻；原版保留采集时的完整过程。' : '原版录像与演示从头同步触发；录像对照可用 0.25× 慢放观察微过渡。'}
      可切换 2× 局部，观察射线明暗、文字扫光和完成勾号；对照以真实过渡起点为准。</p>
  </section>;
}
