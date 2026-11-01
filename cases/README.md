# Runnable cases

The included implementations target React/TypeScript on the web. The skill also provides platform-specific guidance for native output; native SwiftUI/UIKit/AppKit cases have not yet been validated here.

> **Models used:** `gpt6-astra` for the original collection; `gpt-6.1-sol` (`high`) for the Fluid Notch multi-step flow. Other models have not been tested.

Run `npm ci && npm run dev -- --port 4187` inside `ui-lab`. Append each route below to `http://127.0.0.1:4187`. Reusable source and example state are separate; reference and reconstruction recordings live in `ui-lab/public/evidence/`.

| Case | Route | Component source |
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
| Task Detail | `/batch/agent-run-integration` | [Composition](ui-lab/src/batch/agent-run-integration/Study.tsx) |
| Task Workbench | `/batch/task-workbench` | [Composition](ui-lab/src/batch/task-workbench/Study.tsx) |
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

Task Detail and Task Workbench are compositions and are not counted again among the 44 source entries. Cases include public-source adaptations and independent visual reconstructions. See the per-case analyses for provenance and remaining differences.

## Fluid Notch — multi-step flow

[Source and run instructions](model-trials/gpt-6.1-sol/fluid-notch/README.md) include the three-question flow, progress, completion and reset, together with paired recordings and intermediate-frame comparisons. Model: `gpt-6.1-sol` (`high`).

## bklit charts — vanilla 1:1 reproductions

Four bklit (ui.ole.dev, MIT) chart components rebuilt as dependency-free single-file HTML pages, each with a five-part reproduction record and shot evidence. Model: `claude`. Unlike the React cases above, these target plain HTML/SVG with hand-ported geometry and motion.

| Case | Interactive page | Record |
| --- | --- | --- |
| Gauge | [HTML](model-trials/claude/bklit-gauge/index.html) | [record.md](model-trials/claude/bklit-gauge/record.md) |
| Heatmap | [HTML](model-trials/claude/bklit-heatmap/index.html) | [record.md](model-trials/claude/bklit-heatmap/record.md) |
| Profit/Loss Line | [HTML](model-trials/claude/bklit-profit-loss/index.html) | [record.md](model-trials/claude/bklit-profit-loss/record.md) |
| Stat Card | [HTML](model-trials/claude/bklit-stat-card/index.html) | [record.md](model-trials/claude/bklit-stat-card/record.md) |

Fidelity highlights: 66/66 SVG paths bit-identical (Gauge), 28/28 polyline vertices at 0.0000px deviation with the 1100ms LTR clip reveal (Profit/Loss Line), spring stiffness 300 / damping 30 hover crosshair verified against source (Stat Card). Three-layer comparison — upstream → reproduction → app integration — lives at [bklit-compare](model-trials/claude/bklit-compare/index.html); upstream reference material and capture/verify scripts are in [bklit-refs](model-trials/claude/bklit-refs/).
