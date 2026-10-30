import { lazy, Suspense, useState, type ComponentType } from 'react';
import './batch.css';
import { EvidencePlayer } from './EvidencePlayer';

const studies = import.meta.glob<{ default: ComponentType }>('./batch/*/Study.tsx');
const pages = Object.fromEntries(Object.entries(studies).map(([path, load]) => [path.split('/')[2], lazy(load)]));
export const batchItems = [
  { slug: 'settings-sidebar', title: 'Settings Sidebar', priority: 'MenuFold / 首批', kind: 'components', detail: '15 个设置入口、清晰分组与始终可见的名称', source: 'https://animate-ui.com/docs/primitives/base-ui/sidebar' },
  { slug: 'instant-tabs', title: 'Instant Tabs', priority: 'MenuFold / 首批', kind: 'components', detail: '连续选中底色、稳定预览区与即时切换', source: 'https://animate-ui.com/docs/primitives/base-ui/tabs' },
  { slug: 'detail-accordion', title: 'Detail Accordion', priority: 'MenuFold / 首批', kind: 'components', detail: '摘要、高级选项与持续可见的错误提示', source: 'https://animate-ui.com/docs/primitives/base-ui/accordion' },
  { slug: 'auto-height', title: 'Auto Height', priority: 'MenuFold / 首批', kind: 'components', detail: '内容尺寸变化与邻近区域连续让位', source: 'https://animate-ui.com/docs/primitives/animate-ui/auto-height' },
  { slug: 'selectable-cards', title: 'Selectable Cards', priority: 'MenuFold / 首批', kind: 'components', detail: '移动悬停背景、独立勾标与已选边框', source: 'https://ui.aceternity.com/components/card-hover-effect' },
  { slug: 'fixed-dock', title: 'Fixed Dock', priority: 'MenuFold / 首批', kind: 'components', detail: '固定图标位置、悬停标签与轻微按压', source: 'https://magicui.design/docs/components/dock' },
  { slug: 'stateful-button', title: 'Stateful Button', priority: 'MenuFold / 首批', kind: 'components', detail: '等待、成功与保留原因的可恢复失败', source: 'https://ui.aceternity.com/components/stateful-button' },
  { slug: 'number-ticker', title: 'Number Ticker', priority: 'MenuFold / 候选', kind: 'components', detail: '首次直接显示、后续低频数值过渡', source: 'https://magicui.design/docs/components/number-ticker' },
  { slug: 'event-list', title: 'Event List', priority: 'MenuFold / 候选', kind: 'components', detail: '已有事件完整显示，仅新事件短入场', source: 'https://magicui.design/docs/components/animated-list' },
  { slug: 'partition-list', title: 'Partition List', priority: 'MenuFold / 候选', kind: 'components', detail: '三分区菜单项，成功后的状态移动', source: 'https://animate-ui.com/docs/primitives/animate-ui/pinned-list' },
  { slug: 'copy-button', title: 'Copy Button', priority: 'MenuFold / 候选', kind: 'components', detail: '真实复制结果、勾标切换与失败反馈', source: 'https://animate-ui.com/docs/primitives/animate-ui/copy-button' },
  { slug: 'fluid-notch', title: 'Fluid Notch', priority: 'MenuFold / Pro 候选', kind: 'components', detail: '紧凑摘要与文件、音乐、状态详情连续变化', source: 'https://ui.aceternity.com/interactions/fluid-notch' },
  { slug: 'expandable-cards', title: 'Expandable Cards', priority: 'MenuFold / 候选', kind: 'components', detail: '条目到详情的布局过渡与关闭焦点恢复', source: 'https://ui.aceternity.com/components/expandable-card' },
  { slug: 'bento-grid', title: 'Bento Grid', priority: 'MenuFold / 候选', kind: 'components', detail: '按暂存内容安排模块尺寸与阅读层级', source: 'https://ui.aceternity.com/components/bento-grid' },
  { slug: 'stacked-empty-state', title: 'Stacked Empty State', priority: 'MenuFold / Pro 候选', kind: 'components', detail: '叠层卡片、原生图标与单一主要操作', source: 'https://ui.aceternity.com/blocks/empty-states/empty-state-with-stacked-cards' },
  { slug: 'agent-run-integration', title: 'Task Detail', priority: '接入示例', kind: 'screens', detail: '单层工作台外壳、轮次与文件阅读区', source: 'https://www.affectui.com/screens/agent-run', registries: ['agent-run', 'app-shell-inset'], comparison: false },
  { slug: 'task-workbench', title: 'Task Workbench', priority: '接入示例', kind: 'components', detail: '受控任务列表、模型选择与插件配置', source: 'https://www.affectui.com/components/agent-inbox', registries: ['agent-inbox', 'combobox', 'integration-settings'], comparison: false },
  { slug: 'app-shell-inset', title: 'App Shell Inset', priority: 'P0', kind: 'screens', detail: '可独立复用的内嵌外壳、移动侧栏与焦点管理', source: 'https://www.affectui.com/screens/app-shell' },
  { slug: 'questionnaire', title: 'Questionnaire', priority: 'P0 / 公开源码', kind: 'components', detail: '逐题动效、单多选、自由输入与宿主提交边界', source: 'https://animate-ui.com/docs/primitives/base-ui/questionnaire' },
  { slug: 'tool-call-card', title: 'Tool Call Card', priority: 'P1 / 公开源码', kind: 'components', detail: '工具内容容器与结果未捕获、未知状态' },
  { slug: 'reading-tabs', title: 'Reading Tabs', priority: 'P1 / 接入', kind: 'components', detail: '分段阅读导航、键盘操作与面板按需挂载', source: 'https://www.affectui.com/components/segmented-control' },
  { slug: 'agent-tree', title: 'Agent Tree', priority: 'P2 / 只读', kind: 'components', detail: 'Agent 关系导航与明确的未知状态' },
  { slug: 'agent-plan', title: 'Agent Plan', priority: 'P2 / 只读', kind: 'components', detail: 'TodoWrite 快照、当前步骤与完成状态' },
  { slug: 'app-shell-flat', title: 'App Shell Flat', priority: 'P0', kind: 'screens', detail: '紧凑导航、顶部栏与主阅读区' },
  { slug: 'agent-run', title: 'Agent Run', priority: 'P0', kind: 'screens', detail: '自主运行、工具调用、审批与草稿审阅' },
  { slug: 'agent-inbox', title: 'Agent Inbox', priority: 'P0', kind: 'components', detail: '分组任务列表与状态交接' },
  { slug: 'combobox', title: 'Combobox', priority: 'P0', kind: 'components', detail: '搜索、分组选择与键盘操作' },
  { slug: 'model-picker', title: 'Model Picker', priority: 'P1', kind: 'components', detail: '少量模型的快速选择' },
  { slug: 'integration-settings', title: 'Integration Settings', priority: 'P1', kind: 'components', detail: '字段分组、保存与丢弃修改' },
  { slug: 'block-dashboard2', title: 'Dashboard 2', priority: 'Block', kind: 'block', detail: '总览分区与图表层次', source: 'https://www.shadcnblocks.com/block/dashboard2' },
  { slug: 'block-stats-card3', title: 'Stats Card 3', priority: 'Block', kind: 'block', detail: '紧凑指标与预算层次', source: 'https://www.shadcnblocks.com/block/stats-card3' },
  { slug: 'block-stats-card4', title: 'Stats Card 4', priority: 'Block', kind: 'block', detail: '期间指标比较', source: 'https://www.shadcnblocks.com/block/stats-card4' },
  { slug: 'block-chart-card2', title: 'Chart Card 2', priority: 'Block', kind: 'block', detail: '时间范围与趋势图', source: 'https://www.shadcnblocks.com/block/chart-card2' },
  { slug: 'block-settings-members2', title: 'Settings Members 2', priority: 'Block', kind: 'block', detail: '成员设置与操作', source: 'https://www.shadcnblocks.com/block/settings-members2' },
  { slug: 'block-data-table12', title: 'Data Table 12', priority: 'Block', kind: 'block', detail: '多条件筛选表格', source: 'https://www.shadcnblocks.com/block/data-table12' },
  { slug: 'block-data-table24', title: 'Data Table 24', priority: 'Block', kind: 'block', detail: '按日期分组的列表', source: 'https://www.shadcnblocks.com/block/data-table24' },
  { slug: 'block-member-list1', title: 'Member List 1', priority: 'Block', kind: 'block', detail: '紧凑成员列表', source: 'https://www.shadcnblocks.com/block/member-list1' },
  { slug: 'block-timeline1', title: 'Timeline 1', priority: 'Block', kind: 'block', detail: '事件时间线', source: 'https://www.shadcnblocks.com/block/timeline1' },
] as const;

