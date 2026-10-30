import { useRef, useState } from 'react';

type Pair = [number, number];
const sideNames = ['原版', '复刻'];

/** Alignment points refer to visible media phases, never action-request timestamps. */
export function EvidencePlayer({ slug, note }: { slug: string; note?: string }) {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [ready, setReady] = useState([false, false]);
  const [failed, setFailed] = useState([false, false]);
  const [durations, setDurations] = useState<Pair>([0, 0]);
  const [offsets, setOffsets] = useState<Pair>([0, 0]);
  const [position, setPosition] = useState(0);
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const playRequest = useRef(0);
  const remaining = durations.map((duration, i) => Math.max(0, duration - offsets[i]));
  const duration = Math.max(...remaining);
  const leadingSide = remaining.indexOf(duration);
  const available = ready.every(Boolean) && !failed.some(Boolean);
  const aligned = offsets.some(value => value > 0);
  const videos = () => refs.flatMap(ref => ref.current ? [ref.current] : []);
  function pause() {
    playRequest.current++;
    videos().forEach(video => video.pause());
    setPlaying(false);
  }
  function seek(time: number, anchors: Pair = offsets) {
    pause();
    const end = Math.max(...durations.map((value, i) => value - anchors[i]));
    const target = Math.max(0, Math.min(time, end));
    refs.forEach((ref, i) => { if (ref.current) ref.current.currentTime = Math.min(anchors[i] + target, durations[i]); });
    setPosition(target);
  }
  function setAnchor(index: number, value: number) {
    if (!Number.isFinite(value)) return;
    const next = offsets.map((old, i) => i === index ? Math.max(0, Math.min(value, durations[i])) : old) as Pair;
    setOffsets(next);
    seek(0, next);
  }
  async function play(fromStart = false, complete = false) {
    if (!available) return;
    const anchors: Pair = complete ? [0, 0] : offsets;
    if (complete) setOffsets(anchors);
    const time = fromStart || position >= duration ? 0 : position;
    seek(time, anchors);
    const request = playRequest.current;
    videos().forEach(video => { video.playbackRate = rate; });
    try {
      await Promise.all(refs.flatMap((ref, i) => ref.current && time + anchors[i] < durations[i] ? [ref.current.play()] : []));
      if (request === playRequest.current) setPlaying(true);
    } catch { if (request === playRequest.current) pause(); }
  }
  return <div className="batch-evidence">
    {note && <p className="batch-note">{note}</p>}
    <div className="batch-videos">{['reference', 'replica'].map((side, i) => <figure key={side}>
      <figcaption>{sideNames[i]}完整录像</figcaption>
      <video ref={refs[i]} src={`/evidence/batch/${slug}/${side}/lifecycle.webm`} muted playsInline preload="auto"
        aria-label={`${sideNames[i]}录像`}
        onLoadedMetadata={event => { const value = event.currentTarget.duration; setDurations(old => old.map((d, index) => index === i ? value : d) as Pair); }}
        onCanPlay={() => setReady(old => old.map((value, index) => index === i ? true : value))}
        onError={() => setFailed(old => old.map((value, index) => index === i ? true : value))}
        onEnded={() => { if (i === leadingSide) pause(); }}
        onTimeUpdate={i === leadingSide ? event => {
          const time = Math.max(0, event.currentTarget.currentTime - offsets[i]);
          setPosition(time);
          const other = refs[1 - i].current;
          if (playing && time >= duration) pause();
          else if (playing && other && !other.ended && !other.seeking) {
            const target = Math.min(time + offsets[1 - i], durations[1 - i]);
            if (Math.abs(other.currentTime - target) > .15) other.currentTime = target;
          }
        } : undefined} />
      {failed[i] && <p role="status">这段录像尚未生成。</p>}
      <div className="batch-alignment">
        <label>{sideNames[i]}对齐起点 <input type="number" aria-label={`${sideNames[i]}对齐起点`} min={0} max={durations[i]} step={.04} value={offsets[i]} disabled={!available} onChange={event => setAnchor(i, Number(event.target.value))}/> 秒</label>
        <input type="range" aria-label={`${sideNames[i]}起点定位`} min={0} max={durations[i] || 1} step={.04} value={offsets[i]} disabled={!available} onChange={event => setAnchor(i, Number(event.target.value))}/>
      </div>
    </figure>)}</div>
    <div className="batch-transport">
      <button disabled={!available} onClick={() => void play(true, true)}>重播完整过程</button>
      <button disabled={!available || !aligned} onClick={() => void play(true)}>重播对齐片段</button>
      <button disabled={!available} onClick={() => playing ? pause() : void play()}>{playing ? '暂停' : '播放'}</button>
      <button disabled={!available || position <= 0} onClick={() => seek(position - .04)}>后退 40ms</button>
      <button disabled={!available || position >= duration} onClick={() => seek(position + .04)}>前进 40ms</button>
      <label>速度 <select aria-label="播放速度" value={rate} onChange={event => { const value = Number(event.target.value); setRate(value); videos().forEach(video => { video.playbackRate = value; }); }}><option value={1}>1×</option><option value={.25}>0.25×</option></select></label>
      <output aria-label="相对对齐起点的进度">{position.toFixed(2)} / {duration.toFixed(2)} s</output>
      <input type="range" aria-label="录像进度" min={0} max={duration || 1} step={.04} value={Math.min(position, duration || 1)} disabled={!available} onChange={event => seek(Number(event.target.value))}/>
    </div>
    <p className="batch-note">先完整回放，再把两侧起点定位到同一可见变化。同步进度相对于各自起点；40ms 步进不增加原录像帧率，也不代表每步都有新的画面。</p>
    <a href={`/evidence/batch/${slug}/analysis.md`} target="_blank" rel="noreferrer">查看采集分析与对照记录 ↗</a>
  </div>;
}
