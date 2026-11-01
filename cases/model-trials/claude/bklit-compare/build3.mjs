// Build v3: three-layer comparison — 目标(上游) / 复现(skill 产出) / 集成(记账软件哪里用).
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
const root = '/tmp/ui-compare';
const img = `${root}/img`;
await mkdir(img, { recursive: true });
const repo = '/Users/damon/Documents/Projects/记账软件';
const web = `${repo}/web`;

const read = async p => { try { return await readFile(p, 'utf8'); } catch { return null; } };
const copy = async (src, dest) => { try { await copyFile(src, `${img}/${dest}`); return true; } catch { return false; } };
const images = {};
const imgJobs = {
  'gauge-upstream': ['/tmp/bklit-upstream/gauge.png'],
  'heatmap-upstream': ['/tmp/bklit-upstream/heatmap.png'],
  'profit-loss-upstream': ['/tmp/bklit-upstream/profit-loss-line.png'],
  'statcard-area-upstream': ['/tmp/bklit-upstream/stat-card-area.png', '/tmp/bklit-upstream/blocks-index.png'],
  'statcard-line-upstream': ['/tmp/bklit-upstream/stat-card-line.png'],
  'gauge-ours': ['/tmp/c1-gauge/settled-1280.png'],
  'gauge-entry': ['/tmp/c1-gauge/entry-1280.png'],
  'gauge-overspend': ['/tmp/c1-gauge/overspend-1280.png'],
  'gauge-mobile': ['/tmp/c1-gauge/mobile-390.png'],
  'gauge-reduced': ['/tmp/c1-gauge/reduced-motion-1280.png'],
  'heatmap-ours': ['/tmp/c2-heatmap/settled-desktop.png'],
  'heatmap-hover': ['/tmp/c2-heatmap/hover-desktop.png'],
  'heatmap-focus': ['/tmp/c2-heatmap/focus-desktop.png'],
  'heatmap-mobile': ['/tmp/c2-heatmap/settled-mobile.png'],
  'heatmap-reduced': ['/tmp/c2-heatmap/settled-reduced.png'],
  'profitloss-ours': ['/tmp/c3-profitloss/desktop-balance.png'],
  'profitloss-legend': ['/tmp/c3-profitloss/desktop-legend-dim.png'],
  'profitloss-inspect': ['/tmp/c3-profitloss/desktop-inspect.png'],
  'profitloss-mobile': ['/tmp/c3-profitloss/mobile-balance.png'],
  'profitloss-reduced': ['/tmp/c3-profitloss/reduced-balance.png'],
  'statcard-idle': ['/tmp/c4-statcard/desktop-idle.png'],
  'statcard-hover': ['/tmp/c4-statcard/desktop-hover.png'],
  'statcard-mobile': ['/tmp/c4-statcard/mobile-strip.png'],
  'statcard-reduced': ['/tmp/c4-statcard/reduced-motion-hover.png'],
  'radix-variant': ['/tmp/c5-radixcopy/variant-default-1280.png'],
  'radix-variant-switched': ['/tmp/c5-radixcopy/variant-switched-1280.png'],
  'radix-refund': ['/tmp/c5-radixcopy/refund-summary-1280.png'],
  'radix-refund-mobile': ['/tmp/c5-radixcopy/refund-summary-390-reduce.png'],
  'integration-gauge': [`${img}/integration-gauge.png`],
  'integration-heatmap': [`${img}/integration-heatmap.png`],
  'integration-profitloss': [`${img}/integration-profitloss.png`],
  'integration-statcard': [`${img}/integration-statcard.png`],
};
for (const [key, candidates] of Object.entries(imgJobs)) {
  for (const src of candidates) { if (await copy(src, `${key}.png`)) { images[key] = true; break; } }
  if (!images[key]) images[key] = false;
}

// ---------- sources ----------
const upstreamSrc = {
  gauge: await read('/tmp/bklit-upstream/src/gauge.tsx'),
  heatmap: await read('/tmp/bklit-upstream/src/heatmap-chart.tsx'),
  'profit-loss': await read('/tmp/bklit-upstream/src/profit-loss-line.tsx'),
};
const scArea = await read('/tmp/c4-statcard/upstream/stat_card_area.tsx');
const scLine = await read('/tmp/c4-statcard/upstream/stat_card_line.tsx');
const oursSrc = {
  gauge: await read(`${web}/src/components/bklit/Gauge.tsx`),
  heatmap: await read(`${web}/src/components/bklit/Heatmap.tsx`),
  'profit-loss': await read(`${web}/src/components/bklit/ProfitLossLine.tsx`),
  'stat-card': await read(`${web}/src/components/bklit/StatCard.tsx`),
};