const adaptationNotes: Record<string,string> = {
  'settings-sidebar': '按 MenuFold 保留所有导航名称；侧栏不折叠成仅图标。',
  'instant-tabs': '选中内容立即切换，快速操作不等待前一面板退出；预览区域保持稳定。',
  'fixed-dock': '参考 Magic UI 与 Aceternity 的容器、标签关系；按 MenuFold 决定固定图标位置，取消放大。',
  'partition-list': '官方参考是两组列表；本地适配三分区，宿主确认成功后才更新位置。',
  'event-list': '已有事件首次完整显示；仅新 ID 入场，状态刷新不重播。',
  'number-ticker': '首次与搜索计数立即显示当前值，后续低频更新才进行数值递变。',
  'stacked-empty-state': '保留叠层构图与细微过渡，内容替换为规则、分组和暂存架空状态，只保留一个主要操作。',
  'agent-plan': '本地展示只读 TodoWrite 快照。原版的编辑、Run、Retry 与计时已移除，两侧流程与内容高度不同。',
  'agent-tree': '录像中的时间和成本仅用于参考流程对照；实时组件默认展示关系导航与未知状态。',
  'tool-call-card': '本地适配明确区分执行状态与结果是否捕获，移除了默认计时、Retry 与自动业务推进。',
  'reading-tabs': '原版录像是分段选择控件；本地采用真正的 tabs，方向键默认只移动焦点，确认后才挂载内容。',
  questionnaire: '公开动效 primitive 保留；本地提交、草稿、过期与错误确认由宿主控制。',
};

