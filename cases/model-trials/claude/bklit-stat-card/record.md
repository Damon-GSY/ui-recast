# ui-recast 复现记录 — bklit stat-card block

- 目标 block：`stat-card-area-01` + `stat-card-line-01`（bklit-ui，revision cfaa1d0a，MIT）
- 产出：`index.html`（单文件 vanilla，零依赖）、`verify.mjs`（Playwright 自验）
- 复现口径：**行为级忠实** —— 图表常驻 + hover 读数，不掺本项目规范（无 Lisse 卡片法、无 hover 反转）

## 1. 期望目标

复现 bklit 官方 stat-card 两变体的全部可观测行为：

| 行为 | 规格 |
|---|---|
| 布局 | 卡 max-w-md(448px) rounded-xl；header px-4 py-3（title 14px/600 + TrendBadge）；content px-4 pt-2 pb-3；图表出血 `-mx-4 -mb-3` 高 190px；line 卡读数 overlay 右下 absolute right-4 bottom-4 |
| 静态 | indigo #6366f1（area，stroke 2，面积渐变 0.45→0）；fuchsia #d946ef（line，stroke 2.5，无填充）；label 灰 text-xs；tabular-nums |
| 入场 | 900ms `cubic-bezier(0.85,0,0.15,1)`；area = clipPath wipe，line = stroke-dashoffset draw |
| hover | 弹簧追点（stiffness 300 / damping 30）；crosshair 1px 渐变竖条 + dot r=3 stroke var(--card) 1.5；基线序列淡至 inactiveOpacity（area 0.5 / line 0.4）；统计区切换为最近点值/标签/环比 badge |
| 数字 | NumberFlow 滚动（无 vanilla 等价 → 400ms ease-out 计数器替代，见差异） |
| a11y | svg role=img + aria 描述（"12 points, from 5.2K to 8.8K, up 69%"）；reduced-motion 直出终态；触摸 pan-y |

## 2. 实际构建

- 证据链（每项参数均有出处，非观测拟合）：
  - 数据与壳：registry JSON `block-stat-card-*.json` / `*-example.json`（revenueSeries 12 点、sessionsSeries 7 点、avg/trend、示例文案）
  - 组件与动画常量：GitHub raw `chart-stat-flow.tsx`、`sparkline.tsx`、`sparkline-geometry.ts`（revision cfaa1d0a）
  - 色彩 token：`bklit-tokens.css`（--chart-1/--chart-3/label/crosshair，light 实值 + dark 标注推断）
- 实现要点：
  - d3 `curveMonotoneX` 手写移植（Fritsch–Carlson 切线限幅，与 d3 同公式同输出）
  - 5% headroom 值域、baselineY clamp、最近点索引 `Math.round(t*(n-1))` 均按 geometry 源码移植
  - 弹簧为 semi-implicit Euler 定步长积分（120fps 子步）
  - hover 引擎在宿主内自建 `.spark` 子层，不清空宿主其他子节点（line 卡 overlay 得以共存）

## 3. 与原版对比

| 维度 | 原版 | 复现 | 结论 |
|---|---|---|---|
| 数值/徽章/标签 | $6,525 Avg +12.4%；1,344 Avg +8.2% | 同（Playwright 断言） | ✅ 一致 |
| hover 读数 | Dec $8,800 +15.8%；Thursday 1,580 +41.1%；离开恢复 Avg | 同（含 -21.5% 负向红 badge） | ✅ 一致 |
| 几何/配色/留白 | 190px 出血、0.45→0 渐变、0.5/0.4 淡出 | 同（常量逐项对源码） | ✅ 一致 |
| 数字滚动 | NumberFlow digit 机器滚动 | 400ms ease-out 整体计数 | ⚠️ 近似替代 |
| 暗色 | 组件消费 token，demo 站实渲染 | bklit-tokens.css dark 值（个别标注推断） | ⚠️ 高置信推断 |
| 排列 | 官方每页一卡 | 两卡上下排（任务要求） | 📝 排列适配，已注明 |

自验（`node verify.mjs`，全部通过）：settled 断言、area 末点 hover、line 第 4 点 hover（含负 badge）、离开恢复、dim 0.5/0.4、reduced-motion 无 clip/dash、390px 无横向溢出、**零 console error**。截图为证：`shot.png`、`hover.png`、`shot-mobile.png`。

## 4. 剩余差异

1. NumberFlow：digit 位滚动 + 弹性符号变换无法在零依赖下等价；替代为整值插值计数（同为 400ms 级、tabular-nums），静止态逐像素一致，仅过渡质感不同。
2. 暗色 token：`--chart-1/3` 的 dark 值（indigo-400 #818cf8、fuchsia-400 #e879f9）为 Tailwind 调色板推断，未在 demo 站暗色截图逐像素核对。
3. 字体：原 demo 站可能加载特定 webfont；复现用 system-ui 栈，字形渲染可能有亚像素差异。
4. d3 移植：monotone 公式与 d3 相同，但 NaN 缺口、单点退化等分支未逐一与 d3 行为对拍（本数据无缺口，不影响本 block）。

## 5. ui-recast Skill 反馈

1. **先探测可渲染性，再定证据路线**。本次 v0 直接截图上游 demo 站，整页被 "Cookies required" 墙挡住，截图证据全部作废，被迫转向 registry JSON + GitHub raw 源码。Skill 应在「完整捕获交互」一步前先发一个匿名探测请求，401/墙 → 立即切源码证据路线，避免浪费一轮截图。
2. **目标开源时，源码是优于录屏的证据源**。hover 弹簧（stiffness 300 / damping 30）、inactiveOpacity、入场缓动全部读自源码，比录屏观测拟合精确一个量级。Skill 的捕获章节默认观测法，应补一条：能拿到源码 revision 时优先 fork 源码，观测只用于验证。
3. **缺「依赖降级」指引**。NumberFlow 无 vanilla 等价物，Skill 对"依赖无法复现时如何自定替代并记录"没有规范（时长/缓动/粒度全靠自判）。建议补一小节：替代需对齐静止态逐像素一致 + 过渡时长同级 + 在 record 中显式声明。
4. **区分「复现行为」与「复现运行时防御」**。上游相当比例代码（customElements ready 门控、SSR 兼容、willChange）服务于 React/SSR 运行时，纯静态复现照抄只会引入不存在的复杂度。Skill 应明确：复现可观测行为，不复现宿主框架防御代码。