// ---------- integration snippets (verbatim, line-numbered) ----------
const files = {
  budget: await read(`${web}/src/budget/BudgetDetails.tsx`),
  dashboard: await read(`${web}/src/variants/rea-shadcn/EnhancedLedgerDashboard.tsx`),
  charts: await read(`${web}/src/variants/rea-shadcn/EnhancedCharts.tsx`),
  pages: await read(`${web}/src/variants/rea-shadcn/EnhancedLedgerPages.tsx`),
  refund: await read(`${web}/src/variants/rea-shadcn/RefundPanel.tsx`),
  toolbar: await read(`${web}/src/variants/VariantToolbar.tsx`),
};
function slice(file, from, to) {
  const lines = (files[file] || '').split('\n');
  return lines.slice(from - 1, to).map((text, i) => `${String(from + i).padStart(4)}  ${text}`).join('\n');
}
const join = (...parts) => parts.join('\n     ⋮\n');

const snippets = {
  gauge: { file: 'src/budget/BudgetDetails.tsx', importLine: 14, body: join(slice('budget', 38, 50)) },
  heatmap: { file: 'src/variants/rea-shadcn/EnhancedLedgerDashboard.tsx', importLine: 26, body: join(slice('dashboard', 188, 195), slice('dashboard', 280, 283)) },
  'profit-loss': { file: 'src/variants/rea-shadcn/EnhancedCharts.tsx', importLine: 6, body: join(slice('charts', 125, 131), slice('charts', 179, 188)) },
  'stat-card': { file: 'src/variants/rea-shadcn/EnhancedLedgerPages.tsx', importLine: 26, body: join(slice('pages', 241, 247), slice('pages', 255, 266)) },
  refund: { file: 'src/variants/rea-shadcn/RefundPanel.tsx', importLine: 13, body: join(slice('refund', 85, 91)) },
  toolbar: { file: 'src/variants/VariantToolbar.tsx', importLine: 3, body: join(slice('toolbar', 27, 38)) },
};

