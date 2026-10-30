# Agent Run · Clean / light

参考：[公开文档](https://www.affectui.com/screens/agent-run) · [可交互全屏预览](https://www.affectui.com/screens/agent-run/full)。目标为 1440×900 桌面及 390px 窄屏。只观察公开预览、可见 DOM、计算样式、渲染动画和 SVG 图形；没有读取 Pro 实现、脚本包或 React 内部状态。

交付位置：`src/components/agent-run.tsx`、相邻 CSS 和 `src/components/agent-run/`；模拟数据与时序位于 `src/batch/agent-run/`。分发入口 `/r/agent-run.json`。实时页面 `/batch/agent-run`，全屏 `/batch/agent-run?capture=1`。

## 流程与证据

成功的原版全程在 `reference/full-lifecycle.webm`，逐动作时间在 `reference/video-timeline.json`。它连续记录初始进入、五步自动执行、工具折叠/展开与复制、文稿逐条接受/拒绝和接受剩余、审批、完成、侧面板切换、运行菜单、重跑、停止、重新进入并拒绝。只有第四步 Gmail 需要审批；第五步日历自动执行。早期误等第二次审批的录像保留在 `reference/attempt-01/`，不作为成功覆盖证据。

复刻采用同一尺寸和动作链，记录在 `replica/full-lifecycle.webm` 与 `replica/video-timeline.json`。画廊使用两侧 `lifecycle.webm`，支持同步播放、拖动和 0.25×慢放；只裁去开始的空白加载段，原速保留，裁切位置记录在 `preview-alignment.json`，原始全段另存。源码被编译后在独立生产预览录制，避免热更新打断。全段概览用于检查过程有无遗漏；亚秒过渡依据各部件的原始帧及独立渲染测量判断。

另有侧栏菜单/展开/拖拽、文稿键盘审阅、审批键盘、拒绝后原地重试的独立观察与验证。各部分证据在 `parts/shell`、`parts/plan`、`parts/activity`、`parts/panel`、`parts/diff`；页面顶部及响应式布局在 `parts/integration/header-observations.json`。

## 复刻规格与四条轨道

布局：侧栏 272px；主框距顶部/右侧/底部 8px，圆角 12px；头栏 52px；阅读列宽 680px，顶部距头栏 32px；右侧详情 360px，独立滚动。等待时 Plan 为 680×423px，活动区从 y544 开始。原版主区域不超过1000px时详情改为覆盖层并默认关闭；900px及以下侧栏改抽屉，390px视口时主框6px内缩、详情宽376px。

| 轨道 | 观察与实现 | 证据 |
|---|---|---|
| 图标 | 使用公开渲染 SVG 几何；计划八射线加载器、工具执行环、完成勾、审批结果标记、侧栏/头栏图标分别实现 | 各部分 `rendered` / `glyph` / `motion` 观察 |
| 光效与颜色 | 原版是中性界面：加载文字有1800ms白色扫光，工具/审批标记有淡色背景和边框；未观察到彩色外发光，不额外添加 | activity 的 computed styles 与 loader 局部录像 |
| 文字 | 运行标签位移及 blur 交接；审批文字退出/结果进入；文稿9处拆分、逐词缩合、红绿高亮消退、完成条和 Undo | `parts/diff/verification.md`、`parts/panel/panel-report.json` |
| 布局与过渡 | 工具分组折叠380ms，图标入场420ms；审批卡约253→82px，高度520ms，结果描边420ms延迟300ms；文稿收缩460ms；侧栏420ms；窄屏详情从x40px入场420ms，遮罩300ms；桌面详情切换即时 | 各部件独立 rAF / computed animation 数据及 `panel-trajectories.json` |

默认九处文稿修改的拆分与原版一致，319px宽时初始高度244.8125px，全接受201.625px。Undo只撤销上一笔审阅事务。等待、接受、拒绝不会通过组件内部计时器改变业务状态。

`reference/rendered-sequence.json` 以40ms间隔观察公开渲染状态：进入步骤约200ms后启动工具，相邻工具间约200ms，最后工具结束后约300ms完成步骤，相邻步骤之间约300ms；进入邮件步骤约450ms后出现审批。参数是基于采样拟合；700/500/900/700/1100/600/600/700ms调用耗时直接来自公开显示与示例。演示使用这些时序，实际组件由外部状态驱动。

## 接口与行为

`AgentRun` 接收 `title`、`steps`、`status`、`elapsedMs`、`draft`，以及 agent/user/workspace、费用、调用数和回调。`onApprove`、`onDeny`、`onStop`、`onRestart`、`onRetry`、`onStepsChange`、`onDraftChange`、`onNavigate` 交由宿主处理。待审批项优先于历史已批准项；旧的审批记录不能遮住下一步输入。

示例重试保留已完成步骤、原始开始时间与已审阅文稿；停止会取消旧任务的定时推进。逐条/全部审阅与Undo由父级保存决定。组件中没有真实邮件发送、日历写入或后台作业模拟。导航/Share交给宿主回调，复制链接与工具参数/结果使用真实剪贴板。

## 验证

- `flow-verification.json`：实际浏览器13项通过，覆盖桌面几何、九处修改、拒绝阻止发送、原地重试、八次调用完成、停止取消旧计时器、剪贴板、窄屏、抽屉、减少动态，无页面异常。
- `gallery-verification.json`：两侧最终录像加载、播放、暂停、0.25倍速和拖动通过，分析链接可访问。
- 五个部分分别执行了真实渲染、键盘/焦点、状态受控及动效测量；详见各自报告。主工程 TypeScript / Vite 构建日志为 `root-build.log`。
- 独立消费者通过真实 shadcn CLI 安装14个源码文件，逐一与HTTP registry及当前源码直接字符串对照一致，生产构建及实际受控调用验证通过；包括“前一步已批准、下一步待批准”时正确选择新审批且被动父级不自动推进。结果在 `parts/integration/consumer-verification.json`；该检查与此前14个页面的批次报告分开记录。最终4个文件增量重新安装后，`consumer-backdrop-verification.json`确认1000px遮罩关闭、390px全宽详情关闭及900/901px侧栏边界，无页面异常。

## 已知差异与范围

- 复刻覆盖 Clean/light 目标，不声称暗色或其他视觉变体一致。录制原生25fps，对短过渡另用渲染采样；两侧网络加载、字体就绪、点击调度及文字时钟有相位差，不能按绝对视频秒数判定曲线相等。
- 侧栏引导内容切换/新闻卡移除、悬停离开延迟180ms以及部分入场参数是拟合；没有宣称像素与每一帧1:1。引导13%属于示例数据，其任务动作通过回调交给宿主。
- `panel-trajectories.json` 保留修正前的主面板轨迹：它揭示原版桌面开关是即时切换，而初版额外动画了宽度；已移除。窄屏入场修正为实测420ms/x40px，遮罩300ms。最终校准在消费者增量验证与最终录像中确认。
- 手机详情面板提供明确关闭按钮与Escape（审批卡内Escape优先拒绝）；这是可用性补充，与公开预览的关闭入口不同。
- 原版关闭再打开详情会重置文稿审阅；本实现保留调用方持有的决定，因此双录像在该动作后有可见差异。停止时若没有失败调用块，本实现另显示简短停止提示。
- Loader文字宽度仍约1px差异；失败块配色及复制成功提示的1800ms时长是拟合。
- 通用文稿差异算法独立实现；默认9处已对齐，其他任意文稿的拆分不保证与未知原算法相同。计划拖拽的中间轨迹未逐帧对齐。
- 运行数据来自本地示例。此交付复现屏幕与交互，不包含真实Stripe/Gmail/Calendar服务或完整工作台路由。
