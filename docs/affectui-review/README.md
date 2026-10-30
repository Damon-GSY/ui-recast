# AffectUI 全批复查

本轮覆盖19个已有源码条目，不增加已排除组件。参考实际主题与变体以逐项记录为准；用户明确的受控业务状态、只读Plan和未知结果语义保留。颜色、图标、光效、文字和布局分别对照，完整录像与过渡中间帧作为视觉依据。

| 分组 | 组件 | 记录 |
| --- | --- | --- |
| 加载与图结构 | Thinking Loader、Agent Graph | [loaders](loaders.md) |
| 基础操作 | Segmented Control、OTP Input、Button、Reading Tabs | 分组复查尚未交付 |
| 状态与权限 | Usage Meter、Autonomy Dial、Approval Card | 分组复查尚未交付 |
| 外壳与运行 | App Shell Flat、App Shell Inset、Agent Run | [shells](shells.md) |
| 选择与配置 | Combobox、Model Picker、Integration Settings | [forms](forms.md) |
| Agent 内容 | Agent Inbox、Agent Tree、Agent Plan、Tool Call Card | [agents](agents.md) |

逐项基线、完整过程、测量、修正与余差由上述记录链接。构建与源码分发检查单独保存于 `evidence/affectui-review/`，不以它们替代视觉对照。

## 集成基线

19项已检查宿主页样式有无覆盖组件文字色：当前默认状态0差异、0页面异常，记录为 `evidence/affectui-review/host-colors.json`。这是宿主隔离检查；原版色彩、状态及动效匹配仍以分组实测为准。并行Vite预览曾共享依赖缓存导致React运行错误，主预览现有独立缓存且统一React解析，各分组也采用独立缓存；该经验已补入skill采集说明。
