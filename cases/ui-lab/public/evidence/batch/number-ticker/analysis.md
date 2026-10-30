# number-ticker — color correction, 2026-10-30

Source frozen **12:18:50 +08:00**. Study-only palette correction. Main number is source black on white; warm shell, badge, search and button tints are neutralized. Component TSX/CSS and all numeric behavior remain unchanged.

The previous warm gray/olive theme was agent-invented, not user-approved. Current source colors and local semantic additions are documented in [group handoff](../../../notes/menufold-color/lists.md). Fresh evidence: [rendered reference styles](color-review/reference-colors.json), [reference image](color-review/reference-default.png), [actual final state screenshots](color-review/after/), [contrast](color-review/contrast.json), [targeted behavior/standalone-CSS checks](color-review/verification.json), [unchanged initial geometry](color-review/geometry-preserved.json), [source freeze](color-review/source-freeze.json). Small-text contrast minimum in sampled roles: **4.74:1**.

Current [canonical lifecycle](replica/lifecycle.webm) and [native color-state frames](replica/keyframes/contact.png) were regenerated once from the frozen source and inspected. Canonical desktop/narrow/special-state stills were refreshed. [Pre-color source/media](color-review/before/) are retained. No new motion audit or dense lifecycle extraction; existing timing/geometry/business/keyboard contracts are preserved. No shared integration artifacts or root build changed here.

## Earlier motion review — historical evidence

The following review predates the color correction. Its palette statements and source-freeze time are historical; replica links point to the preserved pre-color recording, so prior phase timestamps remain usable. Current palette/validation and remaining differences are in the group handoff above.

### NumberTicker — motion review, 2026-10-30

Source: [Magic UI Number Ticker](https://magicui.design/docs/components/number-ticker).

## Result

No new defect found. Component TSX/CSS and canonical footage are unchanged. The reference changes numeric values without rotating, translating or scaling digit glyphs. Current value interpolation already has that behavior and reverses from the displayed value.

## Four tracks and observed phases

- Icons/light: neither is an animated track in this primitive; fixture icons and panel shadows are static.
- Text: numeric replacement with tabular numerals, no per-digit flip. Original sequence after replay: about 1.80 s zero, 2.40 s 61, 3.20 s 90, 5.00 s 100. Replica initial 24 is immediate; its later 24→38 update has intermediate values around 1.6–1.8 s and settles around 2.0 s. The reversal around 2.4–2.8 s remains continuous.
- Layout: text stays at its native geometry; no overshoot, glow, icon choreography or exit transition was observed to restore.

[Canonical reference](reference/lifecycle.webm) and [replica](color-review/before/replica/lifecycle.webm) remain the reviewed originals. Live checks confirm initial value, reversal, repeated same target, immediate mode, immediate search counts including zero, and reduced motion.

## Remaining differences

Reference replay starts from zero and takes roughly three seconds to settle over 0→100. MenuFold renders the supplied initial value immediately and uses a configurable .65 s update by default. The duration/easing is not claimed identical to the source. Search results remain immediate as required. No extra digit animation was invented.

## Evidence and verification

Complete existing reference and baseline videos were decoded, with whole-lifecycle contact sheets under `motion-review/reference-sequence/` and `motion-review/before-sequence/`. Relevant real transition frames were inspected with `view_image`; no source code, bundles or React internals were read. Before-edit TSX/CSS, Study and replica footage are retained in [motion-review/before](motion-review/before/). The reference footage stays in its original location.

[Rendered samples](motion-review/after-rendered-samples.json) were captured in a separate, non-recording Chrome run at normal animation speed. [Verification](motion-review/verification.json) records affected behavioral checks. [Source freeze](motion-review/source-freeze.json): 2026-10-30 11:41:37 Asia/Shanghai. Isolated Vite 4216, HMR disabled; root 4187 was confirmed running and was not used for recordings. No dependencies or shared registry/bundle files changed. TypeScript no-emit passed after the final source changes; visual conclusions come from rendered evidence, not typechecking.

Video times below are navigation anchors from actual decoded frames at the encoded 25 fps. Exact decoder PTS was unavailable; these are not sub-frame timing or action-clock alignment claims.
