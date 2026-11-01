// Build v2: /tmp/ui-compare/index.html — upstream vs reproduction, images + source + records.
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
const root = '/tmp/ui-compare';
const img = `${root}/img`;
await mkdir(img, { recursive: true });
const repo = '/Users/damon/Documents/Projects/记账软件';
const web = `${repo}/web`;

const read = async p => { try { return await readFile(p, 'utf8'); } catch { return null; } };
const copy = async (src, dest) => { try { await copyFile(src, `${img}/${dest}`); return true; } catch { return false; } };

// ---------- image jobs ----------
const images = {}; // key -> boolean present
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
};
for (const [key, candidates] of Object.entries(imgJobs)) {
  for (const src of candidates) { if (await copy(src, `${key}.png`)) { images[key] = true; break; } }
  if (!images[key]) images[key] = false;
}

// ---------- source code ----------
const upstreamSrc = {
  gauge: await read('/tmp/bklit-upstream/src/gauge.tsx'),
  heatmap: await read('/tmp/bklit-upstream/src/heatmap-chart.tsx'),
  'profit-loss': await read('/tmp/bklit-upstream/src/profit-loss-line.tsx'),
};
const statcardArea = await read('/tmp/c4-statcard/upstream/stat_card_area.tsx');
const statcardLine = await read('/tmp/c4-statcard/upstream/stat_card_line.tsx');
const oursSrc = {
  gauge: await read(`${web}/src/components/bklit/Gauge.tsx`),
  heatmap: await read(`${web}/src/components/bklit/Heatmap.tsx`),
  'profit-loss': await read(`${web}/src/components/bklit/ProfitLossLine.tsx`),
  'stat-card': await read(`${web}/src/components/bklit/StatCard.tsx`),
};
const records = {};
for (const name of ['gauge', 'heatmap', 'profit-loss-line', 'stat-card']) {
  records[name] = (await read(`${repo}/research/ui-recast/2026-10-30-${name}.md`)) || '（记录文件缺失）';
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fig = (label, key, note = '') => images[key]
  ? `<figure><figcaption>${label}${note ? ` · <span class="dim">${note}</span>` : ''}</figcaption><img src="img/${key}.png" loading="lazy"></figure>`
  : `<figure class="absent"><figcaption>${label}</figcaption><div class="noimg">原版页未捕获（404）——看下方源码对比</div></figure>`;
const code = (label, src) => src
  ? `<div class="codecol"><div class="codehead">${label} · ${src.split('\n').length} 行</div><pre>${esc(src)}</pre></div>`
  : `<div class="codecol"><div class="codehead">${label}</div><pre>（源码未取得）</pre></div>`;
const strip = items => `<div class="strip">${items.map(([l, k, n]) => fig(l, k, n)).join('')}</div>`;
const details = (name, title) => `<details><summary>${title}</summary><pre>${esc(records[name])}</pre></details>`;

const html = `<!doctype html>
<html lang="zh"><head><meta charset="utf-8">
<title>ui-recast 对照 · bklit 原版 vs 本项目复现</title>
<style>
 body { font: 14px/1.6 -apple-system, "PingFang SC", sans-serif; margin: 0; background: #fafafa; color: #18181b; }
 header { padding: 26px 32px 16px; border-bottom: 1px solid #e4e4e7; background: #fff; position: sticky; top: 0; z-index: 5; }
 h1 { font-size: 20px; margin: 0 0 6px; } .sub { color: #71717a; font-size: 12.5px; }
 .sub a { color: #617991; }
 main { padding: 24px 32px 64px; max-width: 1560px; }
 section { margin-bottom: 42px; background: #fff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px 24px; }
 h2 { font-size: 16px; margin: 0 0 4px; } .map { font-size: 12px; color: #71717a; margin-bottom: 14px; }
 .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
 .pair figure, .strip figure { margin: 0; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; background: #fff; }
 figcaption { font-size: 12px; padding: 6px 10px; background: #f4f4f5; border-bottom: 1px solid #e4e4e7; font-weight: 600; }
 figcaption .dim { font-weight: 400; color: #71717a; }
 img { width: 100%; display: block; }
 .strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin-top: 14px; }
 .absent .noimg { padding: 48px 10px; text-align: center; color: #a1a1aa; font-size: 12px; }
 .codepair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
 .codecol { border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; background: #fff; }
 .codehead { font-size: 12px; font-weight: 600; padding: 6px 10px; background: #f4f4f5; border-bottom: 1px solid #e4e4e7; }
 pre { margin: 0; padding: 12px 14px; font: 11.5px/1.55 ui-monospace, "SF Mono", Menlo, monospace; white-space: pre; overflow: auto; color: #3f3f46; max-height: 560px; }
 details { margin-top: 14px; border: 1px solid #e4e4e7; border-radius: 8px; background: #fafafa; }
 summary { cursor: pointer; padding: 8px 12px; font-size: 12.5px; font-weight: 600; }
 details > pre { border-top: 1px solid #e4e4e7; white-space: pre-wrap; word-break: break-word; max-height: 480px; }
 .note { font-size: 12.5px; background: #f6f8fa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 10px 14px; margin: 12px 0 0; color: #3f3f46; }
 .tag { display: inline-block; font-size: 11px; padding: 1px 8px; border-radius: 99px; background: #eef2f6; color: #617991; margin-left: 8px; vertical-align: 1px; }
 .up { color: #b45309; } .down { color: #15803d; }
 @media (max-width: 980px) { .pair, .codepair { grid-template-columns: 1fr; } }
</style></head><body>
<header>
 <h1>ui-recast 对照 · bklit 原版 vs 本项目复现 <span class="tag">Wave C</span></h1>
 <div class="sub">每节三层：① 截图对比（左原版 / 右复现）② 源码左右对比（上游 tsx vs 适配后 tsx）③ 可展开的 ui-recast 五段记录。上游 revision cfaa1d0a（MIT，见 public/licenses/）。本地实机：<a href="http://localhost:5173/?mode=demo">localhost:5173 demo 模式</a>。生成于 2026-10-31。</div>
</header>
<main>

<section>
 <h2>1 · Gauge 预算表盘</h2>
 <div class="map">packages/ui/src/charts/gauge-chart.tsx → components/bklit/Gauge.tsx → 设置→预算分析（月度预算卡）</div>
 <div class="pair">${fig('bklit 原版', 'gauge-upstream', 'bklit.com 文档页')}${fig('本项目复现', 'gauge-ours', '已用 72% 稳定态')}</div>
 <div class="strip">${[['入场动画帧', 'gauge-entry', '刻度错峰'], ['超支状态', 'gauge-overspend', '≥90% 转支出红'], ['移动端 390px', 'gauge-mobile'], ['reduced-motion', 'gauge-reduced', '300ms 内就位']].map(i => fig(...i)).join('')}</div>
 <div class="codepair">${code('上游 gauge-chart.tsx', upstreamSrc.gauge)}${code('本项目 Gauge.tsx', oursSrc.gauge)}</div>
 <div class="note">有意偏离：<span class="up">上游 reduced-motion 只清 duration 保留 stagger delay（最长 1.1s 仍逐个弹出）→ 本地连 delay 清零</span>；NumberFlow 未引入，中心数字用 animate() 计数；linear 朝向 / 渐变填充 / 暗色未移植（见记录）。</div>
 ${details('gauge', 'ui-recast 五段记录：期望目标 / 实际构建 / 对比表 / 剩余差异 / Skill 反馈')}
</section>

<section>
 <h2>2 · Heatmap 每日支出月历</h2>
 <div class="map">packages/ui/src/charts/heatmap-chart.tsx → components/bklit/Heatmap.tsx → 总览页「支出热力」卡</div>
 <div class="pair">${fig('bklit 原版', 'heatmap-upstream', 'bklit.com 文档页')}${fig('本项目复现', 'heatmap-ours', '支出红 5 级明度')}</div>
 <div class="strip">${[['hover tooltip', 'heatmap-hover', '日期·金额·笔数'], ['键盘焦点', 'heatmap-focus', '方向键巡格'], ['移动端 390px', 'heatmap-mobile'], ['reduced-motion', 'heatmap-reduced', '首帧全显']].map(i => fig(...i)).join('')}</div>
 <div class="codepair">${code('上游 heatmap-chart.tsx', upstreamSrc.heatmap)}${code('本项目 Heatmap.tsx', oursSrc.heatmap)}</div>
 <div class="note">有意偏离：<span class="up">上游默认 1600ms 淡入 → 按 Emil 规范收敛 820ms 波浪错峰</span>；行=周/列=星期的月历排布是本项目需求；0 支出=近背景灰。</div>
 ${details('heatmap', 'ui-recast 五段记录')}
</section>

<section>
 <h2>3 · Profit / Loss Line 每日结余</h2>
 <div class="map">packages/ui/src/charts/profit-loss-line-chart.tsx → components/bklit/ProfitLossLine.tsx（+ profit-loss-segments.ts）→ 每日收支卡「结余」标签</div>
 <div class="pair">${fig('bklit 原版', 'profit-loss-upstream', 'bklit.com/charts/profit-loss-line')}${fig('本项目复现', 'profitloss-ours', '零线上绿下红')}</div>
 <div class="strip">${[['图例 hover 调暗对侧', 'profitloss-legend', '0.25/0.2s'], ['方向键巡检', 'profitloss-inspect', 'role=slider'], ['移动端 tap', 'profitloss-mobile'], ['reduced-motion', 'profitloss-reduced', '全直跳']].map(i => fig(...i)).join('')}</div>
 <div class="codepair">${code('上游 profit-loss-line-chart.tsx', upstreamSrc['profit-loss'])}${code('本项目 ProfitLossLine.tsx', oursSrc['profit-loss'])}</div>
 <div class="note">上游缺陷修复：<span class="down">精确零值不分段（[5, 0, −3] 整段按最后非零符号着色，正数开头画成全红）→ 本地把零值当边界锚点，两侧各保本色</span>。算法拆 profit-loss-segments.ts 供 node 测试。</div>
 ${details('profit-loss-line', 'ui-recast 五段记录')}
</section>

<section>
 <h2>4 · stat-card 资产账户卡</h2>
 <div class="map">blocks stat-card-area-01 / stat-card-line-01 → components/bklit/StatCard.tsx → 资产页账户行 hover 趋势层</div>
 <div class="pair">${fig('bklit 原版', 'statcard-area-upstream', 'block demo')}${fig('本项目复现（默认态）', 'statcard-idle', '行内无图，hover 揭示')}</div>
 <div class="strip">${[['hover 揭示趋势线', 'statcard-hover', '行背景曲线层'], ['移动端详情 toggle', 'statcard-mobile', '44px strip+较月初'], ['reduced-motion', 'statcard-reduced', '直接切换']].map(i => fig(...i)).join('')}</div>
 <div class="codepair">${code('上游 stat_card_area.tsx / stat_card_line.tsx', statcardArea && statcardLine ? statcardArea + '\n\n/* ── stat_card_line.tsx ── */\n\n' + statcardLine : (statcardArea || statcardLine))}${code('本项目 StatCard.tsx', oursSrc['stat-card'])}</div>
 <div class="note">模式级反转：<span class="up">上游「图表常驻 + hover 读数」放不进 60px 行 → 反转为 hover 揭示，曲线作行背景层</span>；隐藏金额时 overlay/strip 强制抑制（防曲线形状泄露余额）；上游第二列源码含 line 变体（sparkline hover 版）。</div>
 ${details('stat-card', 'ui-recast 五段记录')}
</section>

<section>
 <h2>5 · 附：radix DataList / SegmentedControl（源码拷贝流程，非 ui-recast）</h2>
 <div class="map">radix-ui/themes @1faff10a → components/radix-copies/（MIT 归档）→ 退款摘要三行 + 变体切换器</div>
 <div class="strip">${[['变体切换器·默认', 'radix-variant'], ['切换后', 'radix-variant-switched', '白药丸滑到 active'], ['退款摘要三行', 'radix-refund', '原支出/已退/实付'], ['390px reduce', 'radix-refund-mobile']].map(i => fig(...i)).join('')}</div>
 <div class="codepair">${code('上游 segmented-control.tsx（剥离前）', '见 components/radix-copies/ATTRIBUTION.md 的来源与本地改动清单')}${code('本项目 SegmentedControl.tsx / DataList.tsx', '零 JS 指示器 + 交叉淡入双标签；dl>div>dt/dd 语义保留')}</div>
</section>

</main></body></html>`;
await writeFile(`${root}/index.html`, html);
const missing = Object.entries(images).filter(([, v]) => !v).map(([k]) => k);
console.log('images ok:', Object.values(images).filter(Boolean).length, '/', Object.keys(images).length);
if (missing.length) console.log('MISSING IMAGES:', missing.join(', '));
console.log('upstream src:', Object.fromEntries(Object.entries(upstreamSrc).map(([k, v]) => [k, v ? v.split('\n').length + 'L' : 'MISSING'])), 'statcard:', statcardArea ? 'OK' : 'MISSING');
console.log('PAGE_OK');
