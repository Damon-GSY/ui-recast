# selectable-cards — color correction, 2026-10-30

Source frozen **12:18:50 +08:00**. Source black cards, #f4f4f5 titles, #a1a1aa descriptions and the measured slate hover border restored. Selection/check, focus and disabled colors remain independently recognizable. Study shells/thumbnails are neutralized; component TSX and hover/selection motion unchanged.

The previous warm gray/olive theme was agent-invented, not user-approved. Current source colors and local semantic additions are documented in [group handoff](../../../notes/menufold-color/lists.md). Fresh evidence: [rendered reference styles](color-review/reference-colors.json), [reference image](color-review/reference-default.png), [actual final state screenshots](color-review/after/), [contrast](color-review/contrast.json), [targeted behavior/standalone-CSS checks](color-review/verification.json), [unchanged initial geometry](color-review/geometry-preserved.json), [source freeze](color-review/source-freeze.json). Small-text contrast minimum in sampled roles: **5.81:1**.

Current [canonical lifecycle](replica/lifecycle.webm) and [native color-state frames](replica/keyframes/contact.png) were regenerated once from the frozen source and inspected. Canonical desktop/narrow/special-state stills were refreshed. [Pre-color source/media](color-review/before/) are retained. No new motion audit or dense lifecycle extraction; existing timing/geometry/business/keyboard contracts are preserved. No shared integration artifacts or root build changed here.

## Earlier motion review — historical evidence

The following review predates the color correction. Its palette statements and source-freeze time are historical; replica links point to the preserved pre-color recording, so prior phase timestamps remain usable. Current palette/validation and remaining differences are in the group handoff above.

### SelectableCards — motion review, 2026-10-30

Source: [Aceternity Hover Effect](https://ui.aceternity.com/components/card-hover-effect). The MenuFold appearance Study retains separate Background/Shape choices, controlled radio semantics and native hidden form values.

## Finding and correction

The baseline used incoming/outgoing shared-layout spans with separate opacity animations. During rapid Solid→Glass→Solid movement the visible combined hover opacity dropped to about .059 at sample 175 ms; in a settled transfer the same conflict could leave the destination almost transparent. This is a rendered local continuity defect. Merely delaying exit did not fix a steady transfer and was discarded.

There is now one background span per radio group. Its position and size move toward the hovered slot; it fades only on entry/leave, follows supported container resizing, and stays below every card at z-index 0 versus card z-index 1. Retargeting continues from its current position with the existing fitted 450 / 36 spring. No card content scales or moves. Selection and hover remain independent.

Changed: [selectable-cards.tsx](../../../src/components/selectable-cards.tsx), [selectable-cards.css](../../../src/components/selectable-cards.css). Study unchanged.

## Four tracks and observed phases

- Icons: the added check already crossfades over 120 ms with the selected fill/border (150 ms). Final frame 3.08 s shows outgoing/incoming checks; no missing pop/rotation was established. Thumbnails are static caller artwork.
- Light: static card shadow; one gray hover surface travels continuously. The source has no observed glow or animated shadow.
- Text: fixed geometry and readable throughout the transfer. All hover layers stay behind every sibling card.
- Layout: [final canonical video](color-review/before/replica/lifecycle.webm), [phase crops](color-review/before/replica/keyframes/contact.png): 1.24 s before transfer, 1.32–1.52 s travel, 1.88 s settled; 2.08/2.20/2.36 s rapid reverse, 2.76 s settle; 3.08 s check change; 3.72–4.04 s exit. The source's full existing video and new visible-DOM probe were reviewed, but neither exposed an actual hover-background element in the public light-theme preview. See [live source image](motion-review/source-hover-live.png), [source samples](motion-review/source-hover-samples.json). The old analysis's claim that source background travel had been measured is superseded.

Canonical video/keyframes are replaced; baseline is retained. Verification checks opacity continuity across a full transfer, layer order, independent selection, disabled skip, keyboard/Space, native form submission/omission and reduced motion. Final rapid-reverse rendered samples keep hover opacity at 1 until pointer leave.

## Remaining differences

Current source evidence does not establish a matching hover trajectory or spring; the fix is a demonstrated local continuity repair, not a source-fidelity pass. Black external-link cards become compact warm-white radio cards, with blue selection, original SVG thumbnails, checks and disabled options. No new check choreography was invented where the reference has no check. Exact sub-frame curves remain unestablished.

## Evidence and verification

Complete existing reference and baseline videos were decoded, with whole-lifecycle contact sheets under `motion-review/reference-sequence/` and `motion-review/before-sequence/`. Relevant real transition frames were inspected with `view_image`; no source code, bundles or React internals were read. Before-edit TSX/CSS, Study and replica footage are retained in [motion-review/before](motion-review/before/). The reference footage stays in its original location.

[Rendered samples](motion-review/after-rendered-samples.json) were captured in a separate, non-recording Chrome run at normal animation speed. [Verification](motion-review/verification.json) records affected behavioral checks. [Source freeze](motion-review/source-freeze.json): 2026-10-30 11:41:37 Asia/Shanghai. Isolated Vite 4216, HMR disabled; root 4187 was confirmed running and was not used for recordings. No dependencies or shared registry/bundle files changed. TypeScript no-emit passed after the final source changes; visual conclusions come from rendered evidence, not typechecking.

Video times below are navigation anchors from actual decoded frames at the encoded 25 fps. Exact decoder PTS was unavailable; these are not sub-frame timing or action-clock alignment claims.
