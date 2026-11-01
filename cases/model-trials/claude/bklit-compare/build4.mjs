// Build v4: 层2 换成 ui-recast skill 的独立忠实复现（/tmp/ui-recast-standalone/*）。
// 层1 上游目标 · 层2 skill 复现(截图+源码+还原度) · 层3 记账软件集成。
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
const root = '/tmp/ui-compare';
const imgDir = `${root}/img`;
await mkdir(imgDir, { recursive: true });
const web = '/Users/damon/Documents/Projects/记账软件/web';
const reproRoot = '/tmp/ui-recast-standalone';

const read = async p => { try { return await readFile(p, 'utf8'); } catch { return null; } };
const copy = async (src, dest) => { try { await copyFile(src, `${imgDir}/${dest}`); return true; } catch { return false; } };

const jobs = {
  'gauge-upstream': '/tmp/bklit-upstream/gauge.png',
  'heatmap-upstream': '/tmp/bklit-upstream/heatmap.png',
  'profit-loss-upstream': '/tmp/bklit-upstream/profit-loss-line.png',
  'statcard-area-upstream': '/tmp/bklit-upstream/stat-card-area.png',
  'statcard-line-upstream': '/tmp/bklit-upstream/stat-card-line.png',
  'repro-gauge': `${reproRoot}/gauge/shots/shot.png`,
  'repro-gauge-entry': `${reproRoot}/gauge/shots/shot-entry.png`,
  'repro-heatmap': `${reproRoot}/heatmap/shot.png`,
  'repro-heatmap-hover': `${reproRoot}/heatmap/hover.png`,
  'repro-statcard': `${reproRoot}/stat-card/shot.png`,
  'repro-statcard-hover': `${reproRoot}/stat-card/hover.png`,
  'repro-statcard-mobile': `${reproRoot}/stat-card/shot-mobile.png`,
  'repro-profitloss': `${reproRoot}/profit-loss/shot.png`,
  'repro-profitloss-entry': `${reproRoot}/profit-loss/shot-entry.png`,
  'repro-profitloss-legend': `${reproRoot}/profit-loss/legend-hover.png`,
  'repro-profitloss-tooltip': `${reproRoot}/profit-loss/shot-tooltip.png`,
  'upstream-profitloss-tooltip': `${reproRoot}/profit-loss/upstream-tooltip.png`,
  'upstream-profitloss-legend': `${reproRoot}/profit-loss/upstream-legend-hover.png`,
};
for (const [key, src] of Object.entries(jobs)) await copy(src, `${key}.png`);

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const img = (key, label) => {
  if (!jobs[key]) return '';
  return `<figure><img src="img/${key}.png" alt="${label}"><figcaption>${label}</figcaption></figure>`;
};

