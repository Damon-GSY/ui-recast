# Agent Plan: read-only TodoWrite snapshot

Source: https://www.affectui.com/components/agent-plan, public Clean/light preview observed on 2026-10-29. Source code and installation are Pro gated; evidence came only from visible DOM, computed styles, rendered SVG/animations and the public API documentation. No original implementation or bundle was read. Existing agent-run plan evidence was consulted read-only; this component is independent of AgentRun and its types.

## Scope and action coverage

The public source is an editable execution plan. This delivery is a **read-only snapshot presentation** of external FC TodoWrite data. These are intentionally different action contracts; the local recording is not evidence of parity with the editable source.

| Source reference recording | Local replica recording |
| --- | --- |
| Draft plan with Run/Cancel, edit/remove/add affordances | Pending snapshot supplied by the Study |
| Run plan; each step executes with live elapsed time | External “Active snapshot” and “Next snapshot” buttons replace immutable data |
| Third step fails, error message and Retry from here | An unknown/error snapshot preserves raw status labels with neutral styling |
| Retry resumes, remaining steps complete | External “Completed snapshot” supplies completed statuses |
| Run again starts executing again | External empty/pending snapshots replace the list |

The source recording covers draft → run → failure → retry → done → Run again, with the first step visibly executing again at the end. It does not exercise rename/drag/add/remove or Cancel. Their presence and public keyboard documentation were observed, and earlier workspace evidence covers some edits. The local component has no Run, Retry, Cancel, edit, add, reorder or remove affordances, even for unknown/error statuses. Its recording keeps the fixture controls and explanatory text visible outside the component. No timings, costs, job IDs or backend activity are fabricated.

- [Official workflow](reference/lifecycle.webm)
- [Local snapshot workflow](replica/lifecycle.webm)
- Direct local harness: http://127.0.0.1:4187/scripts/agent-plan/harness.html

## Measurements and visual decisions

New measurements are in `evidence/integration-supplement/agent-plan/source-{draft,running,failed,done}.json`; they supersede the larger AgentRun plan's geometry for this standalone reference.

Measurement viewport: 1440×1000; source card origin x=624, y=450. Final native source recording: 1000×850 with source origin x=404, y=180 after scrolling. Native local recording: 1000×850 with card origin x=280, y=262, below the external fixture controls.

| Visible property | Measured standalone source | Read-only adaptation |
| --- | --- | --- |
| Card width / corner radius | 440px / 10px | Same |
| Card shadow | 0.5px outer hairline + two small shadows | Same measured values |
| Header | 70px, padding 16px 16px 10px, 4px gap | Same with short optional version/round metadata |
| Title | Inter 15px / 24px, weight 500 | Same type scale |
| Content | Inter 13px / 20px, weight 500 | Same |
| Non-editable row gutters | 8px 10px, 20px marker + 10px gap | Same, without unused duration column |
| Pending marker | 20px circle, inset 0.5px hairline, 11px number | Same |
| Active marker | Blue 14px eight-ray spinner, stroke 1.4 | Same |
| Completed marker | Blue fill and white 12px check, stroke 1.6 | Same |
| Footer | 48px | 48px with data-derived completed count |
| Source heights | Draft 430px; running/done 394px; failure 452px | Pending/completed 304px; active 322px with one activeForm line |

Source descriptions, tool chips, runtime/error details and timers are not part of the supplied TodoWrite contract. They are not synthesized. Consequently the card is shorter and the width available to content is larger. Original `content` stays visible when optional `activeForm` is present; the latter appears as secondary text only while its supplied status equals `in_progress`. Version and round are shown only when the caller supplies them.

The visual pass corrected the initial AgentRun-derived neutral completion marker to the standalone source's blue fill, the title from 14px to 15px, corner radius from 8px to 10px, and spinner/check dimensions and strokes. Local active, unknown, narrow and dark screenshots were inspected directly. The 320px case wraps the long version, Chinese content, activeForm and an unbroken unknown status without clipping or horizontal scroll.

