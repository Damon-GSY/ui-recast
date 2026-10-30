'use client';

import { useId, useRef, useState } from 'react';
import { AgentGraph } from '../components/agent-graph';
import { useAgentGraphDemo } from './agent-graph-demo';
import './AgentGraphStudy.css';

type StudyMode = 'live' | 'reference' | 'recordings';
const videoBase = '/evidence/agent-graph/motion';
const lifecycleSeconds = 36;
const videoStart = 0.18;
// These bookmarks follow the capture script's actions, not inferred animation timings.
const bookmarks = [
  { time: videoStart, label: '完整过程起点' },
  { time: 9.5, label: '等待光效' },
  { time: 11.2, label: '失败光效' },
  { time: 23.5, label: 'Writer 等待详情' },
  { time: 25.2, label: 'Coder 错误详情' },
  { time: 29, label: 'Researcher 悬停' },
  { time: 31, label: '再次触发' },
];

function LiveGraph({ replay }: { replay: number }) {
  const { nodes, calls, edges, now } = useAgentGraphDemo(replay);
  return <AgentGraph nodes={nodes} calls={calls} edges={edges} now={now} height={486} />;
}

function GraphRecordings({ compare }: { compare: boolean }) {
  const id = useId();
  const referenceVideo = useRef<HTMLVideoElement>(null);
  const replicaVideo = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState({ reference: false, replica: false });
  const [errors, setErrors] = useState({ reference: false, replica: false });
  const [durations, setDurations] = useState({ reference: lifecycleSeconds, replica: lifecycleSeconds });
  const [position, setPosition] = useState(videoStart);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState(false);
  const duration = Math.min(durations.reference, compare ? durations.replica : durations.reference);
  const canPlay = ready.reference && !errors.reference && (!compare || (ready.replica && !errors.replica));
  const sides = compare ? (['reference', 'replica'] as const) : (['reference'] as const);

  function videos() {
    return [referenceVideo.current, ...(compare ? [replicaVideo.current] : [])]
      .filter((video): video is HTMLVideoElement => video !== null);
  }

  function pause() {
    videos().forEach(video => video.pause());
    setPlaying(false);
  }

  function seek(time: number) {
    pause();
    const next = Math.max(0, Math.min(time, duration));
    videos().forEach(video => { video.currentTime = next; });
    setPosition(next);
    setMessage('');
  }

  async function play(fromStart = false) {
    if (!canPlay) return;
    const active = videos();
    const start = fromStart || active.some(video => video.ended) || position >= duration ? videoStart : position;
    active.forEach(video => {
      video.currentTime = start;
      video.playbackRate = speed;
    });
    setPosition(start);
    setMessage('');
    setPlaying(true);
    try {
      await Promise.all(active.map(video => video.play()));
    } catch {
      pause();
      setMessage('录像尚未开始播放，请加载完成后重新播放。');
    }
  }

  function updatePosition() {
    const reference = referenceVideo.current;
    const replica = replicaVideo.current;
    if (!reference) return;
    setPosition(Math.min(reference.currentTime, duration));
    if (playing && reference.currentTime >= duration) {
      pause();
    } else if (playing && replica && !reference.seeking && !replica.seeking
      && Math.abs(reference.currentTime - replica.currentTime) > 0.12) {
      replica.currentTime = reference.currentTime;
    }
  }

  return <>
    <div className="agent-graph-study__view" role="group" aria-label="录像取景">
      <button className="agent-graph-study__button" type="button" aria-pressed={detail} onClick={() => {
        pause();
        setReady({ reference: false, replica: false });
        setErrors({ reference: false, replica: false });
        setPosition(videoStart);
        setDetail(value => !value);
      }}>{detail ? '返回完整画面' : '节点光效局部放大'}</button>
      <span>{detail ? '中心节点原始画面裁剪，保留原始时间' : '完整组件，包括工具、提示与详情'}</span>
    </div>
    <div className="agent-graph-study__recordings" data-compare={compare || undefined}>
      {sides.map(side => <figure className="agent-graph-study__panel" key={side}>
        <figcaption>{side === 'reference' ? '原版录像' : '复刻录像'}{detail ? ' · 节点局部' : ' · 完整过程'}
          <span>Clean / light · {compare ? '同尺度 · 左上角锚定' : '36 秒完整过程'}</span>
        </figcaption>
        <div className="agent-graph-study__video-scene">
          <video key={`${side}-${detail}`} ref={side === 'reference' ? referenceVideo : replicaVideo}
            src={`${videoBase}/${side}/${detail ? 'detail' : 'lifecycle'}.webm`} muted playsInline preload="auto"
            aria-label={side === 'reference' ? '原版完整过程录像' : '复刻完整过程录像'}
            onLoadedMetadata={event => {
              const video = event.currentTarget;
              video.playbackRate = speed;
              video.currentTime = videoStart;
              if (Number.isFinite(video.duration) && video.duration > 0) {
                setDurations(previous => ({ ...previous, [side]: video.duration }));
              }
            }}
            onCanPlay={() => setReady(previous => ({ ...previous, [side]: true }))}
            onTimeUpdate={side === 'reference' ? updatePosition : undefined}
            onEnded={pause}
            onError={() => {
              setErrors(previous => ({ ...previous, [side]: true }));
              pause();
            }} />
          {(!ready[side] || errors[side]) && <p className="agent-graph-study__video-message" role="status">
            {errors[side] ? `${side === 'reference' ? '原版' : '复刻'}录像暂未就绪，生成后刷新页面。` : '正在加载完整录像…'}
          </p>}
        </div>
      </figure>)}
    </div>
    <div className="agent-graph-study__transport">
      <button className="agent-graph-study__button" type="button" disabled={!canPlay}
        onClick={() => void play(true)}>重播完整过程</button>
      <button className="agent-graph-study__button" type="button" disabled={!canPlay}
        onClick={() => playing ? pause() : void play()}>{playing ? '暂停' : '播放'}</button>
      <label>播放速度 <select value={speed} aria-label="录像播放速度" onChange={event => {
        const value = Number(event.target.value);
        setSpeed(value);
        videos().forEach(video => { video.playbackRate = value; });
      }}><option value={1}>1×</option><option value={0.25}>0.25×</option></select></label>
      <output htmlFor={`${id}-progress`}>{position.toFixed(1)} / {duration.toFixed(1)} s</output>
    </div>
    <div className="agent-graph-study__scrubber">
      <label htmlFor={`${id}-progress`}>定位过程 <span>拖动后暂停，查看当前阶段</span></label>
      <input id={`${id}-progress`} type="range" min={0} max={duration} step={0.01}
        value={position} disabled={!canPlay} aria-valuetext={`${position.toFixed(2)} 秒`}
        onChange={event => seek(Number(event.target.value))} />
      <div className="agent-graph-study__bookmarks" role="group" aria-label="录像阶段定位">
        {bookmarks.map(({ time, label }) => <button className="agent-graph-study__button" type="button"
          key={time} disabled={!canPlay || time > duration} onClick={() => seek(time)}>
          <span>{time} s</span>{label}
        </button>)}
      </div>
    </div>
    {message && <p className="agent-graph-study__note" role="status">{message}</p>}
  </>;
}

