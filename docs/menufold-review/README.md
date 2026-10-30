# MenuFold 动效复查

范围为本批15个组件。保留明确的产品取舍：固定 Dock、即时 Tabs、真实结果驱动状态、初始列表完整呈现和确认后移动。此次沿完整录像复查入场、循环、切换、收回和再次触发；图标、光影、内容和外壳分开分析。

| 组件 | 本次结果 | 细节 |
| --- | --- | --- |
| Settings Sidebar | 未发现新缺陷，保留实现 | [导航与展开](nav.md) |
| Instant Tabs | 补内容淡入、轻移与去模糊，仍立即响应最新选择 | [导航与展开](nav.md) |
| Detail Accordion | 补内容过渡和动态下缘遮罩，提示保持可见 | [导航与展开](nav.md) |
| Auto Height | 保留已正确的高度弹簧，修复示例内容直接消失 | [导航与展开](nav.md) |
| Selectable Cards | 修复跨卡片悬停层的透明度断层和快速反向 | [列表与样式卡](lists.md) |
| Fixed Dock | 补悬停退出、标签进出场，分离已选底色和移动悬停层 | [Dock 与按钮](dock-buttons.md) |
| Stateful Button | 校准旋转、图标交接与悬停光环，修复状态变色时文字淡没 | [Dock 与按钮](dock-buttons.md) |
| Copy Button | 改为重叠的缩放、模糊和透明度交接，保留按钮焦点 | [Dock 与按钮](dock-buttons.md) |
| Number Ticker | 未发现新缺陷，保留实现 | [列表与样式卡](lists.md) |
| Event List | 补新项弹出及原有行连续让位，不重播历史项 | [列表与样式卡](lists.md) |
| Partition List | 未发现新缺陷，保留确认后移动与反向连续性 | [列表与样式卡](lists.md) |
| Fluid Notch | 校准外壳、内容和完成图标各轨道，保留退出内容 | [Fluid Notch](fluid.md) |
| Expandable Cards | 修复整面缩放导致的文字拉伸，外壳、图标和内容独立过渡 | [展开卡片与 Bento](cards.md) |
| Bento Grid | 补双层悬停阴影，保留已正确的内容平移 | [展开卡片与 Bento](cards.md) |
| Stacked Empty State | 中心卡先入场、两侧后展开，悬停独立于入场延迟 | [叠层空状态](stack.md) |

Reading Tabs 的额外指示器修复单列于导航记录，不计入这15项。

## 证据与对照入口

每项 `evidence/batch/<slug>/motion-review/before/` 保留修改前源码与完整复刻录像；原版录像在 `reference/lifecycle.webm`，修复后录像在 `replica/lifecycle.webm`。未改动项复用已核对的录像。逐项分析记录具体观察、渲染测量、参数拟合及余差，不把构建通过等同于视觉一致。

图库的双录像播放器新增两侧独立起点和相对时间同步，保留完整回放、0.25倍速与40ms定位。起点须定位到相同的可见变化；步进不会增加原录像帧率。完整录像、实际中间帧和阶段配对共同用于判断。

[15项图库](http://127.0.0.1:4187/batch?collection=menufold) · [Fluid Notch](http://127.0.0.1:4187/batch/fluid-notch) · [叠层空状态](http://127.0.0.1:4187/batch/stacked-empty-state)

## Skill 更新

`skills/reverse-ui-component/` 保持自包含。新增的指导来自本次具体问题：保留基线；按可见变化对齐；检查外壳与内部图文的中间态；从当前呈现值反向；分离入场延迟与悬停；检查旧行让位、共享层合成透明度和前景/背景的中途对比度；区分用户明确取舍与遗漏。

## 验证与余差

主工程构建通过；15个 registry 条目经真实 shadcn CLI 安装，30个组件源码/样式文件正文与当前源码一致，独立消费者构建通过。安装后15项渲染与14组交互检查通过，页面异常为0。记录在 `evidence/menufold-review/consumer/`。

生产图库15个页面、30段双侧录像与分析/源码链接通过；播放器的独立起点、慢放暂停及完整回放通过。Stateful最后的光环增量通过真实重装和7项消费者检查；Stacked最后的box-sizing增量经真实重装，390px无溢出。最终源码、HTTP registry、实际安装文件与ZIP内30份源码正文一致；两套服务的下载包及30段录像均与当前产物一致，结果见 `evidence/menufold-review/source-delivery.json`。本轮不声称逐像素或曲线完全一致：原生图标、文案、配色与部分结构保留既定适配，无法从采样确认的参数明确标作拟合。逐项剩余差异见各组记录与各组件 analysis。
