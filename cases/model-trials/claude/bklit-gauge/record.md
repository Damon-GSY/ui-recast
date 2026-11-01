# ui-recast 复现记录 · bklit Gauge（独立忠实版）

日期：2026-10-31 · 执行：ui-recast skill 全流程 · 产出：`/tmp/ui-recast-standalone/gauge/index.html`（vanilla 单文件 + 本地 calsans.woff2）

## 一、期望目标（证据来源：上游源码 + 官方页实测）

**输入证据**：`packages/ui/src/charts/gauge.tsx`（744 行，revision cfaa1d0a）+ 依赖 `notch-gauge-shared.ts` / `pie-center-shell.tsx` / `chart-stat-flow.tsx` + 官方 demo `gauge-chart-demo.tsx` + https://www.bklit.com/charts/gauge-chart 实时抓取（getComputedStyle 逐值读取）。

**目标规格**（四轨道）：
- **几何**：40 刻度弧，135°→405°（270° 弧，底部开口），spacing 25%（角槽 5.0625° + 缝 1.731°），刻度角宽 = 槽×0.8，外半径 size×0.42 / 内半径 size×0.28（向心收窄，非矩形），cornerRadius 0（直边四边形），容器 aspect 21/16。激活 = round(66%×40) = **26 根**。
- **光/色**：激活 `oklch(0.585 0.233 277.117)` @1（主题 --chart-1 紫罗兰）；背景 `--border` = `color-mix(in oklab,#000 8%,transparent)` @**0.4**（demo 显式覆盖默认 0.8）。卡片白底 14px 圆角 1px 8% 黑边（990×407）。
- **文字**：中心值 "$428,000"——Cal Sans（站点实测 body 字体）24px/700 tabular-nums，色 --foreground `lab(15.204% 0 0)`；标签 "ARR run rate" 10.85px/400 色 --chart-label，上边距 2px；中心块整体 paddingTop size×0.08。货币格式 Intl USD maxFractionDigits 0。
- **动效**：入场双轨——①刻度从圆心原点 scale 0→1 + opacity 0→1，spring(stiffness 300, damping 20)（欠阻尼 ζ≈0.58，有 ~10% 过冲）；背景错峰 delay=i×0.015s（总跨度 0.585s），激活层 delay=(0.3+i×0.02)s（i 为原始刻度下标，最晚 0.8s）；激活层绘制在背景层之上、独立补间。②中心数字：首帧画 $0，双 rAF 后 NumberFlow 式计数 0→428,000。reduced-motion：transition {duration:0} 但 **delay 保留**（上游原样：仍逐个瞬跳，最晚 0.8s 才全就位——上游怪癖，非 bug 修复版）。
- **交互**：源码证明 Gauge **无 hover/点击行为**（hover 属于 Pie 组件）——忠实还原即只做入场 + 值更新会重播计数。

## 二、实际构建

- `index.html`：单文件零依赖。CSS 变量直抄官方计算值；几何公式逐行移植（`GaugeArcInner` 的三角函数计算）；spring 用数值积分（a = k(1−x) − c·v，mass=1，dt≤32ms）每刻度独立 rAF 轨道；中心计数 900ms ease-out cubic（NumberFlow 拟合）；reduced-motion 分支保留 delay、瞬跳就位（复刻上游怪癖）。附"重播入场"按钮（明确标注非组件部分）。
- `calsans.woff2`：官方站点字体文件本地化（149KB，@font-face 400–800）。
- `shots/shot.png`（稳定态）、`shots/shot-entry.png`（入场 400ms 中途帧：背景错峰中、激活层刚起、中心计数 $360,605）。

## 三、对比表（实际输出 vs 目标）

| 维度 | 目标（实测/源码） | 复现 | 结果 |
|---|---|---|---|
| 路径数 | 66（40 背景+26 激活） | 66 | ✅ |
| 填色/透明度直方图 | bg `oklab(0 0 0/.08)`@0.4 ×40；active `oklch(.585 .233 277.117)`@1 ×26 | 完全相同（DOM getComputedStyle 复测） | ✅ 逐位一致 |
| viewBox/比例 | 448×341.33（21:16） | aspect 21/16，内容宽 448（max-w-lg − 两侧 32px） | ✅（修正一轮：初版漏算官方容器水平 padding，512→448） |
| 中心值/标签 | $428,000 / ARR run rate | 相同文本、同字号字重同色、Cal Sans 已加载（document.fonts.check ✓） | ✅ |
| 入场编排 | bg i×.015 / active .3+i×.02，spring 300/20 过冲可见 | 相同 delay 公式 + 数值 spring，入场帧证据显示错峰与中途缩放态 | ✅（凭帧证据，未逐帧差分） |
| 中心数字动画 | NumberFlow 逐位弹簧 | 900ms 整数 ease-out 计数 | 🟡 近似（拟合） |
| reduced-motion | duration 0 + 保留 delay（逐个瞬跳） | 相同实现 | ✅（含上游怪癖） |
| 交互 | 无 | 无（未发明） | ✅ |
| console | — | 0 error / 0 warning | ✅ |

## 四、剩余差异

1. **NumberFlow 逐位弹簧 vs 整体计数**：上游每个数字独立弹簧滚动（宽度抖动被 tabular-nums 吸收）；复现是整体数值计数。肉眼节奏接近，逐帧看数字翻滚细节不同。标记为"拟合"。
2. **NumberFlow 的 isolate/willChange 性能路径**未复刻（无对应层）。
3. 官方页面的卡片内布局微差：官方卡片内 demo 区域上下留白来自文档页排版，复现用 place-items center 近似（±几像素）。
4. Cal Sans 为可变字体本地副本；官方站点同文件，但若 bklit 改版字体则复现不自适应。
5. 未复刻 linear 朝向 / 渐变 / defs pattern 等非 demo 变体（不在本次目标内）。

## 五、Skill 反馈（给 skill 作者）

1. **"capture 依赖文件的常量"没有指引**：主源码引用的常量散在 notch-gauge-shared / pie-center-shell / chart-stat-flow 等依赖文件里（透明度、spring 参数、中心布局）。skill 说"从证据实现"，但没说**依赖源码也要抓全**——我是靠经验追了 4 个文件才拿齐数值。建议 skill 加一步："枚举目标源码的全部 import，凡含视觉常量的依赖必须取回"。
2. **运行时计算样式抓取是杀手锏但 skill 没提**：对有公开站点的组件，直接 Playwright 读 getComputedStyle（--chart-1 的 oklch 精确值、卡片圆角、标签实测 10.85px 而非 Tailwind 名义 12px）比看截图猜色准一个数量级。建议在 input-evidence 增加"live URL → computed style 采集"通道，与截图采集并列。
3. **"交互不存在"也是要采的证据**：指令预设了"hover 行为"，但源码证明 Gauge 无 hover。skill 的四轨道规格（icons/light/text/layout）不含"交互清单"栏——建议规格表强制一栏"交互（含'无'）"，防止执行者按直觉发明交互或漏记。
