'use client';

import { useId, useState, type CSSProperties } from 'react';
import '@fontsource-variable/inter';
import { UsageMeter, type UsageCategory, type UsageDay, type UsageMeterState } from '../components/usage-meter';
import reference from '../../evidence/pro-tests/usage-meter/reference/this-month.png';
import './UsageMeterStudy.css';

const periods = [{ id: 'month', label: 'This month' }, { id: 'last', label: 'Last month' }, { id: '7d', label: '7 days' }];
// Daily dates and values were read through the original public chart keyboard interaction.
const data: Record<string, { used: UsageCategory[]; daily: UsageDay[]; seats: number; storage: number; projects: number }> = {
  last: {
    used: [{ label: 'Chat', value: 5210 }, { label: 'Search', value: 2140 }, { label: 'Image', value: 1690 }, { label: 'API', value: 960, color: '#a8a8ae' }],
    daily: [
      { label: 'Sep 9', value: 243 },
      { label: 'Sep 10', value: 417 },
      { label: 'Sep 11', value: 443 },
      { label: 'Sep 12', value: 142 },
      { label: 'Sep 13', value: 158 },
      { label: 'Sep 14', value: 333 },
      { label: 'Sep 15', value: 340 },
      { label: 'Sep 16', value: 416 },
      { label: 'Sep 17', value: 423 },
      { label: 'Sep 18', value: 292 },
      { label: 'Sep 19', value: 134 },
      { label: 'Sep 20', value: 129 },
      { label: 'Sep 21', value: 298 },
      { label: 'Sep 22', value: 279 },
      { label: 'Sep 23', value: 413 },
      { label: 'Sep 24', value: 371 },
      { label: 'Sep 25', value: 400 },
      { label: 'Sep 26', value: 155 },
      { label: 'Sep 27', value: 145 },
      { label: 'Sep 28', value: 531 },
      { label: 'Sep 29', value: 324 },
      { label: 'Sep 30', value: 535 },
      { label: 'Oct 1', value: 323 },
      { label: 'Oct 2', value: 562 },
      { label: 'Oct 3', value: 202 },
      { label: 'Oct 4', value: 173 },
      { label: 'Oct 5', value: 492 },
      { label: 'Oct 6', value: 577 },
      { label: 'Oct 7', value: 336 },
      { label: 'Oct 8', value: 414 },
    ],
    seats: 10, storage: 2.9, projects: 11,
  },
  month: {
    used: [{ label: 'Chat', value: 3980 }, { label: 'Search', value: 1640 }, { label: 'Image', value: 1120 }, { label: 'API', value: 680, color: '#a8a8ae' }],
    daily: [
      { label: 'Oct 9', value: 251 },
      { label: 'Oct 10', value: 158 },
      { label: 'Oct 11', value: 147 },
      { label: 'Oct 12', value: 272 },
      { label: 'Oct 13', value: 462 },
      { label: 'Oct 14', value: 364 },
      { label: 'Oct 15', value: 395 },
      { label: 'Oct 16', value: 388 },
      { label: 'Oct 17', value: 178 },
      { label: 'Oct 18', value: 159 },
      { label: 'Oct 19', value: 343 },
      { label: 'Oct 20', value: 471 },
      { label: 'Oct 21', value: 332 },
      { label: 'Oct 22', value: 398 },
      { label: 'Oct 23', value: 457 },
      { label: 'Oct 24', value: 237 },
      { label: 'Oct 25', value: 186 },
      { label: 'Oct 26', value: 338 },
      { label: 'Oct 27', value: 378 },
      { label: 'Oct 28', value: 526 },
      { label: 'Oct 29', value: 492 },
      { label: 'Oct 30', value: 488 },
      { label: 'Oct 31', value: null },
      { label: 'Nov 1', value: null },
      { label: 'Nov 2', value: null },
      { label: 'Nov 3', value: null },
      { label: 'Nov 4', value: null },
      { label: 'Nov 5', value: null },
      { label: 'Nov 6', value: null },
      { label: 'Nov 7', value: null },
    ],
    seats: 8, storage: 3.2, projects: 12,
  },
  '7d': {
    used: [{ label: 'Chat', value: 1260 }, { label: 'Search', value: 540 }, { label: 'API', value: 340, color: '#a8a8ae' }],
    daily: [
      { label: 'Oct 24', value: 105 },
      { label: 'Oct 25', value: 172 },
      { label: 'Oct 26', value: 425 },
      { label: 'Oct 27', value: 333 },
      { label: 'Oct 28', value: 435 },
      { label: 'Oct 29', value: 312 },
      { label: 'Oct 30', value: 358 },
    ], seats: 8, storage: 3.2, projects: 12,
  },
};