// 层2 每组件：复现结论 + 截图 + 可展开源码 + record 链接
const repro = {
  gauge: {
    title: '1 · Gauge 预算表盘',
    doc: 'https://ui.ole.dev/docs/charts/gauge-chart',
    upstreamPath: 'charts/gauge.tsx',
    verdict: '66/66 条 SVG path 逐位一致（40 背景 + 26 激活），填色/透明度直方图经 getComputedStyle 复测完全相同；viewBox 448×341.33（21:16）。上游无 hover 交互（源码证实），复现同样不发明交互。',
    shots: [['repro-gauge', '复现 · 稳定态'], ['repro-gauge-entry', '复现 · 入场动画中帧'], ['gauge-upstream', '上游目标（对照）']],
    srcFile: `${reproRoot}/gauge/index.html`,
    record: `${reproRoot}/gauge/record.md`,
    live: `${reproRoot}/gauge/index.html`,
    integration: ['src/components/bklit/Gauge.tsx', 'BudgetGauge'],
    integrationShot: 'integration-gauge',
  },
  heatmap: {
    title: '2 · Heatmap 每日支出月历',
    doc: 'https://ui.ole.dev/docs/charts/heatmap-chart',
    upstreamPath: 'charts/heatmap/heatmap-chart.tsx',
    verdict: '≈95%。全部可测几何/颜色/时序常量逐值命中（1.6s 入场 + 0.22s hover tween，概率分布校准到实测 202/80/42/23/18）；扣分项：calSans 私有字体回退、loading shimmer、tooltip 锚点细节。自纠错 3 轮（首版日期域被 probe5 证伪后按真实日历重推）。',
    shots: [['repro-heatmap', '复现 · 稳定态'], ['repro-heatmap-hover', '复现 · hover'], ['heatmap-upstream', '上游目标（对照）']],
    srcFile: `${reproRoot}/heatmap/index.html`,
    record: `${reproRoot}/heatmap/record.md`,
    live: `${reproRoot}/heatmap/index.html`,
    integration: ['src/components/bklit/Heatmap.tsx', 'BklitHeatmap'],
    integrationShot: 'integration-heatmap',
  },
  'profit-loss': {
    title: '3 · Profit / Loss Line 每日结余',
    doc: 'https://ui.ole.dev/docs/charts/profit-loss-line-chart',
    upstreamPath: 'charts/profit-loss-line.tsx',
    verdict: '几何 1:1：28/28 折线顶点偏差 0.0000px（3 位小数），5 条网格线 ~0.005px，y 域 [-1200,1200]、clip 几何、1100ms cubic-bezier(0.85,0,0.15,1) 入场、tooltip 盒模型、图例 dim 0.25/0.4 全按实测照抄。忠实保留了上游"精确零值不分段"的行为（已验证 [5,0,-3]→单段）。',
    shots: [['repro-profitloss', '复现 · 稳定态'], ['repro-profitloss-entry', '复现 · 入场 LTR clip reveal'], ['repro-profitloss-tooltip', '复现 · tooltip'], ['upstream-profitloss-tooltip', '上游 tooltip（对照）'], ['repro-profitloss-legend', '复现 · 图例 hover 对侧 dim'], ['upstream-profitloss-legend', '上游图例 hover（对照）'], ['profit-loss-upstream', '上游目标（对照）']],
    srcFile: `${reproRoot}/profit-loss/index.html`,
    record: `${reproRoot}/profit-loss/record.md`,
    live: `${reproRoot}/profit-loss/index.html`,
    integration: ['src/components/bklit/ProfitLossLine.tsx', 'ProfitLossLine'],
    integrationShot: 'integration-profitloss',
  },
  'stat-card': {
    title: '4 · stat-card 资产账户卡',
    doc: 'https://ui.ole.dev/docs/components/stat-card',
    upstreamPath: 'blocks/stat-card-*.tsx',
    verdict: '≈95%。数值/徽章/hover 读数（Dec $8,800 +15.8%、负向 -21.5% 红 badge、离开恢复 Avg）全部 Playwright 断言一致；190px 出血、0.45→0 渐变、hover 弹簧 stiffness 300/damping 30 逐项对源码。NumberFlow 无 vanilla 等价物，滚动数字以同级时长自定替代并已在 record 声明。',
    shots: [['repro-statcard', '复现 · 稳定态'], ['repro-statcard-hover', '复现 · hover 读数'], ['repro-statcard-mobile', '复现 · 移动端'], ['statcard-area-upstream', '上游 area 版（对照）'], ['statcard-line-upstream', '上游 line 版（对照）']],
    srcFile: `${reproRoot}/stat-card/index.html`,
    record: `${reproRoot}/stat-card/record.md`,
    live: `${reproRoot}/stat-card/index.html`,
    integration: ['src/components/bklit/StatCard.tsx', 'StatCard'],
    integrationShot: 'integration-statcard',
  },
};

const sections = [];
for (const [key, r] of Object.entries(repro)) {
  const src = await read(r.srcFile) || '// 源码缺失';
  sections.push(`
<section id="${key}">
  <h2>${r.title}</h2>
  <div class="layer">
    <h3>① 目标原版 <a class="doc" href="${r.doc}" target="_blank">${r.doc.replace('https://', '')}</a><code>${r.upstreamPath}</code></h3>
    <div class="shots">${img(key.startsWith('stat') ? 'statcard-area-upstream' : `${key}-upstream`, '上游官方截图')}</div>
  </div>
  <div class="layer">
    <h3>② ui-recast skill 独立复现 <a class="doc" href="file://${r.live}" target="_blank">打开可交互复现页 →</a><a class="doc" href="file://${r.record}" target="_blank">复现记录 record.md →</a></h3>
    <p class="verdict">${r.verdict}</p>
    <div class="shots">${r.shots.map(([k, l]) => img(k, l)).join('')}</div>
    <details><summary>复现源码（vanilla 单文件，零依赖）</summary><pre><code>${esc(src)}</code></pre></details>
  </div>
  <div class="layer">
    <h3>③ 记账软件集成</h3>
    <p class="verdict">集成点：<code>web/${r.integration[0]}</code>${r.integration[1] ? `（<code>${r.integration[1]}</code>）` : ''} —— 按本项目 achromatic 设计规范适配后投入使用。</p>
    <div class="shots">${img(r.integrationShot, '应用内实景')}</div>
  </div>
</section>`);
}

