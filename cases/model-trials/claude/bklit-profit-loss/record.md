# ui-recast 记录：bklit Profit/Loss Line（独立复现）

- 日期：2026-10-31
- 目标组件：bklit UI `ProfitLossLine`（https://www.bklit.com/charts/profit-loss-line）
- 产物：`index.html`（单文件 vanilla，零依赖零构建）+ 三张截图
- 约束遵守：未触碰记账软件仓库、未动 localhost:5173、未改 /tmp/ui-compare、未执行 git

---

## 1. 期望目标（捕获到的规格 + 证据来源）

**忠实还原**上游 docs demo 的渲染与交互，目标是原作者分不出原版和复现。全部规格来自四类证据：

| 证据 | 来源 |
| --- | --- |
| 组件源码（190 行）+ 分段算法（123 行） | GitHub repo（raw + git blobs API）|
| Demo 数据生成公式、demo 组件（curve=curveLinear） | `profit-loss-line-docs-data.ts`、`profit-loss-line-demo.tsx`、docs mdx |
| 实时 DOM 测量（网格 y 坐标、path d、token 值、clip 几何、tooltip 盒模型） | Playwright 抓 bklit.com（capture-live*.mjs、capture-hover.mjs、capture-tooltip2.mjs、probe-grid-y.mjs、probe-paths.mjs）|
| 官方 demo 图 + 交互截图 | profit-loss-line.png、upstream-tooltip.png、upstream-legend-hover.png |

关键规格：
- **布局**：svg 924×231，margin {29.953, 7.797}，inner 908.406×171.094；y 域 [-1200,1200]（由网格行位于 inner 高度的 1/12、7/24、1/2、17/24、11/12 分位反推，零线恰在正中）
- **网格**：5 条虚线（var(--chart-grid)，1px，"4,4"）@ y = 14.258/49.902/85.547/121.192/156.836 + 零线实线（var(--foreground) @ 0.35）+ 边缘渐变淡出 rect
- **线**：3 段符号着色（#10b981/#ef4444），2.5px round cap/join，**curveLinear（demo 显式传入，非曲线插值）**
- **入场**：ChartRevealClip — clip rect (x=-24,y=-24) 宽度 0→956.406 LTR，1100ms tween，cubic-bezier(0.85,0,0.15,1)；只裁线段组，网格/轴/图例不参与
- **轴**：HTML ticker（svg 内无 text），Jan 1/9/17/24（索引 0/8/16/23），text-xs，#525252
- **图例**：居中下方，marker 10px 圆点，item px-2 py-1.5 rounded-lg，hover bg-legend-muted + 对侧 item opacity-40，线段对侧 dim 0.25 @ 0.2s ease-in-out
- **tooltip**：白底 14px 圆角，border 1px rgba(0,0,0,0.08)，min-w 160（实测 175×87），头部日期（border-b px-3.5 py-2.5 medium text-sm）+ 行（指示点 + muted label + tabular-nums 值）；悬停点 r=5 + halo 2.6× @ 0.3；无十字线
- **数据**：24 点，`pnl = round(sin(i/2.5)*800 + cos(i/6)*400 + (i-12)*15)`，2024-01-01 起逐日
- **忠实照抄的缺陷**：`splitProfitLossSegments` 仅在两侧值非零且异号时分割；**精确零值不分段**（已验证 [5,0,-3] → 单段，且段符号标签会中途翻转）——这是上游原始行为，非复现错误
- **范围声明**：demo 仅提供浅色态 → 暗色模式不在本次 scope（"Claim 1:1 only when the stated scope has no known differences"——scope 即捕获到的浅色 demo 态）

## 2. 实际构建

`index.html`（约 370 行，单文件）：
- 结构：CSS token 层（实测 sRGB 等价值）+ 静态卡片框架 + JS 构建 SVG（网格/零线/渐变/clipPath/3 段路径/悬停点）+ HTML 轴刻度 + tooltip div + 图例按钮
- 算法：`splitProfitLossSegments` / `findInitialSign` / `interpolateZeroCrossing` 逐字移植（含缺陷）；d3 式 niceTicks 仅存未用（y 域按实测硬编码 ±1200，注明推断依据）
- 入场：rAF + 牛顿法解 cubic-bezier(0.85,0,0.15,1)（端点短路 + 导数保护 + 钳制）
- 交互：pointermove 最近数据行吸附 → tooltip/悬停点/轴刻度淡出；图例 hover/focus → 段组 opacity 0.25
- 自验：`self-verify.mjs`（Playwright）——**零 console error**；shot.png / shot-entry.png（330ms 入场中帧）/ legend-hover.png / shot-tooltip.png