export function UsageMeterStudy() {
  const id = useId();
  const [period, setPeriod] = useState('month');
  const [controlled, setControlled] = useState(true);
  const [total, setTotal] = useState(10000);
  const [warnAt, setWarnAt] = useState(.8);
  const [seatLimit, setSeatLimit] = useState(10);
  const [dark, setDark] = useState(false);
  const [width, setWidth] = useState(460);
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [resetAt] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 9);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const current = data[period];

  function upgrade(state: UsageMeterState) {
    setTotal(value => value + 5000);
    setSeatLimit(value => value + 5);
    setNotice(`${state} → 已在本地增加 5,000 credits 与 5 个席位。`);
  }

  function reset() {
    setPeriod('month'); setTotal(10000); setWarnAt(.8); setSeatLimit(10);
    setRevision(value => value + 1); setNotice('已恢复参考场景。');
  }

  return <section className="usage-study" aria-labelledby={`${id}-title`}>
    <header className="usage-study__heading">
      <div><p className="usage-study__eyebrow">AFFECTUI / DATA DISPLAY</p><h2 id={`${id}-title`}>Usage Meter</h2></div>
      <p>用量、分类与计划额度。</p>
    </header>
    <div className="usage-study__comparison">
      <figure className="usage-study__panel">
        <figcaption>原版公开预览 <span>This month · 460 × 484</span></figcaption>
        <div className="usage-study__reference"><img src={reference} width="460" height="484" alt="原版 This month 稳定状态：7,420 credits，Chat 3,980、Search 1,640、Image 1,120、API 680，Upgrade。" /></div>
      </figure>
      <div className="usage-study__panel">
        <div className="usage-study__panel-heading">独立实现 <span>{width}px · {controlled ? '受控 period' : '非受控 period'}</span></div>
        <div className="usage-study__scene" data-theme={dark ? 'dark' : 'light'}>
          <div className="usage-study__container" style={{ width, '--usage-meter-font-family': "'Inter Variable', Inter, sans-serif" } as CSSProperties}>
            <UsageMeter key={`${controlled}-${revision}`}
              title="Acme AI" plan="Pro plan" total={total} used={current.used} daily={current.daily}
              limits={[{ label: 'Seats', used: current.seats, total: seatLimit }, { label: 'Storage', used: current.storage, total: 5, unit: 'GB' }, { label: 'Projects', used: current.projects, total: null }]}
              periods={periods} period={controlled ? period : undefined} defaultPeriod={period}
              onPeriodChange={next => { setPeriod(next); setNotice(`已切换至 ${periods.find(option => option.id === next)?.label}。`); }}
              resetAt={resetAt} warnAt={warnAt} onUpgrade={upgrade} />
          </div>
        </div>
        <div className="usage-study__feedback" role="status" aria-live="polite">{notice || '切换周期查看固定数据，或点击 Add credits 增加本地额度。'}</div>
      </div>
    </div>
    <form className="usage-study__controls" onSubmit={event => event.preventDefault()} aria-label="Usage Meter 参数">
      <label>Credits 额度<select value={total} onChange={event => setTotal(Number(event.target.value))}>
        {[...new Set([8000, 10000, 15000, total])].sort((a, b) => a - b).map(value => <option key={value} value={value}>{value.toLocaleString('en-US')}</option>)}
      </select></label>
      <label>Seats 上限<select value={seatLimit} onChange={event => setSeatLimit(Number(event.target.value))}>
        {[...new Set([10, 20, seatLimit])].sort((a, b) => a - b).map(value => <option key={value} value={value}>{value}</option>)}
      </select></label>
      <label>预警阈值<select value={warnAt} onChange={event => setWarnAt(Number(event.target.value))}><option value={.8}>80%</option><option value={.95}>95%</option></select></label>
      <label>容器宽度<select value={width} onChange={event => setWidth(Number(event.target.value))}><option value={460}>460px</option><option value={400}>400px</option><option value={320}>320px</option></select></label>
      <div className="usage-study__actions">
        <label><input type="checkbox" checked={controlled} onChange={event => setControlled(event.target.checked)} />受控 period</label>
        <label><input type="checkbox" checked={dark} onChange={event => setDark(event.target.checked)} />暗色</label>
        <button type="button" onClick={reset}>恢复参考场景</button>
      </div>
    </form>
    <p className="usage-study__hint">Tab 进入周期、分类条、每日柱图和升级按钮；← / → 切换，Esc 收起读数。This month 含未来日期的空值短柱，Projects 为无限额度。</p>
  </section>;
}
