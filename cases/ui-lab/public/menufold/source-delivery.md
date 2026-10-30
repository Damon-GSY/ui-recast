# 取用 MenuFold 组件源码

源码位于 `src/components/`，每个条目包含同名 TSX 和 CSS。源码使用 React 19、TypeScript、Motion；样式按组件作用域编写，不需要 Tailwind。`src/batch/` 保存可操作用例，其中的样本数据和手动结果控制不属于可复用组件。

单项通过本地 registry 安装：

```sh
npx shadcn@4.23.0 add http://127.0.0.1:4187/r/fluid-notch.json
```

15 项集中源码包：`http://127.0.0.1:4187/downloads/menufold-components.zip`。包中保留组件、样式、用例、registry 正文与来源分析；依赖按 registry 声明安装。它供现有 React 工程取用，不包含宿主业务实现。

| 条目 | 主要导出 | 调用方负责 |
| --- | --- | --- |
| `settings-sidebar` | `SettingsSidebar` | `groups`、当前 `value`、`onValueChange` 与内容区域 |
| `instant-tabs` | `InstantTabs` | `tabs` 内容、当前 `value` 与变更回调；`minPanelHeight` 保持预览空间 |
| `detail-accordion` | `DetailAccordion` | `openItems`、展开回调；关键提示放 `notice`，位于折叠区域外 |
| `auto-height` | `AutoHeight` | 自然高度内容；使用 `collapsed` 时由调用方补 `inert` / `aria-hidden` |
| `selectable-cards` | `SelectableCards` | 背景/形状预览、当前值及选择回调；悬停不改选择 |
| `fixed-dock` | `FixedDock` | 图标、当前项、禁用原因与选择回调 |
| `stateful-button` | `StatefulButton` | `idle/pending/success/error` 状态；失败原因及重试回调 |
| `number-ticker` | `NumberTicker` | 当前数值；搜索结果使用 `immediate` |
| `event-list` | `EventList` | 稳定 ID、真实时间、顺序、状态及打开回调 |
| `partition-list` | `PartitionList` | 分组、每项所属组、pending/error；成功后才更新 items |
| `copy-button` | `CopyButton` | 待复制内容；组件实际等待 Clipboard API 的结果 |
| `fluid-notch` | `FluidNotch`、`FluidNotchSections`、`FluidNotchFiles`、`FluidNotchMusic`、`FluidNotchStatus`、`FluidNotchProgress` | 开合、内容选择、文件动作、媒体状态和进度；组件不自行播放媒体或推进任务 |
| `expandable-cards` | `ExpandableCards` | 条目、详情内容、`selectedId` 与选择回调 |
| `bento-grid` | `BentoGrid` | 内容与列/行跨度；实际操作回调 |
| `stacked-empty-state` | `StackedEmptyState` | 空状态类别、文案、一个主要操作与禁用状态 |

`detail-accordion` 的 registry 同时包含 `auto-height.tsx` / CSS，其余条目以各自文件为单位。无另一份侧栏、任务状态机或模拟后端藏在源码依赖中。

## 可复现验证

```sh
npm run build
node scripts/menufold/consumer-install.mjs
node scripts/menufold/consumer-browser.mjs
node scripts/menufold/build-source-bundle.mjs
```

安装脚本通过真实 HTTP registry 和 shadcn CLI 写入独立消费者，再逐份直接比较源码正文。运行检查覆盖安装后组件，而不是从主工程直接导入源码。图标、光效和过渡的录像分析另在 `evidence/batch/<slug>/analysis.md`；构建通过不等于视觉完全一致。

具体执行结果记录在 `evidence/menufold/consumer/install-build.json`、`browser-verification.json` 和 `evidence/menufold/gallery/verification.json`。

## 初次交付执行结果

主工程构建通过。15 个 registry 条目经真实 shadcn CLI 安装，30 个不重复组件源码/样式文件与当前源码及 HTTP registry 正文一致；独立消费者构建通过。15 个安装后示例均可渲染，14 组关键行为检查通过，页面异常为 0。

关键检查覆盖：15 项导航和受控选择、即时 Tabs、折叠后的常驻错误/权限信息、稳定 Dock 几何、背景/形状选择、显式按钮结果、真实剪贴板写入与读回、数值打断、新事件身份、确认后分区移动、详情焦点恢复（包括 StrictMode 初始打开）、窄屏 Bento、三种单操作空状态，以及 Fluid Notch 文件/音乐/状态、纹理图层、快速开合与焦点恢复。

这些结果证明源码分发与相关行为可用。单项图标、纹理、弹簧和尺寸的剩余差异仍以各自分析为准，不将组件模式适配称为原版逐像素复制。

最终生产图库15/15入口、30段双侧录像、15个分析链接及源码链接检查通过；两个Pro对照的0.25倍速和暂停通过，页面异常为0。Selectable Cards 的末次悬停层叠CSS修复经单项真实重装、交互与最终消费者构建验证；全部源码、最终registry、安装文件和ZIP内30个源码文件正文一致。相关增量记录为 `selectable-final.json`、`final-build.log`、`final-source-bodies.json`。

## 动效复查更新（2026-10-30）

15项完整过程已复查，逐项结论见 [动效复查记录](../menufold-review/README.md)。本次补齐分层几何/图标交接/光影与中间态，保留原录像基线；图库播放器支持独立相位起点。最新构建、真实安装、14组交互、生产图库和播放器记录统一保存在 `evidence/menufold-review/`。Stateful光环及Stacked窄屏CSS的末次增量另经实际重装验证。

最终ZIP保留本次分组复查记录；源码/registry/安装文件/ZIP正文以及开发与生产下载的直接字节比较见 `evidence/menufold-review/source-delivery.json`。

## 配色复查更新（2026-10-30）

15项已按各自参考恢复表面、文字、边框、阴影和状态色，并消除图库对5项文字颜色的覆盖。此前自行选定的暖灰/橄榄色不再作为默认适配。具体依据、状态对照和录像差异见 [配色复查记录](../menufold-color/README.md)；源码包包含该记录与当前配色依据。

主工程构建、15项真实重新安装、独立消费者构建、15项渲染及14组交互检查通过；生产图库15入口、30段视频通过。当前执行记录统一在 `evidence/menufold-color/`，最终源码与分发正文比较见其中 `source-delivery.json`。