## 3. 对比表

| 维度 | 上游（实测） | 复现 | 判定 |
| --- | --- | --- | --- |
| 折线几何 | 28 顶点 DOM path d | **max 偏差 0.0000px（28/28 点，3 位小数精度）** | ✅ 1:1 |
| 网格行位置 | 14.258/49.902/85.547/121.192/156.836 | 14.26/49.90/85.55/121.19/156.84 | ✅ ~0.005px |
| 零线 | y=85.547 实线 0.35 | y=85.55 同 | ✅ |
| 线色 | oklch(0.696 0.17 162.48)/oklch(0.637 0.237 25.331) | #10b981/#ef4444（sRGB 等价） | ✅ |
| clip 几何 | x=-24 y=-24 w=956.406 | 同（收尾 clipW 实测 956.41） | ✅ |
| 入场动画 | 1100ms tween cubic-bezier(0.85,0,0.15,1) LTR | 同参数 rAF 实现，中帧截图形态一致 | ✅ |
| 轴刻度 | Jan 1/9/17/24 text-xs | 同 | ✅ |
| 图例交互 | 对侧 0.25 @0.2s + item fade 0.4 | 实测 groupOpacities [0.25,1,0.25] ✓ | ✅ |
| tooltip | 白卡 14px 圆角 min-w 160，175×87 | 同规格，168×80（字体度量差） | ✅ 近似 |
| 悬停点 | r5 + halo 2.6× @0.3 | 同 | ✅ |
| 暗色模式 | demo 未提供 | 不在 scope | ⛔ N/A |
| reduced-motion | 上游无特殊处理 | 同样无（忠实保留） | ✅ 一致 |

## 4. 剩余差异

1. **tooltip 运动曲线**：上游用 framer spring（resolveTooltipBoxMotion），复现用 150ms ease-out transform —— 拟合近似，静态盒模型规格一致
2. **轴刻度 hover 淡出曲线**：上游 x-axis ticker 的精确衰减函数未逐像素测得，复现用 50px 全亮→线性衰减的拟合
3. **字体**：系统栈 vs bklit 站点字体（Geist 系），tooltip 168×80 vs 175×87 的尺寸差源于此
4. **结构差异（无视觉影响）**：上游 React+visx+framer-motion，4 条 path（1 条透明隐藏域 Line + 3 段）；复现 vanilla，3 条 path（隐藏 Line 的职责——域注册/tooltip 触发——由直接的 pointer 逻辑承担）
5. **页面框架**：docs 页标题/卡片为近似（非本次 scope 核心，图表本体精确）
6. **上游官方 PNG 资产颜色** (0,188,125)/(251,44,54) 与实测 token 不符 —— 判定为该 PNG 的 ICC profile 问题（PIL 未套用），以实时 DOM token 为准

## 5. Skill 反馈（3 条）

1. **图表类复现应把"DOM 几何提取"列为第一优先捕获手段**。本次最关键的突破是从上游 DOM 直接抓 `path d` 和网格 `y1`——它一举推翻了我基于截图的两个推断（y 域猜想、tick 算法猜想），最终实现做到 28/28 顶点零偏差。截图只能证明"看起来像"，DOM 才能证明"就是"。建议 SKILL.md 在捕获步骤为 chart 类目标明确列出：提取 path d、网格线坐标、getComputedStyle token、clip 几何。
2. **小 scope 任务需要一条轻量路径 + 单次测量清单**。本次写了 4 个捕获脚本 + 3 个补测探针，多轮往返的根因是第一遍没测全（网格 y1 忘了放进 probe、tooltip 图标误认三轮）。建议 skill 提供"一次抓什么"清单（布局盒/路径数据/token/交互态/动画参数五类一次抓完），并为单组件复现豁免部分五步流程的重量。
3. **已知坑应记录：file:// 编辑后立即用 Playwright 重开可能读到陈旧缓存页**（本轮实测出现过一次新旧代码混合的矛盾 DOM 输出，sleep 1 后消失）。建议在 skill 的 gotchas 或自验步骤加一句：改文件后加 1s 延迟或 cache-busting query 再验证，否则会像本轮一样浪费一轮"不可能存在"的排查。
