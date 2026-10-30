# partition-list — color correction, 2026-10-30

Source frozen **12:18:50 +08:00**. Source neutral #f5f5f5 rows, #0a0a0a ink and white controls restored. Selected destinations use gray fill plus a distinct edge; pending/error retain semantic amber/red. Added descriptions/counts are darkened for readable contrast. TSX and all layout/request logic unchanged.

The previous warm gray/olive theme was agent-invented, not user-approved. Current source colors and local semantic additions are documented in [group handoff](../../../notes/menufold-color/lists.md). Fresh evidence: [rendered reference styles](color-review/reference-colors.json), [reference image](color-review/reference-default.png), [actual final state screenshots](color-review/after/), [contrast](color-review/contrast.json), [targeted behavior/standalone-CSS checks](color-review/verification.json), [unchanged initial geometry](color-review/geometry-preserved.json), [source freeze](color-review/source-freeze.json). Small-text contrast minimum in sampled roles: **4.54:1**.

Current [canonical lifecycle](replica/lifecycle.webm) and [native color-state frames](replica/keyframes/contact.png) were regenerated once from the frozen source and inspected. Canonical desktop/narrow/special-state stills were refreshed. [Pre-color source/media](color-review/before/) are retained. No new motion audit or dense lifecycle extraction; existing timing/geometry/business/keyboard contracts are preserved. No shared integration artifacts or root build changed here.

## Earlier motion review — historical evidence

The following review predates the color correction. Its palette statements and source-freeze time are historical; replica links point to the preserved pre-color recording, so prior phase timestamps remain usable. Current palette/validation and remaining differences are in the group handoff above.

### PartitionList — motion review, 2026-10-30

Source: [Animate UI Pinned List](https://animate-ui.com/docs/primitives/animate-ui/pinned-list).

## Result

No new defect found. Component TSX/CSS and canonical footage are unchanged. The existing position-only layout spring (320 / 25 / .8) preserves text size and carries an accepted return move from the current rendered location. Pending and rejected requests never change the item’s group; only caller-owned `items` updates do.

## Four tracks and observed phases

- Icons: the source pin/pin-off swaps without an independently observed icon animation. MenuFold uses static caller icons and labelled destination controls; the added pending spinner stops under reduced motion.
- Light: source neutral tiles and MenuFold warm-white/blue fills are static; no glow choreography was observed.
- Text: rows retain native text geometry throughout travel. Persistent labels/counts and error/pending text remain MenuFold behavior.
- Layout: [source detail frames](motion-review/reference-detail-contact.png) at 6.08 s before, 6.12–6.24 s start/middle, 6.32–6.40 s near peak, 6.60–6.72 s settled. Separate source measurement shows Inbox y=478→326, overshooting to 323.05 at 241 ms. [Canonical replica](color-review/before/replica/lifecycle.webm) covers success/return/interruption around 4.4–6.2 s. This review's rendered samples explicitly interrupt an accepted move with an accepted return, retaining one row and continuous position; matrix scale stays 1. No fabricated motion change was made.

## Remaining differences

Three persistent partitions, counts, empty messages, descriptions and labelled controls differ from the two-group pin example and its fading empty heading. Pending/error UI is caller data. These static/product differences remain; they do not explain away missing row movement, which is already present and verified.

## Evidence and verification

Complete existing reference and baseline videos were decoded, with whole-lifecycle contact sheets under `motion-review/reference-sequence/` and `motion-review/before-sequence/`. Relevant real transition frames were inspected with `view_image`; no source code, bundles or React internals were read. Before-edit TSX/CSS, Study and replica footage are retained in [motion-review/before](motion-review/before/). The reference footage stays in its original location.

[Rendered samples](motion-review/after-rendered-samples.json) were captured in a separate, non-recording Chrome run at normal animation speed. [Verification](motion-review/verification.json) records affected behavioral checks. [Source freeze](motion-review/source-freeze.json): 2026-10-30 11:41:37 Asia/Shanghai. Isolated Vite 4216, HMR disabled; root 4187 was confirmed running and was not used for recordings. No dependencies or shared registry/bundle files changed. TypeScript no-emit passed after the final source changes; visual conclusions come from rendered evidence, not typechecking.

Video times below are navigation anchors from actual decoded frames at the encoded 25 fps. Exact decoder PTS was unavailable; these are not sub-frame timing or action-clock alignment claims.