export function AgentGraphStudy() {
  const id = useId();
  const [mode, setMode] = useState<StudyMode>('live');
  const [replay, setReplay] = useState(0);
  const capture = new URLSearchParams(window.location.search).get('capture') === '1';
  const replayButton = <button className="agent-graph-study__button agent-graph-study__replay" type="button"
    onClick={() => setReplay(value => value + 1)}>重播完整过程</button>;

  // Capture mounts no media elements. Keep reset outside .agent-graph so the recorder
  // can trigger the same lifecycle while cropping only the component itself.
  if (capture) return <section className="agent-graph-study agent-graph-study--capture" aria-label="Agent Graph 实时录制">
    <div className="agent-graph-study__live"><LiveGraph key={replay} replay={replay} /></div>
    <div className="agent-graph-study__capture-controls">{replayButton}</div>
  </section>;

  return <section className="agent-graph-study" aria-labelledby={`${id}-title`}>
    <header className="agent-graph-study__heading">
      <div><p className="agent-graph-study__eyebrow">AGENT GRAPH / MOTION STUDY</p>
        <h2 id={`${id}-title`}>Agent Graph</h2></div>
      <p>Clean / light · 36 秒完整过程对照</p>
    </header>
    <div className="agent-graph-study__toolbar">
      <div className="agent-graph-study__switch" role="group" aria-label="对照模式">
        {([['live', '实时组件'], ['reference', '原版完整录像'], ['recordings', '双录像对照']] as const)
          .map(([value, label]) => <button className="agent-graph-study__button" type="button" key={value}
            aria-pressed={mode === value} onClick={() => setMode(value)}>{label}</button>)}
      </div>
      {mode === 'live' && replayButton}
    </div>

    {mode === 'live' ? <div className="agent-graph-study__panel">
      <div className="agent-graph-study__panel-heading">实时复刻 <span>756px · 可点击节点查看详情</span></div>
      <div className="agent-graph-study__scene">
        <div className="agent-graph-study__live"><LiveGraph key={replay} replay={replay} /></div>
      </div>
    </div> : <GraphRecordings key={mode} compare={mode === 'recordings'} />}

    <div className="agent-graph-study__observations">
      <article><span>01 / 连线</span><h3>连线往返脉冲</h3>
        <p>沿调用与返回方向观察光点的起止、速度和尾迹，对照多个调用交叠时的节奏。</p></article>
      <article><span>02 / 节点</span><h3>节点呼吸、扫光与流动边框</h3>
        <p>观察工作中的明暗呼吸、表面扫光和边框流动，切换 0.25× 检查状态交接时的微小变化。</p></article>
      <article><span>03 / 过渡</span><h3>节点入场、动态增删与详情过渡</h3>
        <p>对照节点出现与移除时的布局变化；点击节点查看详情，观察展开、关闭和再次触发的衔接。</p></article>
    </div>
    <p className="agent-graph-study__note">实时组件按完整演示数据推进。双录像共用播放、暂停、速度和时间定位，画面以相同宽度、左上角锚点呈现；阶段定位对应采集操作，微过渡可用进度条细调。</p>
  </section>;
}
