# Fluid Notch motion review — delivered

Source freeze: **2026-10-30 11:51:45 Asia/Shanghai** (`evidence/batch/fluid-notch/motion-review/source-freeze.json`). All component edits are frozen; parent can regenerate shared distribution. Preview remains on **4211**, HMR disabled. Shared gallery, skill, registry, public, build configuration, and dependencies were not edited.

## Fixed findings

- Shell expanded too quickly and had too little overshoot. Fit the public rendered width/height trace with a 260/25.6/1 spring. Source geometry now has 281×40 compact, 340×242 first question, 340×222 next questions, 340×202 completion, 222×40 completed pill, and 20→26 radius. MenuFold retains its top anchor and 44px compact height.
- Text was resolving too early: previously about .58 opacity at 160ms; source about .42. Expanded content now has a 120ms delay and 350ms fit; summary fades separately and returns after 140ms. The expanded subtree never scales. Compact content has fixed width during shell expansion so avatar/count positions do not spread with the shell.
- Answering replaced the visible departing question immediately. Only outgoing header text/body are retained while fading. The icon stays live, so its completed check remains drawn when the completion card reopens. The original overbroad snapshot restarted the header animation; this was caught and corrected during this review.
- Progress completion was a short fill/check swap. It now fills the ring first, starts the filled-circle spring at +350ms, and starts the check at +550ms. Both compact and expanded completion checks are visible in actual final frames; computed SVG opacity/dash checks pass.
- Dark comparison grain was too faint and shadow too short. Fine static grain is stronger, the dark rim no longer has an invented radial highlight, and the 24/48 plus 6/16 shadow layers match measured falloff. Dust covers the perimeter and follows the same width/height spring as the shell.
- Old replica videos contained transient viewport jumps produced by locator screenshots during recording. The final capture uses a dedicated browser on 4211 and performs no screenshot or dense DOM sampling during the 1× lifecycle.

## Validation and exact evidence

- `replica/lifecycle.webm`: final **26.16s / 654 native 25fps frames**, all three questions → completion → reset → keyboard repeat, then MenuFold files/remove, music/play/seek/next/pause, status/complete/reset/error, keyboard tabs, close/reopen, 70ms reversal, outside and repeated dismissal.
- `replica/validation.json`: passed, including computed opacity/dash of the expanded completion check, keyboard/focus, 375px, reduced motion, disabled input, and no page errors.
- `motion-review/geometry-validation.json`: five openings, including reset and completion; width/height normalized spring mismatch ≤**0.172px**. Hidden pre-open height 340px is retained MenuFold content; the first rendered open frame targets 242px. It is not a wrong-target shell jump. A question answer followed by reopening after 70ms settles at the next question’s 222px height. Neither shell nor expanded text has scale transforms.
- Actual phase anchors (native media PTS; never compare filenames by index): question-2 opening **reference 4.24s / before 2.24s / final 2.08s**; first contraction **2.20s / 1.32s / 1.16s**. The opening and exit comparison sheets include the preceding frame, first changed frame, mid, overshoot, and settle. Native sampling uncertainty is up to 40ms.
- `motion-review/open-comparison.png`, `exit-comparison.png`, `completion-icon.png`, `static-texture.png`, plus their PTS JSONs. The first reference opening has repeated/stalled frames, so the smoother question-2 opening is the primary video comparison; source DOM timing is a separate measurement.
- `replica/source-complete.png`: final expanded card at **5.96s**, visible check. `replica/keyframes/` refreshed from final native frames. `motion-review/*-decoded/` contains full decoded sequences and PTS. All original source video retained.
- Targeted TypeScript check for the two TSX files passed. Geometry checks and render evidence, not typecheck, support the visual findings.
- Baseline: `motion-review/before/` preserves assigned source, original replica recordings/stills and previous analysis. Frozen source copy: `motion-review/final-source/`.

## Files and integration

Changed `src/components/fluid-notch.tsx`, `src/components/fluid-notch.css`, `src/batch/fluid-notch/Study.tsx`, and `src/batch/fluid-notch/study.css`. Added optional `compactHeight` and `expandedRadius` parameters, retaining default 44 / 28. Only new scripts are `scripts/menufold-review/fluid-*.mjs`; evidence stays under `evidence/batch/fluid-notch`.

## Remaining differences

Avatar photos remain initial placeholders; close button remains an extra affordance. Font glyphs/weights, particle trajectories and grain tiling are approximate. Source compact progress is brighter than the muted expanded header. Native 25fps cannot establish exact peak timing. MenuFold light styling, fixed top anchor, files/music/status content, immediate caller state, Escape/outside preserving caller data, and automatic tab activation are retained product decisions. There is no source preview for those MenuFold business sections. No blanket 1:1 claim.

## Concrete skill lessons for parent

1. Retain the outgoing text/body through dismissal, but keep independent progress/icon tracks live. Freezing an entire view can accidentally replay an already completed icon when reopened.
2. A hidden retained panel height is not itself a motion bug. Compare the first rendered shell frame and the target trajectory before changing measurement code.
3. Preserve a fixed text coordinate system while the shell changes size. Measure shell and content transforms separately; inspect typography during the pop, not just settled screenshots.
4. Record without locator screenshots; even a screenshot of the component can momentarily change the compositor viewport. Extract stills afterwards and anchor by actual visible changes/PTS.
5. For SVG motion, inspect computed opacity/dash and actual pixels. Raw attributes may retain their starting values while compositor animation overrides them.