## Four motion tracks

- **Icons:** the SVG stays fixed; eight rays fade from opacity 1 to .18 over 800ms, staggered by 100ms. Marker entrance is opacity 0 → 1 and scale .5 → 1 over 360ms with `cubic-bezier(.22,1,.36,1)`. The check draws stroke offset 1 → 0 over 420ms after 80ms. Both tracks are measured from rendered source animations and used locally.
- **Light/color:** marker fill/color change over 320ms. The 1px connector fills with a blue `scaleY(0 → 1)` from its top over 560ms using the same cubic curve. No surrounding animated glow was observed. Source execution-footer shimmer is not reproduced on the read-only completed-count label.
- **Text:** original content remains keyed to its ID. Active form fades up 3px over 300ms as a local adaptation. There is no typewriter, changing runtime or price label. The source's duration-label entrance has no matching field in the local contract.
- **Layout:** existing rows glide when their external order or height changes, using Motion position layout with 420ms duration. New rows fade upward. Removed rows leave the DOM immediately: retaining exit rows previously left stale `aria-current` semantics when a snapshot was replaced, so the read-only snapshot contract takes precedence over source deletion animation. Reduced motion disables CSS transitions/animations and Motion layout movement; the spinner remains visible and still.

`local-motion.json` contains 42 actual requestAnimationFrame samples over 657.5ms: the check passes through intermediate offsets and settles at zero. An external snapshot replacement during an active transition immediately removes old active rows. `source-*.json` retains browser-reported animation keyframes and timings. Native recordings and dense measurements were separate stages, guarded by the group recording marker.

`completion-detail.png` was inspected at 2× scale. It compares eight real native frames per side, 80ms apart, anchored to the first visibly filled blue marker (source 4.76s; local 1.72s). Both show the filling circle, drawing check and extending connector. The local connector is shorter because its row has no source description/tool line. The phase anchor is quantized to native 40ms frames and does not establish sub-frame curve equivalence. `reference-contact.png` and `replica-contact.png` were also inspected across the entire recorded workflows.

## Verification

- Targeted strict TypeScript check passed for the two public source files' import graph and Study/fixtures.
- Scoped Vite production build passed without modifying registry/gallery/build configuration. Vite emitted its client-directive warnings for the browser bundle; the distributable source retains `'use client'`.
- 25 real Chrome checks passed (`verification.json`), including double-click + Enter/Delete/Alt-arrow/Escape/Space producing no edits; Tab skipping the read-only card; external Enter/Space fixture callbacks replacing version/round/data; activeForm and completion count; literal neutral unknown/error statuses; empty state; immutable external order/removal; no autonomous progression or clock; 320px container and viewport; dark theme; and reduced motion.
- Frozen fixture objects/arrays render and update without mutation errors; no browser runtime errors were observed. A separate transition-interruption check passed.
- Native source and replica recordings are 1000×850 at 25fps. One-second overview contact sheets retain video timestamps; these are overview samples, not precise motion measurements. The source card was repositioned to y=180 so the full failure state remains visible; the earlier viewport baseline is retained separately.

## Limitations

This is not a 1:1 editable Agent Plan or a complete source API implementation. Editing, execution, retries, live clocks, descriptions, tool chips, durations and runtime footer shimmer are deliberately outside the snapshot contract. The local fixture workflow and source workflow have different timing, contents and heights, so their videos cannot be treated as identical action chains or frame-aligned fidelity proof. Dark colors and the 320px adaptation are locally verified; a narrow/dark source comparison was not performed. Card metadata, empty/unknown state, activeForm placement and immediate row removal are explicit adaptations.

No real FC producer, jobs/SSE/files/deadline backend or application lifecycle contract was available. The typed `snapshot` prop is the external integration boundary. Main owns public gallery routing, registry generation, collection packaging and independent-consumer validation; those are not claimed by this scoped component handoff.
