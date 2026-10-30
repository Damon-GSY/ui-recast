# Agent Tree — evidence and integration handoff

Target: [AffectUI Agent Tree](https://www.affectui.com/components/agent-tree), public Clean/light preview, observed 2026-10-29. Independent React 19 + Motion 14 reconstruction. The public page identifies Agent Tree as Pro. No Pro source, bundles, internal React state, or gated registry response was read.

## Source and media

- Product: `src/components/agent-tree.tsx`, `src/components/agent-tree.css`.
- Public types: `AgentTreeProps`, `AgentTreeNode`, `AgentTreeStatus`, `AgentTreeCost`, exported from the component.
- Study: `src/batch/agent-tree/Study.tsx`, `study.css`, `rendered-marks.json`; default is **Integration · Unknown**, optional labelled **Source fixture**.
- API/example contract: `notes/agent-tree/API.md`.
- Source native recording: `reference/lifecycle.webm`.
- Replica native recording: `replica/lifecycle.webm`.
- Source final-state screenshot: `reference/final-expanded.png`.
- Raw probes, actual action times, trajectories and screenshots: `evidence/integration-supplement/agent-tree/`.
- Reproducible scripts: `scripts/agent-tree/`.

Both captures use fresh headless Chrome profiles, light theme, 1440×1200 viewport and a 760px component width. They retain original native video timing. Source and replica page wrappers differ; compare the component at the same scale, aligned on its heading/root card, rather than comparing page chrome. Native capture is separated from dense animation measurement and coordinated with the group's `recording` marker.

The source capture covers the initial run, agent arrivals, waiting, failure, retry as a new node, completion, automatic folding/opening, another loop and reset. The manual chain covers Researcher hover/click, nested fold/unfold, root fold/unfold, hover exit and an interrupted fold reversal. The replica repeats that chain using the labelled sample timeline. Clicking the public preview card did not expose persistent selected styling; controlled selection highlighting is a product adapter extension.

## Four visual tracks

| Track | Public rendered evidence | Reconstruction |
| --- | --- | --- |
| Icons | Running glyph is a 12px circle/arc rotating every **900ms**, linear. Done uses a check; failed a warning triangle; waiting a clock. Avatar tiles are 22px; rendered brand marks approximately 14px; overlapping tool tiles 16px. | Independently drawn status/navigation SVGs. Same 900ms loader. Caller-owned avatar/tool React nodes. Source fixture alone contains publicly rendered brand SVG marks. Unknown has a neutral question glyph and explicit label. |
| Light and color | Soft blue connectors **#82bcff**, 1.5px stroke, 3.25px parent dots. Cost shimmer is **1100ms**, background position 100%→0%, 300% background width; 90° gradient with a low-opacity highlight at 50%. Card shadow has a fine 0.5px outline and restrained lower shadow. No large ambient glow was observed. | CSS matches measured connector/shimmer values. Shimmer occurs only when caller-provided cost has `live:true`; it changes no number. Unknown/queued/stopped connectors are muted. |
| Text | Name 13px/16px, weight 500; model 11px/14px; task 12px/16px; metadata 11px/16px; status 11px. Inter. State labels and values update in place; no independent rolling-digit mechanism was observed. | Matching typography and metadata hierarchy. Unknown metadata is omitted, never substituted with zero. Amount text reflects props; there is no production clock or generated telemetry. |
| Layout | At 760px: cards **216×112px** for the source fixture, padding 10px 10px 8px, radius 8px. First-level column gap 8px; vertical gap 40px; deeper indentation 32px, sibling gap 12px. Entry: translateY(6px), scale(.98), opacity 0→1 over **360ms**, cubic-bezier(.32,.72,.24,1), typically 160ms after connector entry. Connector draw **420ms** on the same curve. | Measured layout and rise parameters reproduced. Motion handles card movement, group folding and reversals; connectors follow rendered card positions during transitions. Descendants leave bottom-first and become inert during exit. Below 560px the first level becomes indented, with widths reduced to fit. |

The source manual reversal probe records requests at 151ms, 701ms, 822ms and 942ms within its measurement window. It contains 108 actual rAF samples over 1.8s, median interval 16.6ms and maximum interval 45.7ms. These measurements supplement native video rather than claiming the video itself has 60 unique frames per second. `manual-reversal-trajectories.json` and `running-animations.json` retain the observations.

## Product behavior

The parent supplies all nodes, their `parentId` or nested `children`, status and optional telemetry. Omitted/null status is first-class **Unknown**. The default integration example has seven navigable related nodes, seven unknown statuses, and no fabricated model, cost or duration. This works without telemetry or a backend.

`selectedId` is controlled; `onSelect(node)` only requests navigation. `collapsed`/`onCollapsedChange` support controlled folding, with optional local UI-only folding via `defaultCollapsed`. Child fold choices survive folding and reopening a parent. Arrow keys, Home/End, Enter/Space and focus recovery operate on visible tree items. System reduced motion, including a live preference change, disables loader/shimmer and layout animation.

Costs are explicit caller-provided objects. The component does not aggregate. Missing cost is omitted, actual numeric zero remains zero, and `completeness:'partial'` always adds a visible `partial` suffix. A total appears only when `totalCost` is supplied. `durationLabel` is a caller-provided string. The sample clock, estimated source cost progression and automatic sample transitions exist only in Study.

## Verification

`evidence/integration-supplement/agent-tree/verification/checks.json`: **11 browser checks passed, zero page errors**.

1. Unknown relationships remain unknown without cost/time fabrication.
2. Selection callback does not change selection until the parent updates props.
3. Controlled folding waits for the parent to accept its callback.
4. Arrow navigation, nested folds, restored child folds, Enter and Space.
5. Rapid fold reversal restores the full nested topology.
6. Removing a focused node returns focus to its retained ancestor.
7. Flat parentId data and an unavailable parent remain visible.
8. Partial branch cost, missing cost and genuine zero are distinct; no implicit total.
9. Empty data and caller-supplied running→done updates.
10. 375px viewport with four nested levels remains within the container.
11. Live reduced-motion preference stops loaders/shimmers/layout animation.

Scoped strict TypeScript compilation passed for the component, Study and independent entries. Light unknown, complete-source fixture, partial cost, nested narrow and dark screenshots were inspected. Main separately reported whole-repository build, real registry install/file-body equality and consumer browser checks including selection/folding; that broader verification is main-owned and was not repeated here.

## Limitations and intentional differences

- This is read-only relationship navigation, with no approve/reject/retry dialogs or run mutation. The source's failed/needs-you summary controls are informational counts here.
- No real jobs, SSE, files, deadlines, or project/backend contract is connected or claimed.
- The fixture matches observed sample states and final values; its intermediate cost progression, automatic fold timing and repeated-cycle timing are fitted. They are not an exact recovery of the source timeline. Motion exit/reversal timing is fitted, not claimed 1:1.
- Selection hover/focus/highlight is added to support the controlled product API; the public preview did not reveal persistent selection styling.
- Source light/760px behavior is the fidelity target. Narrow and dark product behavior was exercised, but not validated as pixel-identical to the source's narrow/dark variants.
- Rendered brand SVG marks were captured from the public page on 2026-10-29 and are scoped to Study. They are third-party brand assets; no Pro source-code license or trademark rights are inferred. The reusable component has no brand assets or fixture dependency.
- Main owns shared gallery, registry and package changes. Re-distribute the final `agent-tree.tsx`/`agent-tree.css` and final Study assets after the last calibration; no additional dependency is required.

## Final media publication

Both final native captures completed their full scripted action chains with zero page errors and are published at the paths above. The complete-process contact sheets and final expanded screenshots were inspected. `comparison.png` places the 760px source and replica captures side by side at their original scale. Card geometry, hierarchy, task wrapping and connector routing align; the failed-summary button and selection interaction differences are intentional and listed above. The initial page-load lead-in is retained in each native recording, so use rendered phase onset rather than file time zero to align animation.

After the main-thread handoff request, no further component-source changes were made. Final media, analysis and capture scripts were the only subsequent changes. The agent-tree recording marker was removed on successful completion.
