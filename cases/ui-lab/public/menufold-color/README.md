# 15项组件配色复查

用户反馈整体配色不到位。本轮发现两类问题：组件和示例统一套用了未经指定的暖灰/橄榄色；图库通用段落规则还覆盖了5项中的正文或提示色。此前把这套配色记作既定适配的判断在此更正。

## 修正方向

以每个实际参考的角色色板为准：页面与表面、主次文字、边框、图标、强调色、阴影及实际存在的状态色分别比较。中性底色不替代原版绿色按钮、蓝色主操作或黑色Fluid Notch。原生图标内容、紧凑结构、固定Dock和业务状态合同保留。

图库仅控制自己的导航、说明和对照按钮；不再用 `.batch-page p/a` 改写内部组件颜色。旧研究首页的全局footer/pre/链接hover限定在图库以外。图库的中性色参数在 `src/batch.css`，各独立组件的颜色在自己的CSS，安装后不依赖宿主补色。

## 主要变化

| 组件组 | 配色修正 |
| --- | --- |
| Bento / 展开卡片 | 白卡、中性灰文字与渐变；展开卡片保留参考绿色操作 |
| 叠层空状态 | 白卡、浅灰面板、蓝色主要操作，移除橄榄色光晕 |
| Fluid Notch | 黑色参考与白色透明度层级；浅色扩展保留绿色成功和红色错误 |
| Sidebar / Tabs / Accordion / Auto Height | 浅灰导航、白色选中块、深色文字和独立提示色 |
| Dock / Stateful / Copy | 中性Dock；绿色Stateful；黑底浅字Copy |
| Ticker / Event / Partition / Selectable Cards | 黑字计数、彩色事件图标、中性分区、参考黑色样式卡 |

## 分组对照

- [Bento / Expandable Cards](cards.md)
- [叠层空状态](stack.md)
- [Fluid Notch](fluid.md)
- [Sidebar / Tabs / Accordion / Auto Height](nav.md)
- [Dock / Stateful / Copy](dock-buttons.md)
- [Ticker / Event List / Partition / Selectable Cards](lists.md)

每份记录区分实测参考色、本地业务状态选择与剩余差异。修改前源码、画面与录像保存在各项 `color-review/before/`；最终状态截图、计算颜色和验证位于 `color-review/`。改动项重新录制完整生命周期，原有动效规格不重写。

## Skill经验

先提取角色色板再写样式；不能把自行选择的品牌色写成用户决定。颜色与透明度分开测量，再检查真实背景上的合成结果。检查静止和交互状态，也检查独立组件与宿主页之间的样式覆盖；录像与源码分发必须随颜色修复更新。已落实于自包含的 `skills/reverse-ui-component/`，没有新增其他skill依赖。

项目配色依据：[design-preferences.md](../menufold/design-preferences.md)。

## 验证

图库15项检查已通过：原先5项受影响的段落/链接颜色现在与去掉图库包装后的结果相同，0覆盖差异、0页面异常。前后截图和逐项结果在 `evidence/menufold-color/gallery/`。主工程构建、15项真实shadcn registry安装与独立消费者构建通过；安装后的15项渲染、14组交互检查通过，0页面异常。生产图库15个入口及30段参考/复刻视频检查通过。Selectable Cards 的悬停层在窄屏调整后仍保留旧宽度的问题已修复，并用实际悬停、移出、缩窄及快速换项验证。

执行记录位于 `evidence/menufold-color/`：`consumer/install-build.json`、`consumer/browser-verification.json`、`gallery/verification.json`、`cards-resize.json`；最终源码/registry/安装文件/ZIP正文及开发/生产媒体与下载一致性记录为 `source-delivery.json`。分组内色彩检查与全库接口验证分开，不将构建通过当作颜色一致。

## 已知差异

Stateful Button 的录屏约5.1秒有一帧短暂画面瑕疵，单独重录一次后仍出现；相邻帧和成功态截图正常，原样保留并注明，没有修补帧。参考绿色与白字的对比度约2.22:1，本轮保留实测参考色，未将其称为无障碍达标。其余图标内容、几何和产品模式的适配差异见分组记录。
