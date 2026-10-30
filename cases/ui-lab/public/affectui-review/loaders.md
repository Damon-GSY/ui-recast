# Loaders fidelity review — 2026-10-30

Owned scope: `thinking-loader` (Clean and Classic, light) and `agent-graph` (Clean, light). Source edits are complete. Official live previews were revisited in independent headless Chrome at 1440×1000, DPR 1. Inspection used rendered DOM, computed styles, visible SVG geometry and Web Animations; no gated source, bundles or React internals were read.

## Changes delivered

- `src/components/thinking-loader.tsx`: the completion check now follows the observed `M3.5 8.4 6.6 11.3 12.5 4.9` geometry. The existing fixed eight-ray loader, white text sweep, independent outgoing/incoming text timing and 460ms width transition were verified and retained.
- `src/studies/ThinkingLoaderStudy.tsx`: `?capture=clean|classic` now mounts only the live target and reset control. It does not mount the reference-video decoder or its replay callbacks. Business completion/restart stays in the study.
- `src/components/agent-graph.tsx`: secondary entry starts at 400ms rather than 140ms, then staggers by 90ms. Outer entry starts at 880ms and follows clockwise positions, spaced 70ms. Entry scale is .4, matching the rendered reference. Corrected header mark and 10px badge geometry; pending is a 12px SVG arc with 900ms rotation. Detail entry starts at y=4 / scale=.98. Hover now takes precedence over retained keyboard focus, so closing Coder details no longer prevents Researcher hover emphasis.
- `src/components/agent-graph.css`: waiting/error sweep fits the disc (previously inset -50%, twice the diameter). The conic border keeps running while transparent so status changes do not restart its angle. Waiting fill is rgba(255,156,0,.16), status subtitles use weight 500, badges move 1px left. Added observed 260ms call-row entry, corrected the working status-pill palette, and suppressed a stale focus outline only during pointer exploration. Keyboard focus remains intact. All new continuous animations respect reduced motion.

Caller ownership is unchanged: AgentGraph still receives nodes/calls/time; no automatic business execution was added. Shared app/main/catalog/package/build files were not edited.

## Actual visual findings

| Track | Observed reference | Result |
| --- | --- | --- |
| Thinking palette / layout | Clean: white, black .61 text, blue rgba(0,96,226,.765) icon, 32px high / 8px corners / 13px 500 text. Classic: white, #6b6b6b text, #171717 icon, inset #e7e7e7 border, 34px high / pill corners / 14px 450 text. | Existing role colors, spacing and shadows retained. No invented accent-color substitution. |
| Thinking icon / light | Eight stationary rays, 800ms opacity cycle, 100ms offset per ray. Separate white .82 sweep: Clean 1.6s / Classic 1.8s. Check enters after spinner fade/scale and draws with 120ms delay + 360ms stroke. | Check shape corrected; actual completion/restart frames inspected. |
| Thinking text | Old label exits upward 320ms; new label enters from 70% below with blur 3→0 and opacity 0→1 over 460ms. | Current reference confirms previous measurements. Screenshot-sequence supplement records actual capture times where native video misses intermediate frames. |
| Graph surfaces / colors | White panel, .5px black .06 border shadow, neutral text; blue breathing ring 5→11px / alpha .12→.02 over 2.6s. Orange #f5a524 waiting and red #e5484d failure; blue/green/orange/red call tracks. | Role palette retained; waiting fill and working pill corrected from current rendered values. |
| Graph icon / light | 56px lead, 46px agents, 34px outer nodes; 27% radius. Brand assets remain caller-provided. Badge is 14px with a 10px inner SVG. Waiting/error use 110° white .75 sweep over 2.4s and a continuously rotating conic border over 1.2s. | Oversized sweep, badge internals/offset, header mark and pending arc corrected. The neutral underlying graph and blue halo remain present. |
| Graph text / layout | Names 12px/500; model 11px/400; waiting/error subtitle 11px/500. Header fixed 20px, stage 486px. Detail width 260px with four recent calls. | Subtitle weight and entry timing corrected. Full insertion, removal, completion, detail open/close, hover and retrigger recorded. |

## Evidence and verification

Baseline source and screenshots: `evidence/{thinking-loader,agent-graph}/fidelity-review/before/`. Previous canonical videos are preserved under `before/canonical-media/` before replacement. The first final Graph recording that exposed the hover defect remains in `evidence/agent-graph/fidelity-review/first-final/`.

- Thinking current official screenshots/computed values: `evidence/thinking-loader/fidelity-review/reference/{working,classic-working,done}.{png,json}`. The existing complete 18s official recordings under `motion-study/reference/{clean,classic}/` remain applicable after current verification: five phases, completion at 10s, automatic restart at 12.6s and another phase change. Both final local styles were newly recorded for 18s under `fidelity-review/replica/{clean,classic}/`.
- Graph current complete official and final local 36s recordings: `evidence/agent-graph/fidelity-review/{reference,replica}/full-lifecycle.webm`, with same-scale `lifecycle.webm`, `detail.webm`, native transition frames and `video-timeline.json`. Scope includes Stripe add/remove, Writer waiting, Coder failure/recovery, all-agent completion, details, hover and manual replay.
- Actual viewed comparisons: `fidelity-review/*-comparison.png`, plus Graph `replica/hover.png` against `reference/hover.png`. Thinking `reference|replica/<style>/microframes/` adds actual-time screenshot sequences rather than fabricated/interpolated frames. Videos are native 25fps; no upsampling claims.
- Targeted TypeScript checks passed for these components and studies (no root build).
- `evidence/agent-graph/fidelity-review/verification.json`: seven browser checks, zero page errors, covering delayed entry, waiting light/icon tracks, pending animation, Escape/focus, reduced motion, and both Thinking complete/restart cycles.
- `evidence/agent-graph/fidelity-review/hover-verification.json`: pointer priority regression passed, including return to the retained focus after pointer leave. A test assertion initially compared CSS `0px` to `0`; it was corrected to compare the numeric value. No component defect was inferred from that representation difference.
- Fresh Graph reference vs first local state changes, measured relative to each reset: Writer waiting 8505/8522ms; Coder error 10505/10539ms; lead completion 13904/13934ms. These are state-change measurements, not proof that every pulse or pixel is aligned.

Capture/verification scripts are `scripts/affectui-review/loaders-*`. The isolated preview runs at port 4221 with HMR/watch disabled, unique `node_modules/.vite-loaders-4221` and React/ReactDOM deduplication. Recordings ran sequentially, with extraction only after recording stopped. Canonical component media and analysis are updated after final inspection. Registry/install/gallery/build integration belongs to the parent task and is not claimed here.

## Remaining deltas and limits

- Graph pulse travel/tail rendering, fitted per-call timing, node fees and dynamic outer-node repositioning still use an independent approximation. Exact routing, drift and every pulse phase are not 1:1. Entry staggering and the discovered hover defect were fixed rather than described as adaptations.
- Thinking text may retain roughly 1px width/rasterization differences. Native videos can miss short intermediate frames despite sequential isolated capture; screenshot supplements and actual rendering timestamps distinguish that from a component state jump.
- This review covers the previously implemented light variants only. Dark/small/plain Thinking and alternate Graph appearances/mobile geometry are not newly claimed as reference-matched. No new independent consumer install was performed by this group.

No 1:1 claim.
