# MenuFold 组件模式补充

这批在现有 React 19 / TypeScript / Motion 实验库交付可编辑组件。来源是 Animate UI、Magic UI、Aceternity 的公开预览；实现遵循 MenuFold 的取舍。当前工作区没有 MenuFold 的 SwiftUI/AppKit 工程，因此原生应用接入不计入完成范围。

共 15 个源码条目，覆盖清单的 16 个参考模式：两个 Dock 参考合并为一个固定位置的 Dock；Accordion 与 Auto Height、Expandable Cards 与 Bento Grid 分别交付。此前公开源码集合中的 Tabs、Auto Height、Expandable Card 继续保留，这批提供带 MenuFold 行为约束的独立实现。

| 分组 | 源码 / 演示 slug | 参考 | 本地行为 |
| --- | --- | --- | --- |
| 首批 | `settings-sidebar` | [Animate Sidebar](https://animate-ui.com/docs/primitives/base-ui/sidebar) | 15 个设置入口分组；名称始终可见；悬停与已选独立 |
| 首批 | `instant-tabs` | [Animate Tabs](https://animate-ui.com/docs/primitives/base-ui/tabs) | 选中背景连续移动；内容立即切换；预览区域稳定 |
| 首批 | `detail-accordion` | [Animate Accordion](https://animate-ui.com/docs/primitives/base-ui/accordion) | 摘要常驻；常用项直接呈现；错误与权限提示可见 |
| 首批 | `auto-height` | [Animate Auto Height](https://animate-ui.com/docs/primitives/animate-ui/auto-height) | 内容尺寸改变时邻近区域连续让位 |
| 首批 | `selectable-cards` | [Aceternity Card Hover Effect](https://ui.aceternity.com/components/card-hover-effect) | 小型选择卡；移动悬停背景；独立勾标和选中边框 |
| 首批 | `fixed-dock` | [Magic Dock](https://magicui.design/docs/components/dock)、[Aceternity Floating Dock](https://ui.aceternity.com/components/floating-dock) | 图标位置固定；标签、焦点与轻微按压反馈 |
| 首批 | `stateful-button` | [Aceternity Stateful Button](https://ui.aceternity.com/components/stateful-button) | 等待与结果由调用方驱动；失败保留原因及恢复操作 |
| 后续候选 | `number-ticker` | [Magic Number Ticker](https://magicui.design/docs/components/number-ticker) | 首次直接显示；后续低频数值递变；搜索计数即时 |
| 后续候选 | `event-list` | [Magic Animated List](https://magicui.design/docs/components/animated-list) | 已有事件一次呈现；仅新 ID 入场；保留真实时间和传入顺序 |
| 后续候选 | `partition-list` | [Animate Pinned List](https://animate-ui.com/docs/primitives/animate-ui/pinned-list) | 三分区；业务成功并更新受控数据后移动；失败保持原位 |
| 后续候选 | `copy-button` | [Animate Copy Button](https://animate-ui.com/docs/primitives/animate-ui/copy-button) | 实际剪贴板 Promise 成功后显示勾标；失败可读 |
| Pro 候选 | `fluid-notch` | [Aceternity Fluid Notch](https://ui.aceternity.com/interactions/fluid-notch) | 紧凑摘要与文件、音乐、状态详情连续变化 |
| 后续候选 | `expandable-cards` | [Aceternity Expandable Card](https://ui.aceternity.com/components/expandable-card) | 打开详情、关闭回到原条目；键盘与焦点恢复 |
| 后续候选 | `bento-grid` | [Aceternity Bento Grid](https://ui.aceternity.com/components/bento-grid) | 根据内容指定模块大小与层级 |
| Pro 候选 | `stacked-empty-state` | [Aceternity Stacked Cards](https://ui.aceternity.com/blocks/empty-states/empty-state-with-stacked-cards) | 规则、分组、暂存架空状态；原生风格图标、简短说明、一个主要操作 |

## 文件与入口

- 图库：`http://127.0.0.1:4187/batch?collection=menufold`；单项 `/batch/<slug>`。
- 可编辑实现：`src/components/<slug>.tsx` 和相邻 CSS；演示 fixture：`src/batch/<slug>/`。
- 安装入口：`http://127.0.0.1:4187/r/<slug>.json`，包含实际文件正文与依赖；Accordion 同时分发 Auto Height。
- 采集与分析：`evidence/batch/<slug>/analysis.md`，`reference/lifecycle.webm`、`replica/lifecycle.webm`。
- 独立消费者：`evidence/registry-consumer`；本批安装、构建及运行记录：`evidence/menufold/consumer/`。

所有业务状态从宿主传入。真实后台结果、原生剪贴板/菜单/Tooltip/Switch 的系统实现由 MenuFold 保留；演示中的手动成功/失败控制仅用于验证状态边界。状态样式和焦点反馈贯穿组件，不引入另一套业务协议。

## 对照方式

每项先记录参考动作，再记录本地动作。观察图标、光效、文字和布局四条轨道。Pro 仅观察公开渲染，不获取受限源码。MenuFold 明确要求的适配（固定 Dock、即时 Tabs、三分区、单一空状态操作）作为设计决定记录；其余几何、光效、曲线差异单独列出，不宣称逐像素一致。

候选组件在实验库可运行，不代表已启用在 MenuFold 产品。后续迁移到 SwiftUI/AppKit 时复用状态合同和动作规格，继续沿用现有原生基础控件。

## 当前配色依据

[视觉依据](design-preferences.md)记录本轮颜色反馈与参数落点；[配色复查](../menufold-color/README.md)覆盖15项的参考角色色板。此前的暖灰/橄榄色是实现者选择，已不作为用户指定适配。
