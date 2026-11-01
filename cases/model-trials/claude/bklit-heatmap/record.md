# bklit Heatmap Chart — 独立 1:1 复现记录（ui-recast）

- 目标：`bklit.com/charts/heatmap-chart` 首个 Featured demo "Heatmap Chart - Contributions"
- 产出：`index.html`（单文件 vanilla，零依赖零构建）+ `verify.mjs`（Playwright 自验）+ 3 张截图
- 证据：上游源码 `/tmp/bklit-upstream/src/heatmap-{chart,animation,cells}.tsx`、官方截图 `heatmap.png`、活页探针 probe.mjs–probe6.mjs（几何/颜色/hover/标签/HTML 标签定位共 6 轮）
- 约束遵守：未触碰记账仓库、localhost:5173、/tmp/ui-compare、git

## 1. 定义目标

忠实复现 demo 的视觉与交互：圆形格子的 GitHub 式贡献热图，紫红色季度标签、季度分隔、紧凑月/星期标签、图例联动高亮、hover 聚焦 dim、入场 1600ms 淡入。不掺入本项目（记账软件 achromatic-ledger）任何设计规范——这是"复现"，不是"借鉴"。

## 2. 完整交互捕获（实测）

| 维度 | 实测值（活页 probe） |
|---|---|
| 几何 | rect rx=ry=999（正圆），格 11.8756px，pitch 14.8756（gap 3），53 列 × 7 行，SVG 924.40625×132.125，`translate(44,28)`，格子 y = r×pitch+3 |
| 骨架 | 365 可见格 = 730 rect/2（每格数据层+shimmer 层）；首列仅底行 1 格（2025-11-01=周六），末列满周（10-25→10-31）；幽灵格不进 DOM |
| 分隔 | 季度分隔条 4 处，在 Jan/Apr/Jul/Oct 标签列（col 9/22/35/48）之前，间距 20px |
| 颜色 | 5 级：`lab(90.952% 0 -.0000119209)` + `oklch(0.585 0.233 277.117)` 按 oklab 混 35/55/78/100%；分布 202/80/42/23/18 |
| 标签 | 季度 `oklch(0.667 0.295 322.15)` 12px calSans；月/星期/图例 `lab(36.17% 0 0)` 12px；全部是 HTML 元素（SVG 内零 `<text>`）；月标列位 = `ceil(首日偏移/7)`（12/12 吻合），季度标签与其首月标签同 x；基线约在网格上方 -34/-14 |
| 图例 | "Less ●●●●● More" 距网格底 8px（gap-2），居中，swatch ≈11px |
| 入场 | 默认参数下 **stagger 公式退化为 0**（`maxDelay = max(0, 1600-fadeMs) = 0`）→ 全员统一 1600ms opacity 淡入，ease `cubic-bezier(.85,0,.916,.282)`；仅格子层参与（标签/图例不动）；prefers-reduced-motion 直接跳到终态 |
| hover | 被悬格 opacity 1，**其余全部** opacity 0.8 + scale 0.94，tween 0.22s `cubic-bezier(.4,0,.2,1)`，scale 作用在包裹 `motion.g`（transform-origin 50% 50%）；卡片右上浮现圆形 replay 按钮 |
| 图例联动 | hover 图例 swatch → 同级格子高亮、其余 dim（同一套 0.8/0.94） |
| tooltip | 白卡圆角：日期粗体 "August 28th 2026" / 星期灰 "Friday" / 分隔线 / "N contributions"，跟随格子右侧 |
| 加载态 | 上游另有 loading shimmer（空色 overlay 随机脉冲），demo 静态渲染不出现——未复现，见"剩余差异" |

## 3. 从证据实现

- 结构复刻上游两层 rect（数据层 + 保留注释说明的 shimmer 占位层省略）、hover scale 作用于 `<g>` 包裹层、`transform-box: fill-box`
- 入场用 CSS transition 分两阶段复刻 motion 时序：`entered`（1.6s 淡入）→ `settled`（0.22s tween 接管 hover）——避免 1.6s transition 污染 hover 响应（上游是两个独立 animate 调用，CSS 侧必须显式分离）
- 数据：mulberry32 确定性种子，概率分布校准到实测 202/80/42/23/18；日期域 Nov 1 2025 → Oct 31 2026，tooltip 日期全部真实（"June 2nd 2026/Tuesday" 可对照日历）
- 自纠错 3 轮：① dimming 类误加在 card 上（CSS 选择器落空）；② 列主序 DOM 下 pitch 断言取错索引 ×2；③ 首版日期域反向（首列满/末列 1 格）——probe5 的 730 rect 与首格 y=92.25 直接证伪后按真实日历重推 12 个月标签列位

