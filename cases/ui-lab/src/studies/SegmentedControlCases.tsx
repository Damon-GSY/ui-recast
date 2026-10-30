'use client';

import { useId, useState } from 'react';
import '@fontsource-variable/inter';
import { SegmentedControl, type SegmentedControlProps } from '../components/segmented-control';
import './SegmentedControlCases.css';

function LayoutIcon({ kind }: { kind: 'list' | 'board' | 'calendar' }) {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'list' ? <><path d="M6 4h7M6 8h7M6 12h7" /><path d="M3 4h.01M3 8h.01M3 12h.01" /></>
      : kind === 'board' ? <><rect x="2.5" y="2.5" width="4" height="11" rx="1" /><rect x="9.5" y="2.5" width="4" height="7" rx="1" /></>
      : <><rect x="2.5" y="3.5" width="11" height="10" rx="2" /><path d="M5 2v3m6-3v3M3 7h10" /></>}
  </svg>;
}

const countSteps = [undefined, 0, 3, 12, 128, 1024] as const;
const variants = ['buttons', 'tray', 'underline'] as const;

/** Standalone acceptance cases. Mount this component wherever the host needs it. */
export function SegmentedControlCases() {
  const id = useId();
  const [appearance, setAppearance] = useState<SegmentedControlProps['appearance']>('clean');
  const [variant, setVariant] = useState<SegmentedControlProps['variant']>('buttons');
  const [theme, setTheme] = useState('light');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [longLabel, setLongLabel] = useState(false);
  const [countStep, setCountStep] = useState(2);
  const [dynamicValue, setDynamicValue] = useState('notifications');
  const [dynamicChanges, setDynamicChanges] = useState(0);
  const [panel, setPanel] = useState('overview');
  const [tabChanges, setTabChanges] = useState(0);
  const [containerWidth, setContainerWidth] = useState(600);
  const [fullValues, setFullValues] = useState({ buttons: 'today', tray: 'today', underline: 'today' });
  const [iconValue, setIconValue] = useState('board');
  const [iconChanges, setIconChanges] = useState(0);
  const count = countSteps[countStep];
  const shared = { appearance, reduceMotion, disabled };
  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'reports', label: 'Reports', disabled: true },
    { value: 'analytics', label: 'Analytics' },
    { value: 'notifications', label: 'Notifications', count },
  ].map(option => ({ ...option, controls: `${id}-panel-${option.value}` }));

  return <section className={`sc-cases${theme === 'dark-class' ? ' dark' : ''}`}
    data-theme={theme === 'dark-attribute' ? 'dark' : theme === 'light' ? 'light' : undefined}
    aria-labelledby={`${id}-title`}>
    <header className="sc-cases__header">
      <h2 id={`${id}-title`}>Segmented Control · API cases</h2>
      <p>交互使用本地 state。计数、选项值和内容面板会随操作更新。</p>
    </header>
    <div className="sc-cases__toolbar">
      <label>外观 <select value={appearance} onChange={event => setAppearance(event.target.value as SegmentedControlProps['appearance'])}>
        <option value="clean">Clean</option><option value="classic">Classic</option>
      </select></label>
      <label>动态示例形态 <select value={variant} onChange={event => setVariant(event.target.value as SegmentedControlProps['variant'])}>
        {variants.map(item => <option key={item}>{item}</option>)}
      </select></label>
      <label>主题 <select value={theme} onChange={event => setTheme(event.target.value)}>
        <option value="light">Light</option><option value="dark-attribute">Dark · data-theme</option><option value="dark-class">Dark · class</option>
      </select></label>
      <label><input type="checkbox" checked={reduceMotion} onChange={event => setReduceMotion(event.target.checked)} />减少动态</label>
      <label><input type="checkbox" checked={disabled} onChange={event => setDisabled(event.target.checked)} />禁用全部</label>
    </div>

    <section className="sc-cases__case" aria-labelledby={`${id}-dynamic-title`}>
      <h3 id={`${id}-dynamic-title`}>动态 label / count</h3>
      <p>切换长短标签；计数依次经过无徽标、0、3、12、128、1024。可在选中其他项后继续更新。</p>
      <div className="sc-cases__actions">
        <button type="button" onClick={() => setLongLabel(current => !current)}>{longLabel ? '使用短标签' : '使用长标签'}</button>
        <button type="button" onClick={() => setCountStep(current => (current + 1) % countSteps.length)}>下一计数</button>
        <button type="button" onClick={() => { setLongLabel(false); setCountStep(2); }}>重置内容</button>
      </div>
      <div className="sc-cases__stage">
        <SegmentedControl {...shared} kind="radio" variant={variant} aria-labelledby={`${id}-dynamic-title`}
          value={dynamicValue} onValueChange={next => { setDynamicValue(next); setDynamicChanges(n => n + 1); }}
          options={[
            { value: 'overview', label: 'Overview' },
            { value: 'notifications', label: longLabel ? 'Team notifications' : 'Inbox', count },
            { value: 'archive', label: 'Archive', disabled: true },
            { value: 'settings', label: 'Settings' },
          ]} />
      </div>
      <output className="sc-cases__status">值：{dynamicValue} · count：{count ?? '未提供'} · onValueChange：{dynamicChanges} 次</output>
    </section>

    <section className="sc-cases__case" aria-labelledby={`${id}-tabs-title`}>
      <h3 id={`${id}-tabs-title`}>Tabs 与实际面板</h3>
      <p>左右键、Home / End 自动选择并切换面板，跳过 Reports。上下键保留页面滚动。</p>
      <div className="sc-cases__stage">
        <SegmentedControl {...shared} kind="tabs" variant="underline" aria-labelledby={`${id}-tabs-title`}
          options={tabs} value={panel} onValueChange={next => { setPanel(next); setTabChanges(n => n + 1); }} />
      </div>
      {tabs.map(option => <div key={option.value} className="sc-cases__panel" id={option.controls}
        role="tabpanel" aria-labelledby={`${option.controls}-tab`} hidden={panel !== option.value} tabIndex={0}>
        {option.value === 'overview' && <><h4>Overview</h4><p>当前工作区的概览内容。</p></>}
        {option.value === 'reports' && <><h4>Reports</h4><p>此示例的报表入口已禁用。</p></>}
        {option.value === 'analytics' && <><h4>Analytics</h4><p>当前面板由 Analytics tab 控制。</p></>}
        {option.value === 'notifications' && <><h4>Notifications</h4><p>{count === undefined ? '尚未提供未读数量。' : `未读通知：${count} 条。`}</p>
          <div className="sc-cases__actions"><button type="button" onClick={() => setCountStep(1)}>标记全部已读</button></div></>}
      </div>)}
      <output className="sc-cases__status">面板：{panel} · onValueChange：{tabChanges} 次</output>
    </section>

    <section className="sc-cases__case" aria-labelledby={`${id}-full-title`}>
      <h3 id={`${id}-full-title`}>Full width · 等宽与横向滚动</h3>
      <div className="sc-cases__actions">
        <label>容器宽度 <input type="range" min="220" max="600" step="10" value={containerWidth}
          onChange={event => setContainerWidth(Number(event.target.value))} />{containerWidth}px</label>
        <button type="button" onClick={() => setContainerWidth(current => current === 240 ? 600 : 240)}>切换 240 / 600px</button>
      </div>
      <p>每项至少容纳最长标签。空间不足时滚动；选中 Year 后缩窄可检查选中项是否保持可见。This week 已禁用。</p>
      <div className="sc-cases__resizable" style={{ width: containerWidth }}>
        {variants.map(item => <div key={item} className="sc-cases__full-row">
          <h4 id={`${id}-full-${item}`}>{item}</h4>
          <SegmentedControl {...shared} fullWidth variant={item} aria-labelledby={`${id}-full-${item}`}
            defaultValue="today" onValueChange={next => setFullValues(current => ({ ...current, [item]: next }))}
            options={[
              { value: 'today', label: 'Today' }, { value: 'week', label: 'This week', disabled: true },
              { value: 'quarter', label: 'Quarterly review' }, { value: 'year', label: 'Year' },
            ]} />
          <output className="sc-cases__status">非受控值：{fullValues[item]}</output>
        </div>)}
      </div>
    </section>

    <section className="sc-cases__case" aria-labelledby={`${id}-icon-title`}>
      <h3 id={`${id}-icon-title`}>Icon-only · ariaLabel</h3>
      <p>三个选项均省略 label，通过 ariaLabel 命名；List 包含计数，Calendar 已禁用。</p>
      <div className="sc-cases__stage">
        <SegmentedControl {...shared} aria-label="Layout view" variant="tray" size="sm" defaultValue="board"
          onValueChange={next => { setIconValue(next); setIconChanges(n => n + 1); }}
          options={[
            { value: 'list', icon: <LayoutIcon kind="list" />, ariaLabel: 'List', count },
            { value: 'board', icon: <LayoutIcon kind="board" />, ariaLabel: 'Board' },
            { value: 'calendar', icon: <LayoutIcon kind="calendar" />, ariaLabel: 'Calendar', disabled: true },
          ]} />
      </div>
      <output className="sc-cases__status">非受控值：{iconValue} · onValueChange：{iconChanges} 次</output>
    </section>
  </section>;
}
