// Build /tmp/ui-compare/index.html: bklit upstream vs local reproduction, per component.
import { mkdir, copyFile, readFile } from 'node:fs/promises';
const root = '/tmp/ui-compare';
const img = `${root}/img`;
await mkdir(img, { recursive: true });

const repo = '/Users/damon/Documents/Projects/记账软件';
const copyJobs = [
  // upstream
  ['/tmp/bklit-upstream/gauge.png', 'gauge-upstream.png'],
  ['/tmp/bklit-upstream/heatmap.png', 'heatmap-upstream.png'],
  ['/tmp/bklit-upstream/profit-loss-line.png', 'profit-loss-upstream.png'],
  ['/tmp/bklit-upstream/stat-card-area.png', 'statcard-area-upstream.png'],
  ['/tmp/bklit-upstream/stat-card-line.png', 'statcard-line-upstream.png'],
  ['/tmp/bklit-upstream/blocks-index.png', 'blocks-upstream.png'],
  // ours — gauge
  ['/tmp/c1-gauge/settled-1280.png', 'gauge-ours.png'],
  ['/tmp/c1-gauge/entry-1280.png', 'gauge-entry.png'],
  ['/tmp/c1-gauge/overspend-1280.png', 'gauge-overspend.png'],
  ['/tmp/c1-gauge/mobile-390.png', 'gauge-mobile.png'],
  ['/tmp/c1-gauge/reduced-motion-1280.png', 'gauge-reduced.png'],
  // ours — heatmap
  ['/tmp/c2-heatmap/settled-desktop.png', 'heatmap-ours.png'],
  ['/tmp/c2-heatmap/hover-desktop.png', 'heatmap-hover.png'],
  ['/tmp/c2-heatmap/focus-desktop.png', 'heatmap-focus.png'],
  ['/tmp/c2-heatmap/settled-mobile.png', 'heatmap-mobile.png'],
  ['/tmp/c2-heatmap/settled-reduced.png', 'heatmap-reduced.png'],
  // ours — profit/loss
  ['/tmp/c3-profitloss/desktop-balance.png', 'profitloss-ours.png'],
  ['/tmp/c3-profitloss/desktop-legend-dim.png', 'profitloss-legend.png'],
  ['/tmp/c3-profitloss/desktop-inspect.png', 'profitloss-inspect.png'],
  ['/tmp/c3-profitloss/mobile-balance.png', 'profitloss-mobile.png'],
  ['/tmp/c3-profitloss/reduced-balance.png', 'profitloss-reduced.png'],
  // ours — stat card
  ['/tmp/c4-statcard/desktop-idle.png', 'statcard-idle.png'],
  ['/tmp/c4-statcard/desktop-hover.png', 'statcard-hover.png'],
  ['/tmp/c4-statcard/mobile-strip.png', 'statcard-mobile.png'],
  ['/tmp/c4-statcard/reduced-motion-hover.png', 'statcard-reduced.png'],
  // ours — radix copies (C5)
  ['/tmp/c5-radixcopy/variant-default-1280.png', 'radix-variant.png'],
  ['/tmp/c5-radixcopy/variant-switched-1280.png', 'radix-variant-switched.png'],
  ['/tmp/c5-radixcopy/refund-summary-1280.png', 'radix-refund.png'],
  ['/tmp/c5-radixcopy/refund-summary-390-reduce.png', 'radix-refund-mobile.png'],
];
const copied = [], missing = [];
for (const [src, dest] of copyJobs) {
  try { await copyFile(src, `${img}/${dest}`); copied.push(dest); }
  catch { missing.push(`${src}`); }
}
const md = {};
for (const name of ['gauge', 'heatmap', 'profit-loss-line', 'stat-card']) {
  try { md[name] = await readFile(`${repo}/research/ui-recast/2026-10-30-${name}.md`, 'utf8'); }
  catch { md[name] = '（记录文件缺失）'; }
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const imgExists = n => copied.includes(n);
const cell = (label, file, note = '') => imgExists(file)
  ? `<figure><figcaption>${label}${note ? ` · <span class="dim">${note}</span>` : ''}</figcaption><img src="img/${file}" loading="lazy"></figure>`
  : `<figure class="absent"><figcaption>${label}</figcaption><div class="noimg">截图缺失</div></figure>`;
const strip = files => `<div class="strip">${files.map(([l, f, n]) => cell(l, f, n)).join('')}</div>`;
const details = (name, title) => `<details><summary>${title}</summary><pre>${esc(md[name])}</pre></details>`;

const html = `<!doctype html>
<html lang="zh"><head><meta charset="utf-8">
<title>ui-recast 复现对照 · bklit 原版 vs 本项目</title>
<style>
 body { font: 14px/1.6 -apple-system, "PingFang SC", sans-serif; margin: 0; background: #fafafa; color: #18181b; }
 header { padding: 28px 32px 18px; border-bottom: 1px solid #e4e4e7; background: #fff; position: sticky; top: 0; }
 h1 { font-size: 20px; margin: 0 0 6px; } .sub { color: #71717a; font-size: 12.5px; }
 main { padding: 24px 32px 64px; max-width: 1500px; }
 section { margin-bottom: 40px; background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px 24px; }
 h2 { font-size: 16px; margin: 0 0 4px; } .map { font-size: 12px; color: #71717a; margin-bottom: 14px; }
 .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
 .pair figure { margin: 0; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; background: #fff; }
 figcaption { font-size: 12px; padding: 6px 10px; background: #f4f4f5; border-bottom: 1px solid #e4e4e7; font-weight: 600; }
 figcaption .dim { font-weight: 400; color: #71717a; }
 img { width: 100%; display: block; }
 .strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin-top: 14px; }
 .strip figure { margin: 0; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; }
 .absent .noimg { padding: 40px 10px; text-align: center; color: #a1a1aa; font-size: 12px; }
 details { margin-top: 14px; border: 1px solid #e4e4e7; border-radius: 8px; background: #fafafa; }
 summary { cursor: pointer; padding: 8px 12px; font-size: 12.5px; font-weight: 600; }
 pre { margin: 0; padding: 12px 16px 16px; font: 11.5px/1.55 ui-monospace, "SF Mono", Menlo, monospace; white-space: pre-wrap; word-break: break-word; color: #3f3f46; border-top: 1px solid #e4e4e7; max-height: 480px; overflow: auto; }
 .tag { display: inline-block; font-size: 11px; padding: 1px 8px; border-radius: 99px; background: #eef2f6; color: #617991; margin-left: 8px; vertical-align: 1px; }
 .note { font-size: 12.5px; background: #f6f8fa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 10px 14px; margin: 10px 0 0; color: #3f3f46; }
 @media (max-width: 900px) { .pair { grid-template-columns: 1fr; } }
</style></head><body>
<header>
 <h1>ui-recast 复现对照 · bklit 原版 vs 本项目 <span class="tag">Wave C</span></h1>
 <div class="sub">左侧 = 上游 bklit.com 文档页原版 · 右侧 = agent 在本项目复现并集成后的样子 · 每节可展开 ui-recast 五段记录全文（期望目标 vs 实际构建）。生成于 2026-10-31。</div>
</header>
<main>

<section>
 <h2>1 · Gauge 预算表盘</h2>
 <div class="map">上游 packages/ui/src/charts/gauge-chart.tsx → 本项目 components/bklit/Gauge.tsx → 集成于预算分析卡（设置 → 预算分析）</div>
 <div class="pair">
  ${cell('bklit 原版（文档页 demo）', 'gauge-upstream.png', 'bklit.com/charts/gauge')}
  ${cell('本项目复现（月度预算卡）', 'gauge-ours.png', '已用 72% 稳定态')}
 </div>
 <div class="strip">
  ${strip([['复现 · 入场动画帧', 'gauge-entry.png', '刻度错峰弹出'], ['复现 · 超支状态', 'gauge-overspend.png', '≥90% 整盘转支出红'], ['复现 · 移动端 390px', 'gauge-mobile.png'], ['复现 · reduced-motion', 'gauge-reduced.png', '300ms 内全就位']]).trim()}
 </div>
 <div class="note">有意偏离：reduced-motion 下上游保留 stagger delay（最长 1.1s 仍逐个弹出），本地连 delay 一并清零；NumberFlow 未引入，中心数字用 animate() 计数。</div>
 ${details('gauge', '展开：ui-recast 记录全文（期望目标 / 实际构建 / 对比表 / 剩余差异 / Skill 反馈）')}
</section>

<section>
 <h2>2 · Heatmap 每日支出月历热力</h2>
 <div class="map">上游 packages/ui/src/charts/heatmap-chart.tsx → 本项目 components/bklit/Heatmap.tsx → 集成于总览页（每日支出区域旁）</div>
 <div class="pair">
  ${cell('bklit 原版（文档页 demo）', 'heatmap-upstream.png', 'bklit.com/charts/heatmap')}
  ${cell('本项目复现（支出热力卡）', 'heatmap-ours.png', '支出红单色相 5 级明度')}
 </div>
 <div class="strip">
  ${strip([['复现 · hover tooltip', 'heatmap-hover.png', '日期 · 金额 · 笔数'], ['复现 · 键盘焦点', 'heatmap-focus.png', '方向键巡格'], ['复现 · 移动端 390px', 'heatmap-mobile.png', '格子 ~44px'], ['复现 · reduced-motion', 'heatmap-reduced.png', '首帧全显']]).trim()}
 </div>
 <div class="note">上游默认 1600ms 淡入，按 Emil 时长规范收敛为 820ms 窗波浪错峰；0 支出 = 近背景灰，不引入新色相。</div>
 ${details('heatmap', '展开：ui-recast 记录全文')}
</section>

<section>
 <h2>3 · Profit / Loss Line 每日结余</h2>
 <div class="map">上游 packages/ui/src/charts/profit-loss-line-chart.tsx → 本项目 components/bklit/ProfitLossLine.tsx → 集成于「每日收支」卡的结余标签页</div>
 <div class="pair">
  ${cell('bklit 原版（文档页 demo）', 'profit-loss-upstream.png', 'bklit.com/charts/profit-loss-line')}
  ${cell('本项目复现（结余视图）', 'profitloss-ours.png', '零线上绿下红')}
 </div>
 <div class="strip">
  ${strip([['复现 · 图例 hover 调暗对侧', 'profitloss-legend.png', '0.25/0.2s 上游常量'], ['复现 · 方向键巡检', 'profitloss-inspect.png', 'role=slider'], ['复现 · 移动端 tap', 'profitloss-mobile.png'], ['复现 · reduced-motion', 'profitloss-reduced.png', '全直跳']]).trim()}
 </div>
 <div class="note">修了上游缺陷：精确零值不分段（[5, 0, −3] 整段按最后非零符号着色）；本地把零值当边界锚点，两侧各保本色。</div>
 ${details('profit-loss-line', '展开：ui-recast 记录全文')}
</section>

<section>
 <h2>4 · stat-card 资产账户卡</h2>
 <div class="map">上游 blocks stat-card-area-01 / stat-card-line-01 → 本项目 components/bklit/StatCard.tsx → 集成于资产页账户行（hover 揭示趋势层）</div>
 <div class="pair">
  ${imgExists('statcard-area-upstream.png') ? cell('bklit 原版（block 页）', 'statcard-area-upstream.png', 'stat-card-area-01') : cell('bklit 原版（blocks 目录）', 'blocks-upstream.png', 'block 页未单独命中时退目录页')}
  ${cell('本项目复现（默认态）', 'statcard-idle.png', '行内无图')}
 </div>
 <div class="strip">
  ${strip([['复现 · hover 揭示趋势线', 'statcard-hover.png', '行内背景曲线层'], ['复现 · 移动端详情 toggle', 'statcard-mobile.png', '44px strip + 较月初'], ['复现 · reduced-motion', 'statcard-reduced.png', '直接切换无过渡']]).trim()}
 </div>
 <div class="note">上游是「图表常驻 + hover 读数」，60px 行放不下 → 反转为 hover 揭示；曲线作行背景层避免卡片套卡；隐藏金额模式强制抑制防形状泄露。</div>
 ${details('stat-card', '展开：ui-recast 记录全文')}
</section>

<section>
 <h2>5 · 附：radix DataList / SegmentedControl（源码拷贝，非 ui-recast）</h2>
 <div class="map">radix-ui/themes @1faff10a → components/radix-copies/（MIT 已归档）→ 变体切换器 + 退款摘要</div>
 <div class="strip">
  ${strip([['变体切换器 · 默认', 'radix-variant.png'], ['变体切换器 · 切换后', 'radix-variant-switched.png', '白药丸滑到 active 段'], ['退款摘要三行', 'radix-refund.png', '原支出/已退/实付'], ['退款摘要 · 390px reduce', 'radix-refund-mobile.png']]).trim()}
 </div>
</section>

</main></body></html>`;
await import('node:fs/promises').then(fs => fs.writeFile(`${root}/index.html`, html));
console.log('copied:', copied.length, 'missing:', missing.length);
if (missing.length) console.log('MISSING:\n' + missing.join('\n'));
console.log('PAGE_OK');