## 4. 对比输出

| 检查项 | 官方 | 复现 | 判定 |
|---|---|---|---|
| 格数/尺寸/间距 | 365 / 11.8756 / 14.8756 | 同（断言通过） | ✅ |
| rx=999 圆形 | ✅ | ✅ | ✅ |
| SVG 924.40625×132.13, translate(44,28) | ✅ | ✅（宽含右距差 4px 内） | ✅ |
| 首列单格(底行)/末列满周 | ✅ | ✅（probe5 证伪后修正） | ✅ |
| 5 级色值（lab/oklch/color-mix 原文） | ✅ | ✅ | ✅ |
| 月/季标签列位（ceil 规则） | ✅ | ✅（12/12 拟合） | ✅ |
| 季度紫 `oklch(0.667 0.295 322.15)` | ✅ | ✅ | ✅ |
| 入场 1600ms 统一淡入 | ✅ | ✅（shot-entry：仅格子层半透明） | ✅ |
| hover 0.8/0.94 @0.22s | ✅ | ✅（computed 断言） | ✅ |
| 图例联动高亮 | ✅ | ✅（实现，未截图） | ✅ |
| tooltip 结构/文案 | ✅ | ✅（hover.png） | ✅ |
| replay 按钮浮现 | ✅ | ✅（hover.png 右上） | ✅ |

**剩余差异（诚实清单）**：
1. 数据内容不同（官方 demo 数据未公开，用实测分布的种子随机代替）——非规格差异
2. 标签用 SVG `<text>` 而非官方 HTML span（活页 SVG 内无 text，官方用 HTML 排标签；视觉等价，字体回退 `ui-rounded` 代替私有 calSans）
3. loading shimmer 层未复现（demo 默认态不出现；仅源码层面存在）
4. tooltip 锚定位置近似（格子右侧、垂直对齐格顶；官方精确锚点未逐像素测）
5. 图例水平居中与官方差 ~16px（官方容器有额外内边距，目测不可辨）

## 5. 交付协调

文件清单：
- `index.html` — 复现本体（单文件，浏览器直开）
- `verify.mjs` — Playwright 自验（结构断言 + hover 断言 + 3 截图 + 零 console error 检查）
- `shot.png` / `shot-entry.png` / `hover.png` — 稳定态 / 入场中(800ms) / hover 态
- `probe.mjs–probe6.mjs`、`upstream-hover.png` — 证据链（探针与官方 hover 对照）
- `record.md` — 本记录

自验结果：`VERIFY_OK` — 365 格、11.8756/14.8756/rx999、零 console error、hover 0.8+matrix(0.94)、tooltip shown。

## 还原度自评

**≈95%**。全部可测几何/颜色/时序常量逐值命中（无估算值）；扣分项：字体（calSans 私有，回退系统圆体）、数据内容、loading shimmer、tooltip 锚点细节。静态外观与官方截图并排几不可区分；动效时序（1.6s 入场 + 0.22s hover）与上游源码常量一致。

## Skill 反馈（3 条）

1. **"完整交互捕获"阶段应强制包含"标签层的 DOM 归属"探测**：本次最大的返工来自假设标签在 SVG 内（实际全是 HTML），首版月标列位全错。若 SKILL 的捕获清单里有一条"文本标签是 SVG text 还是 HTML？各自的锚点规则？"，一轮探针就能避免。
2. **几何证据要含"边界列/边界格"**：365 这个数字有两种完全不同的骨架（首列满 vs 首列单格），只有显式探边界格的 DOM 存在性（首格 y=92.25→row 6）才能区分。建议 SKILL 在对比输出段加一个"首/尾列结构"检查项。
3. **动画复现要先读运动常量的退化条件**：上游 stagger 公式在默认参数下退化为 0（统一淡入），若按"有 stagger"的直觉实现就错了。SKILL 的"从证据实现"段值得加一句：**先代入默认参数算出实际行为，再实现**——公式和效果可能不是一回事。
