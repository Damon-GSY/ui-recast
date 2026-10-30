# event-list — color correction, 2026-10-30

Source frozen **12:18:50 +08:00**. Source white cards, #262626 title/description, #6b7280 time and exact blue/teal/yellow/pink icon surfaces restored. Source black shadow layers restored. Only TSX change is the icon data-tone attribute; caller status semantics are preserved. Selected time is darker for contrast.

The previous warm gray/olive theme was agent-invented, not user-approved. Current source colors and local semantic additions are documented in [group handoff](../../../notes/menufold-color/lists.md). Fresh evidence: [rendered reference styles](color-review/reference-colors.json), [reference image](color-review/reference-default.png), [actual final state screenshots](color-review/after/), [contrast](color-review/contrast.json), [targeted behavior/standalone-CSS checks](color-review/verification.json), [unchanged initial geometry](color-review/geometry-preserved.json), [source freeze](color-review/source-freeze.json). Small-text contrast minimum in sampled roles: **4.83:1**.

Current [canonical lifecycle](replica/lifecycle.webm) and [native color-state frames](replica/keyframes/contact.png) were regenerated once from the frozen source and inspected. Canonical desktop/narrow/special-state stills were refreshed. [Pre-color source/media](color-review/before/) are retained. No new motion audit or dense lifecycle extraction; existing timing/geometry/business/keyboard contracts are preserved. No shared integration artifacts or root build changed here.

## Earlier motion review — historical evidence

The following review predates the color correction. Its palette statements and source-freeze time are historical; replica links point to the preserved pre-color recording, so prior phase timestamps remain usable. Current palette/validation and remaining differences are in the group handoff above.

### EventList — motion review, 2026-10-30

Source: [Magic UI Animated List](https://magicui.design/docs/components/animated-list). Controlled API, supplied order/timestamps, status data and callbacks remain unchanged.

## Finding and correction

The baseline new row started at scale .98 / y -9 while existing rows jumped instantly by one row pitch. This omitted the source's visible growth and displacement. Source frames 2.84–3.60 s show a small new card growing while the old card moves downward; reference rendered samples reach scale .972 at about 322 ms. No visible overshoot was established, so none was added.

The new card now uniformly scales 0→1 and fades in, with a fitted overdamped spring (420 / 46). A separate position-only `motion.li` makes existing rows yield without scaling their text. An insertion revision only triggers this layout motion when a previously unseen ID arrives. Initial rows, status updates, known-ID restoration and caller reordering retain immediate behavior. Removing/clearing remains immediate; a removed record never remains as an interactive exit ghost.

Changed: [event-list.tsx](../../../src/components/event-list.tsx), [event-list.css](../../../src/components/event-list.css). Study unchanged.

## Four tracks and observed phases

- Icons: caller/static outline icon moves with its own card. No independent icon morph or rotation exists in the source or fixture.
- Light: source shadow is stronger; the MenuFold static warm-white border/shadow is retained. No animated glow observed.
- Text: only the incoming card scales uniformly; old titles/timestamps retain scale 1 during position travel. Status and timestamp strings do not animate or replay entrance.
- Layout: final [canonical video](color-review/before/replica/lifecycle.webm), [phase frames](color-review/before/replica/keyframes/contact.png): .72 s before visible growth; .80–.92 s onset/mid-growth; 1.08–1.40 s settling; 5.36–5.64 s a second insertion interrupts displacement; 6.20–6.32 s clear during entrance; 7.68 s keyboard selection. Source detail contact: [2.84–3.60 s](motion-review/reference-detail-contact.png). Baseline insertion was around 1.48–1.80 s in the preserved video.

Final recording includes server failure/success, reverse order, hide/restore, two rapid additions, clear mid-entrance, reset and keyboard selection. Canonical video and keyframes have been replaced; previous versions remain under `motion-review/before/replica/`.

## Remaining differences

Source promotional emoji, 18 px titles, 400×80 cards, 96 px pitch and stronger shadow differ from the compact settings styling. Initial values remain visible and there is no automatic business-event queue. The new spring is a rendered fit, not recovered source parameters. This closes the missing growth/displacement behavior; it is not a 1:1 styling claim.

## Evidence and verification

Complete existing reference and baseline videos were decoded, with whole-lifecycle contact sheets under `motion-review/reference-sequence/` and `motion-review/before-sequence/`. Relevant real transition frames were inspected with `view_image`; no source code, bundles or React internals were read. Before-edit TSX/CSS, Study and replica footage are retained in [motion-review/before](motion-review/before/). The reference footage stays in its original location.

[Rendered samples](motion-review/after-rendered-samples.json) were captured in a separate, non-recording Chrome run at normal animation speed. [Verification](motion-review/verification.json) records affected behavioral checks. [Source freeze](motion-review/source-freeze.json): 2026-10-30 11:41:37 Asia/Shanghai. Isolated Vite 4216, HMR disabled; root 4187 was confirmed running and was not used for recordings. No dependencies or shared registry/bundle files changed. TypeScript no-emit passed after the final source changes; visual conclusions come from rendered evidence, not typechecking.

Video times below are navigation anchors from actual decoded frames at the encoded 25 fps. Exact decoder PTS was unavailable; these are not sub-frame timing or action-clock alignment claims.