export function BatchStudy() {
  const slug = window.location.pathname.split('/')[2];
  const item = batchItems.find(item => item.slug === slug);
  const [mode, setMode] = useState<'live' | 'compare'>('live');
  const Page = item && pages[item.slug];
  const comparison = item && (!('comparison' in item) || item.comparison !== false);
  const registries = item ? ('registries' in item ? item.registries : [item.slug]) : [];
  const capture = new URLSearchParams(window.location.search).get('capture') === '1';
  const menufoldOnly = new URLSearchParams(window.location.search).get('collection') === 'menufold';
  const affectuiOnly = new URLSearchParams(window.location.search).get('collection') === 'affectui';
  const affectuiItems = batchItems.filter(item => !item.priority.startsWith('MenuFold') && item.kind !== 'block' && item.slug !== 'questionnaire' && item.priority !== '接入示例');
  const visibleItems = affectuiOnly ? affectuiItems : menufoldOnly ? batchItems.filter(item => item.priority.startsWith('MenuFold')) : batchItems;
  const Container = mode === 'live' && ['agent-run-integration', 'agent-run', 'app-shell-inset', 'app-shell-flat', 'block-dashboard2', 'block-member-list1', 'block-data-table24', 'block-data-table12', 'block-timeline1', 'block-settings-members2'].includes(slug) ? 'div' : 'main';
  if (capture && Page) return <Suspense fallback={<p>Loading…</p>}><Page /></Suspense>;
  if (!item) return <main className="batch-page"><header><span className="batch-eyebrow">COMPONENT LAB</span><h1>{affectuiOnly ? 'AffectUI 组件复查' : menufoldOnly ? 'MenuFold 组件模式' : '组件复刻'}</h1><p>独立组件、完整过程采集与视觉对照。</p><nav className="batch-collections" aria-label="组件集合"><a href="/batch" aria-current={!menufoldOnly && !affectuiOnly ? 'page' : undefined}>全部组件</a><a href="/batch?collection=menufold" aria-current={menufoldOnly ? 'page' : undefined}>MenuFold · 15 项</a>{menufoldOnly && <><a href="/downloads/menufold-components.zip" download>下载本批源码</a><a href="/menufold-review/README.md" target="_blank" rel="noreferrer">动效复查记录 ↗</a><a href="/menufold-color/README.md" target="_blank" rel="noreferrer">配色复查记录 ↗</a></>}<a href="/batch?collection=affectui" aria-current={affectuiOnly ? 'page' : undefined}>AffectUI · 19 项</a>{affectuiOnly && <><a href="/affectui-review/README.md" target="_blank" rel="noreferrer">复查记录 ↗</a><a href="/downloads/affectui-components.zip" download>下载本批源码</a></>}<a href="http://127.0.0.1:4189/">源码组件集合 ↗</a></nav></header>
    <div className="batch-grid">{affectuiOnly && [['/', 'Segmented Control'], ['/otp-input', 'OTP Input'], ['/button', 'Button'], ['/thinking-loader', 'Thinking Loader'], ['/agent-graph', 'Agent Graph'], ['/usage-meter', 'Usage Meter'], ['/autonomy-dial', 'Autonomy Dial'], ['/approval-card', 'Approval Card']].map(([href, title]) => <a className="batch-card" key={href} href={href}><span>AffectUI / 早期组件</span><h2>{title}</h2><p>实时组件、参考与过程对照</p><small>打开实时演示 →</small></a>)}{visibleItems.map(item => <a className="batch-card" key={item.slug} href={`/batch/${item.slug}`}>
      <span>{item.priority}</span><h2>{item.title}</h2><p>{item.detail}</p><small>{pages[item.slug] ? '打开实时演示 →' : '正在采集与实现'}</small>
    </a>)}</div></main>;
  return <Container className="batch-page"><header><a href={item.priority.startsWith('MenuFold') ? '/batch?collection=menufold' : '/batch'}>← {item.priority.startsWith('MenuFold') ? 'MenuFold 组件' : '全部组件'}</a><div className="batch-title"><div><span className="batch-eyebrow">{item.priority} / COMPONENT STUDY</span><h1>{item.title}</h1></div><a href={'source' in item ? item.source : `https://www.affectui.com/${item.kind}/${item.slug}`} target="_blank" rel="noreferrer">原版预览 ↗</a></div><p>{item.detail}</p></header>
    <div className="batch-tabs" role="group" aria-label="演示模式"><button aria-pressed={mode === 'live'} onClick={() => setMode('live')}>实时组件</button>{comparison && <button aria-pressed={mode === 'compare'} onClick={() => setMode('compare')}>双录像对照</button>}<span className="batch-registry-links">{registries.map(name=><a key={name} href={`/r/${name}.json`} target="_blank" rel="noreferrer">{registries.length===1?'源码 registry':name} ↗</a>)}</span></div>
    {mode === 'compare' ? <EvidencePlayer key={slug} slug={slug} note={adaptationNotes[slug]} /> : Page ? <div className="batch-live"><Suspense fallback={<p>加载组件…</p>}><Page /></Suspense></div> : <p role="status">正在采集与实现。</p>}
  </Container>;
}
