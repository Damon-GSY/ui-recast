import { useRef, useState } from 'react';
import './pro-trials.css';

const trials = [
  { slug: 'usage-meter', title: 'Usage Meter', state: 'last-month', focus: '数字插值 · 分类变化 · 卡片高度', detail: 'Last month → 7 days → This month → Last month', finding: '稳定值为 10,000。周期切换还会改变分类数量、柱图和卡片高度。' },
  { slug: 'autonomy-dial', title: 'Autonomy Dial', state: 'if-risky', focus: '共享指示器 · 跨组重排 · 锁定', detail: 'If risky → Full auto → Always ask → If risky → 锁定 → 解锁', finding: '锁定是独立于档位的状态；同一行需要在两组之间连续移动。' },
  { slug: 'approval-card', title: 'Approval Card', state: 'pending', focus: '异步反馈 · 高度收合 · 决策状态', detail: 'Pending → Approved → 重置 → Denied', finding: '线上默认使用托盘按钮，决策后收合成 56px 摘要；等待响应和收合动画分别处理。' },
];

function Trial({ trial, index }: { trial: typeof trials[number]; index: number }) {
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const reference = useRef<HTMLVideoElement>(null);
  const replica = useRef<HTMLVideoElement>(null);
  return <article className="pro-trial">
    <div className="pro-trial__heading"><div><p className="pro-trial__number">0{index + 1} / PRO</p><h2>{trial.title}</h2><p>{trial.focus}</p></div><a className="pro-trial__launch" href={`/${trial.slug}`}>打开交互演示 ↗</a></div>
    <div className="pro-trial__toolbar"><div role="group" aria-label={`${trial.title} 对照方式`}><button type="button" aria-pressed={mode === 'image'} onClick={() => setMode('image')}>稳定状态</button><button type="button" aria-pressed={mode === 'video'} onClick={() => setMode('video')}>真实录屏</button></div>{mode === 'video' && <button type="button" onClick={() => { for (const video of [reference.current, replica.current]) { if (video) { video.currentTime = 0; void video.play().catch(() => {}); } } }}>从头播放两段</button>}</div>
    <div className="pro-trial__pair">{(['reference', 'replica'] as const).map(side => <figure key={side}><figcaption>{side === 'reference' ? 'AffectUI 原版' : '独立复刻'}<span>{side === 'reference' ? '公开预览采集' : 'React + Motion'}</span></figcaption><div className="pro-trial__media">{mode === 'image' ? <img src={`/evidence/pro-tests/${trial.slug}/${side}/${trial.state}.png`} alt={`${trial.title} ${side} ${trial.state}`} /> : <video ref={side === 'reference' ? reference : replica} controls playsInline preload="metadata" src={`/evidence/pro-tests/${trial.slug}/${side}/interaction-crop.webm`} />}</div></figure>)}</div>
    <p className="pro-trial__finding">{trial.finding}</p><div className="pro-trial__foot"><span>{mode === 'video' ? `${trial.detail} · 两段各自保留原始节奏` : 'Classic · 浅色 · 相同内容与组件宽度'}</span><a href={`https://www.affectui.com/components/${trial.slug}`} target="_blank" rel="noreferrer">查看原版 ↗</a><a href={`/r/${trial.slug}.json`} target="_blank">组件源码 ↗</a></div>
  </article>;
}

export function ProTrials() {
  return <main className="pro-trials"><header className="pro-trials__intro"><p className="pro-trials__eyebrow">REVERSE UI / SKILL TRIAL</p><h1>从可见行为，重建组件。</h1><p>三个源码受限的 AffectUI Pro 样本。截图识别结构，录像还原状态变化，再用渲染测量校准可编辑的独立实现。</p><div className="pro-trials__meta"><span>03 个样本</span><span>真实截图与录屏</span><a href="/skill/SKILL.md" target="_blank">查看 skill ↗</a></div></header>{trials.map((trial,index) => <Trial key={trial.slug} trial={trial} index={index} />)}<footer className="pro-trials__end">本轮验证 Classic 浅色主状态链。图标为独立近似，弹簧与短过渡仍有差异；暗色、Clean 和全部业务接口不计入原版对照结论。</footer></main>;
}