const records = {};
for (const name of ['gauge', 'heatmap', 'profit-loss-line', 'stat-card']) {
  records[name] = (await read(`${repo}/research/ui-recast/2026-10-30-${name}.md`)) || '（记录文件缺失）';
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fig = (label, key, note = '') => images[key]
  ? `<figure><figcaption>${label}${note ? ` · <span class="dim">${note}</span>` : ''}</figcaption><img src="img/${key}.png" loading="lazy"></figure>`
  : `<figure class="absent"><figcaption>${label}</figcaption><div class="noimg">未捕获</div></figure>`;
const strip = items => `<div class="strip">${items.map(([l, k, n]) => fig(l, k, n)).join('')}</div>`;
const code = (label, src, note = '') => src
  ? `<div class="codecol"><div class="codehead">${label} · ${src.split('\n').length} 行${note ? ` · <span class="dim">${note}</span>` : ''}</div><pre>${esc(src)}</pre></div>`
  : `<div class="codecol"><div class="codehead">${label}</div><pre>（源码未取得）</pre></div>`;
const snippet = s => `<div class="codecol"><div class="codehead">集成点 · ${s.file}:${s.importLine}（import）+ 下方行号为实际行号</div><pre class="snip">${esc(s.body)}</pre></div>`;
const layer = (cls, tag, inner) => `<div class="layer ${cls}"><div class="ltag">${tag}</div>${inner}</div>`;
const details = (name, title) => `<details><summary>${title}</summary><pre>${esc(records[name])}</pre></details>`;
const L1 = (label, key, codeLabel, src, note) => layer('l1', '第一层 · 目标 —— bklit 原版长什么样',
  `${fig(label, key, 'bklit.com 官方页')}${src ? `<div class="codepair">${code(codeLabel, src, '点击展开/收起')}</div>` : ''}`);
const L2 = (oursKey, stripItems, codeLabel, src) => layer('l2', '第二层 · 复现 —— ui-recast 造出来的组件',
  `${fig('本项目复现', oursKey)}${strip(stripItems)}<div class="codepair">${code(codeLabel, src, '适配后源码')}</div>`);
const L3 = (nav, s, shotKey) => layer('l3', '第三层 · 集成 —— 放进了记账软件哪里',
  `<div class="nav">📍 应用里看：${nav}</div><div class="pair">${fig('应用内实景（demo 数据）', shotKey, '今日截图')}${snippet(s)}</div>`);

const html = `<!doctype html>
<html lang="zh"><head><meta charset="utf-8">
<title>ui-recast 三层对照 · 目标 / 复现 / 集成</title>
<style>
 body { font: 14px/1.6 -apple-system, "PingFang SC", sans-serif; margin: 0; background: #fafafa; color: #18181b; }
 header { padding: 26px 32px 16px; border-bottom: 1px solid #e4e4e7; background: #fff; position: sticky; top: 0; z-index: 5; }
 h1 { font-size: 20px; margin: 0 0 6px; } .sub { color: #71717a; font-size: 12.5px; }
 .sub a { color: #617991; }
 .legend { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
 .legend span { font-size: 12px; padding: 2px 10px; border-radius: 99px; border: 1px solid #e4e4e7; background: #fff; }
 main { padding: 24px 32px 64px; max-width: 1560px; }
 section { margin-bottom: 42px; background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px 24px; }
 h2 { font-size: 16px; margin: 0 0 4px; } .map { font-size: 12px; color: #71717a; margin-bottom: 14px; }
 .layer { border: 1px solid #ececef; border-radius: 10px; padding: 14px 16px; margin-top: 14px; background: #fff; }
 .ltag { font-size: 12px; font-weight: 700; margin-bottom: 10px; padding: 3px 10px; border-radius: 6px; display: inline-block; }
 .l1 .ltag { background: #f4f4f5; color: #71717a; }
 .l2 .ltag { background: #e4e4e7; color: #18181b; }
 .l3 .ltag { background: #eef2f6; color: #617991; }
 .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
 .pair figure, .strip figure { margin: 0; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; background: #fff; }
 figcaption { font-size: 12px; padding: 6px 10px; background: #f4f4f5; border-bottom: 1px solid #e4e4e7; font-weight: 600; }
 figcaption .dim { font-weight: 400; color: #71717a; }
 img { width: 100%; display: block; }
 .strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
 .absent .noimg { padding: 48px 10px; text-align: center; color: #a1a1aa; font-size: 12px; }
 .codepair { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 12px; }
 .codecol { border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; background: #fff; }
 .codehead { font-size: 12px; font-weight: 600; padding: 6px 10px; background: #f4f4f5; border-bottom: 1px solid #e4e4e7; }
 .codehead .dim { font-weight: 400; color: #71717a; }
 pre { margin: 0; padding: 12px 14px; font: 11.5px/1.55 ui-monospace, "SF Mono", Menlo, monospace; white-space: pre; overflow: auto; color: #3f3f46; max-height: 560px; }
 pre.snip { max-height: 460px; background: #fbfbfc; }
 details { margin-top: 12px; border: 1px solid #e4e4e7; border-radius: 8px; background: #fafafa; }
 summary { cursor: pointer; padding: 8px 12px; font-size: 12.5px; font-weight: 600; }
 details > pre { border-top: 1px solid #e4e4e7; white-space: pre-wrap; word-break: break-word; max-height: 480px; }
 .note { font-size: 12.5px; background: #f6f8fa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 10px 14px; margin: 12px 0 0; color: #3f3f46; }
 .nav { font-size: 13px; font-weight: 600; background: #eef2f6; border: 1px solid #d8e0e8; color: #3d5568; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; }
 .tag { display: inline-block; font-size: 11px; padding: 1px 8px; border-radius: 99px; background: #eef2f6; color: #617991; margin-left: 8px; vertical-align: 1px; }
 @media (max-width: 980px) { .pair { grid-template-columns: 1fr; } }
</style></head><body>
<header>
 <h1>ui-recast 三层对照：目标 → 复现 → 集成 <span class="tag">Wave C</span></h1>
 <div class="sub">每个组件纵向三层：<b>第一层·目标</b>（调研选中的上游原版：截图 + 源码）→ <b>第二层·复现</b>（ui-recast 造出来、落在 components/bklit/ 的组件：源码 + 截图）→ <b>第三层·集成</b>（放进记账软件的确切位置：集成点源码行号 + 应用内实景 + 导航路径）。上游 bklit-ui @ cfaa1d0a（MIT）。本地实机：<a href="http://localhost:5173/?mode=demo">localhost:5173 demo</a>。生成于 2026-10-31。</div>
 <div class="legend"><span>第一层 · 灰 = 原版参考</span><span>第二层 · 深灰 = 本仓库产出</span><span>第三层 · 蓝灰 = 集成进应用</span></div>
</header>
<main>

<section>
 <h2>1 · Gauge 预算表盘</h2>
 <div class="map">packages/ui/src/charts/gauge.tsx → components/bklit/Gauge.tsx → src/budget/BudgetDetails.tsx</div>
 ${L1('bklit 原版（文档页 demo）', 'gauge-upstream', '上游 gauge.tsx', upstreamSrc.gauge)}
 ${L2('gauge-ours', [['入场动画帧', 'gauge-entry', '刻度错峰'], ['超支状态', 'gauge-overspend', '≥90% 转支出红'], ['移动端 390px', 'gauge-mobile'], ['reduced-motion', 'gauge-reduced', '300ms 内就位']], '本项目 Gauge.tsx（适配后）', oursSrc.gauge)}
 ${L3('设置 → 预算分析 · 月度预算卡（非 compact 布局）', snippets.gauge, 'integration-gauge')}
 <div class="note">有意偏离：<b>上游 reduced-motion 只清 duration 保留 stagger delay（最长 1.1s 仍逐个弹出）→ 本地连 delay 清零</b>；NumberFlow 未引入，中心数字用 animate() 计数；linear 朝向/渐变填充/暗色未移植（见记录）。颜色法：平时净额蓝灰，≥90% 切支出红——单色相 + 信号色。</div>
 ${details('gauge', 'ui-recast 五段记录：期望目标 / 实际构建 / 对比表 / 剩余差异 / Skill 反馈')}
</section>

<section>
 <h2>2 · Heatmap 每日支出月历</h2>
 <div class="map">packages/ui/src/charts/heatmap/heatmap-chart.tsx → components/bklit/Heatmap.tsx → EnhancedLedgerDashboard.tsx（rhs-heatmap-card）</div>
 ${L1('bklit 原版（文档页 demo）', 'heatmap-upstream', '上游 heatmap-chart.tsx', upstreamSrc.heatmap)}
 ${L2('heatmap-ours', [['hover tooltip', 'heatmap-hover', '日期·金额·笔数'], ['键盘焦点', 'heatmap-focus', '方向键巡格'], ['移动端 390px', 'heatmap-mobile'], ['reduced-motion', 'heatmap-reduced', '首帧全显']], '本项目 Heatmap.tsx（适配后）', oursSrc.heatmap)}
 ${L3('总览页 · 「支出热力」卡（每日支出图旁；个人/共享同口径数据）', snippets.heatmap, 'integration-heatmap')}
 <div class="note">有意偏离：<b>上游默认 1600ms 淡入 → 按 Emil 规范收敛 820ms 波浪错峰</b>；行=周/列=星期的月历排布是本项目需求；5 级明度全从支出红 color-mix 派生，0 支出=近背景灰；空月出空态（ExpenseHeatmap 包装）。</div>
 ${details('heatmap', 'ui-recast 五段记录')}
</section>

<section>
 <h2>3 · Profit / Loss Line 每日结余</h2>
 <div class="map">packages/ui/src/charts/profit-loss-line.tsx → components/bklit/ProfitLossLine.tsx（+ profit-loss-segments.ts）→ EnhancedCharts.tsx 每日收支卡 Tabs</div>
 ${L1('bklit 原版（文档页 demo）', 'profit-loss-upstream', '上游 profit-loss-line.tsx', upstreamSrc['profit-loss'])}
 ${L2('profitloss-ours', [['图例 hover 调暗对侧', 'profitloss-legend', '0.25/0.2s'], ['方向键巡检', 'profitloss-inspect', 'role=slider'], ['移动端 tap', 'profitloss-mobile'], ['reduced-motion', 'profitloss-reduced', '全直跳']], '本项目 ProfitLossLine.tsx（适配后）', oursSrc['profit-loss'])}
 ${L3('统计页 · 每日收支卡切「结余」标签（总览页展开「查看收支趋势与分类分析」也有同一张卡）', snippets['profit-loss'], 'integration-profitloss')}
 <div class="note">上游缺陷修复：<b>精确零值不分段（[5, 0, −3] 整段按最后非零符号着色，正数开头画成全红）→ 本地把零值当边界锚点，两侧各保本色</b>。算法拆 profit-loss-segments.ts 供 node 测试；结余视图作为 Tabs 挂进既有卡，没有新开一张卡。</div>
 ${details('profit-loss-line', 'ui-recast 五段记录')}
</section>

<section>
 <h2>4 · stat-card 资产账户卡</h2>
 <div class="map">blocks stat-card-area-01 / stat-card-line-01 → components/bklit/StatCard.tsx → EnhancedLedgerPages.tsx AccountsPage（overlay + strip）</div>
 ${L1('bklit 原版', 'statcard-area-upstream', '上游 stat_card_area.tsx / stat_card_line.tsx', scArea && scLine ? scArea + '\n\n/* ── stat_card_line.tsx ── */\n\n' + scLine : (scArea || scLine))}
 ${L2('statcard-idle', [['hover 揭示趋势线', 'statcard-hover', '行背景曲线层'], ['移动端详情 toggle', 'statcard-mobile', '44px strip+较月初'], ['reduced-motion', 'statcard-reduced', '直接切换']], '本项目 StatCard.tsx（适配后）', oursSrc['stat-card'])}
 ${L3('资产页 · 桌面悬停账户行现趋势层；手机端在账户详情页点余额块展开 strip', snippets['stat-card'], 'integration-statcard')}
 <div class="note">模式级反转：<b>上游「图表常驻 + hover 读数」放不进 60px 行 → 反转为 hover 揭示，曲线作行背景层（aria-hidden、pointer-events:none）</b>；隐藏金额时 overlay/strip 强制抑制（防曲线形状泄露余额）；balanceSeries 每日 stateAtDate 快照同源。</div>
 ${details('stat-card', 'ui-recast 五段记录')}
</section>

<section>
 <h2>5 · 附：radix DataList / SegmentedControl（源码拷贝流程，非 ui-recast）</h2>
 <div class="map">radix-ui/themes @1faff10a → components/radix-copies/（MIT 归档，见其 ATTRIBUTION.md）→ 退款摘要 + 变体切换器</div>
 ${layer('l2', '第二层 · 复现 —— 拷贝并剥离 Themes 依赖后的组件', `<div class="codepair">${code('本项目 SegmentedControl.tsx / DataList.tsx', '零 JS 指示器（:nth-child 定宽 + active 选择器平移）+ 交叉淡入双标签；DataList 保留 dl>div>dt/dd 语义。完整源码见仓库 components/radix-copies/。')}</div>`)}
 ${layer('l3', '第三层 · 集成 —— 放进了记账软件哪里', `<div class="nav">📍 退款弹窗摘要三行（RefundPanel）· 非增强模式的变体切换器（VariantToolbar）</div><div class="pair">${fig('退款摘要（1280）', 'radix-refund', '原支出/已退/实付')}${snippet(snippets.refund)}${fig('变体切换器·切换后', 'radix-variant-switched', '白药丸滑到 active')}${snippet(snippets.toolbar)}</div><div class="strip">${strip([['退款摘要 · 390px reduce', 'radix-refund-mobile'], ['变体切换器·默认', 'radix-variant']])}</div>`)}
 <div class="note">顺手删了 VariantToolbar 的死分支（rea-shadcn 下 toolbar 不渲染）与 6 条手搓 CSS；aria 升级 radiogroup+radio（roving tabindex）。</div>
</section>

</main></body></html>`;
await writeFile(`${root}/index.html`, html);
const missing = Object.entries(images).filter(([, v]) => !v).map(([k]) => k);
console.log('images ok:', Object.values(images).filter(Boolean).length, '/', Object.keys(images).length);
if (missing.length) console.log('MISSING IMAGES:', missing.join(', '));
console.log('snippets:', Object.fromEntries(Object.entries(snippets).map(([k, v]) => [k, v.body.split('\n').length + 'L'])));
console.log('PAGE_OK');
