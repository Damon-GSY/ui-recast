# 可运行案例

在 `ui-lab` 执行 `npm ci && npm run dev -- --port 4187`。下表路径附在 `http://127.0.0.1:4187` 后打开；源码与演示状态分别保存。原版与复刻录像位于 `ui-lab/public/evidence/`。

| 案例 | 运行路径 | 组件源码 |
| --- | --- | --- |
| Segmented Control | `/` | [TSX](ui-lab/src/components/segmented-control.tsx) |
| OTP Input | `/otp-input` | [TSX](ui-lab/src/components/otp-input.tsx) |
| Button | `/button` | [TSX](ui-lab/src/components/button.tsx) |
| Thinking Loader | `/thinking-loader` | [TSX](ui-lab/src/components/thinking-loader.tsx) |
| Agent Graph | `/agent-graph` | [TSX](ui-lab/src/components/agent-graph.tsx) |
| Usage Meter | `/usage-meter` | [TSX](ui-lab/src/components/usage-meter.tsx) |
| Autonomy Dial | `/autonomy-dial` | [TSX](ui-lab/src/components/autonomy-dial.tsx) |
| Approval Card | `/approval-card` | [TSX](ui-lab/src/components/approval-card.tsx) |
| Settings Sidebar | `/batch/settings-sidebar` | [TSX](ui-lab/src/components/settings-sidebar.tsx) |
| Instant Tabs | `/batch/instant-tabs` | [TSX](ui-lab/src/components/instant-tabs.tsx) |
| Detail Accordion | `/batch/detail-accordion` | [TSX](ui-lab/src/components/detail-accordion.tsx) |
| Auto Height | `/batch/auto-height` | [TSX](ui-lab/src/components/auto-height.tsx) |
| Selectable Cards | `/batch/selectable-cards` | [TSX](ui-lab/src/components/selectable-cards.tsx) |
| Fixed Dock | `/batch/fixed-dock` | [TSX](ui-lab/src/components/fixed-dock.tsx) |
| Stateful Button | `/batch/stateful-button` | [TSX](ui-lab/src/components/stateful-button.tsx) |
| Number Ticker | `/batch/number-ticker` | [TSX](ui-lab/src/components/number-ticker.tsx) |
| Event List | `/batch/event-list` | [TSX](ui-lab/src/components/event-list.tsx) |
| Partition List | `/batch/partition-list` | [TSX](ui-lab/src/components/partition-list.tsx) |
| Copy Button | `/batch/copy-button` | [TSX](ui-lab/src/components/copy-button.tsx) |
| Fluid Notch | `/batch/fluid-notch` | [TSX](ui-lab/src/components/fluid-notch.tsx) |
| Expandable Cards | `/batch/expandable-cards` | [TSX](ui-lab/src/components/expandable-cards.tsx) |
| Bento Grid | `/batch/bento-grid` | [TSX](ui-lab/src/components/bento-grid.tsx) |
| Stacked Empty State | `/batch/stacked-empty-state` | [TSX](ui-lab/src/components/stacked-empty-state.tsx) |
| Task Detail | `/batch/agent-run-integration` | [组合用例](ui-lab/src/batch/agent-run-integration/Study.tsx) |
| Task Workbench | `/batch/task-workbench` | [组合用例](ui-lab/src/batch/task-workbench/Study.tsx) |
| App Shell Inset | `/batch/app-shell-inset` | [TSX](ui-lab/src/components/app-shell-inset.tsx) |
| Questionnaire | `/batch/questionnaire` | [TSX](ui-lab/src/components/questionnaire.tsx) |
| Tool Call Card | `/batch/tool-call-card` | [TSX](ui-lab/src/components/tool-call-card.tsx) |
| Reading Tabs | `/batch/reading-tabs` | [TSX](ui-lab/src/components/reading-tabs.tsx) |
| Agent Tree | `/batch/agent-tree` | [TSX](ui-lab/src/components/agent-tree.tsx) |
| Agent Plan | `/batch/agent-plan` | [TSX](ui-lab/src/components/agent-plan.tsx) |
| App Shell Flat | `/batch/app-shell-flat` | [TSX](ui-lab/src/components/app-shell-flat.tsx) |
| Agent Run | `/batch/agent-run` | [TSX](ui-lab/src/components/agent-run.tsx) |
| Agent Inbox | `/batch/agent-inbox` | [TSX](ui-lab/src/components/agent-inbox.tsx) |
| Combobox | `/batch/combobox` | [TSX](ui-lab/src/components/combobox.tsx) |
| Model Picker | `/batch/model-picker` | [TSX](ui-lab/src/components/model-picker.tsx) |
| Integration Settings | `/batch/integration-settings` | [TSX](ui-lab/src/components/integration-settings.tsx) |
| Dashboard 2 | `/batch/block-dashboard2` | [TSX](ui-lab/src/components/block-dashboard2.tsx) |
| Stats Card 3 | `/batch/block-stats-card3` | [TSX](ui-lab/src/components/block-stats-card3.tsx) |
| Stats Card 4 | `/batch/block-stats-card4` | [TSX](ui-lab/src/components/block-stats-card4.tsx) |
| Chart Card 2 | `/batch/block-chart-card2` | [TSX](ui-lab/src/components/block-chart-card2.tsx) |
| Settings Members 2 | `/batch/block-settings-members2` | [TSX](ui-lab/src/components/block-settings-members2.tsx) |
| Data Table 12 | `/batch/block-data-table12` | [TSX](ui-lab/src/components/block-data-table12.tsx) |
| Data Table 24 | `/batch/block-data-table24` | [TSX](ui-lab/src/components/block-data-table24.tsx) |
| Member List 1 | `/batch/block-member-list1` | [TSX](ui-lab/src/components/block-member-list1.tsx) |
| Timeline 1 | `/batch/block-timeline1` | [TSX](ui-lab/src/components/block-timeline1.tsx) |

Task Detail 与 Task Workbench 是组合用例，不重复计入44个组件源码条目。部分案例采用公开源码适配，其余为按可见参考独立实现；具体来源与余差见实验室的单项分析。