const skillFeedback = [
  ['gauge', ['依赖源码里的视觉常量要抓全（skill 应提示枚举全部 import）', '运行时 getComputedStyle 采集应成为官方证据通道', '规格表应强制"交互（含无）"栏，防止发明交互']],
  ['heatmap', ['捕获清单应含"标签是 SVG text 还是 HTML"探测', '几何证据必须含边界列/边界格', '动画先代入默认参数算出实际行为再实现（stagger 可能退化为 0）']],
  ['stat-card', ['先探测可渲染性（401/墙 → 立即切源码路线）', '开源目标源码是优于录屏的证据源', '缺"依赖降级"规范（NumberFlow 替代全靠自判）', '复现可观测行为，不复现宿主框架防御代码']],
  ['profit-loss', ['图表类应把 DOM 几何提取列为第一优先（path d/网格/token/clip）', '小 scope 需要轻量路径 + 五类规格单次测量清单', 'gotcha：file:// 编辑后立即重开可能读到陈旧缓存页']],
];

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>ui-recast 复现对照：上游 → skill 独立复现 → 记账软件集成</title>
<style>
  body { font: 15px/1.7 -apple-system, "PingFang SC", sans-serif; max-width: 1180px; margin: 0 auto; padding: 32px 24px 80px; background: #fafafa; color: #18181b; }
  h1 { font-size: 22px; } .tag { font-size: 12px; background: #e4e4e7; border-radius: 99px; padding: 2px 10px; vertical-align: 3px; }
  .intro { color: #52525b; max-width: 72ch; }
  section { margin: 48px 0; padding-top: 24px; border-top: 1px solid #e4e4e7; }
  h2 { font-size: 18px; } h3 { font-size: 14px; color: #3f3f46; margin: 18px 0 8px; font-weight: 600; }
  .doc { font-size: 12px; color: #2563eb; margin-left: 12px; font-weight: 400; }
  code { font: 12px/1.6 ui-monospace, Menlo, monospace; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 4px; padding: 1px 5px; }
  .verdict { background: #f4f4f5; border-left: 3px solid #a1a1aa; padding: 10px 14px; border-radius: 0 8px 8px 0; font-size: 13.5px; color: #3f3f46; }
  .shots { display: flex; flex-wrap: wrap; gap: 14px; margin: 12px 0; }
  figure { margin: 0; max-width: 46%; min-width: 300px; }
  img { width: 100%; border: 1px solid #e4e4e7; border-radius: 10px; background: #fff; }
  figcaption { font-size: 12px; color: #71717a; margin-top: 4px; }
  details { margin: 10px 0; } summary { cursor: pointer; font-size: 13px; color: #52525b; }
  pre { background: #18181b; color: #e4e4e7; padding: 16px; border-radius: 10px; overflow: auto; max-height: 480px; font: 11.5px/1.55 ui-monospace, Menlo, monospace; }
  table { border-collapse: collapse; font-size: 13px; width: 100%; }
  th, td { border: 1px solid #e4e4e7; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #f4f4f5; }
</style></head><body>
<h1>ui-recast 复现对照：上游 → skill 独立复现 → 集成 <span class="tag">4/4 组件齐</span></h1>
<p class="intro">层②是 <b>ui-recast skill 独立产出的忠实复现</b>——vanilla 单文件、零依赖、1:1 还原 bklit 上游（不掺本项目任何规范）；层③才是进记账软件时的适配版。每格附可交互复现页与五段复现记录。</p>
${sections.join('\n')}
<section>
  <h2>四份复现记录沉淀的 Skill 反馈（12 条）</h2>
  <table><tr><th>组件</th><th>反馈</th></tr>
  ${skillFeedback.map(([k, items]) => `<tr><td>${repro[k].title.split('·')[1] || k}</td><td><ul style="margin:0;padding-left:18px">${items.map(i => `<li>${i}</li>`).join('')}</ul></td></tr>`).join('\n')}
  </table>
</section>
</body></html>`;

await writeFile(`${root}/index.html`, html);
console.log('built', html.length, 'bytes');
