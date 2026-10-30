# Current color pass — 2026-10-30

Source frozen at **2026-10-30T12:17:14.820857+08:00**. The source reference is now the default Study example; MenuFold files/music/status remain accessible through the existing selector. Black source roles were measured from the public rendered reference. Light adaptation and wrapper colors are neutral, with deliberate green success/red error states and readable disabled text. Motion and geometry are retained from the review below.

Current color evidence and handoff: `color-review/reference-colors.json`, `color-review/validation.json`, `color-review/after/`, `color-review/recorded-frames.json`, and `notes/menufold-color/fluid.md`. The canonical replica video and keyframes were refreshed once from these frozen sources; their action/PTS timeline replaces prior video timing anchors. Source color mappings, semantic additions, contrast limits and remaining differences are detailed in the handoff.

---

## Historical motion review (prior media anchors)

# Fluid Notch · motion review completed

Source freeze: **2026-10-30 11:51:45 Asia/Shanghai**. Canonical source: https://ui.aceternity.com/interactions/fluid-notch. Independent implementation based on public rendered preview, visible DOM/computed styles and actual recorded frames. No Pro implementation, bundles or framework internals were read. No dependency added.

## Result

The review corrected early shell acceleration, early content appearance, missing outgoing-content retention, weak dark grain/shadow, incomplete perimeter dust, and missing ring → filled-circle pop → drawn-check choreography. The expanded completion header now keeps its already completed icon when reopened.

The default MenuFold top anchor, 44px pill, controlled files/music/status behavior, immediate tab state, and caller-owned business state remain. The source geometry example now uses a 281×40 pill, 340×242 / 222 / 222 questions, a 340×202 completion card and a 222×40 completed pill. It grows around its center through its host layout. Shell dimensions animate independently from unscaled text.

Full findings, changed files and integration instructions: [review handoff](../../../notes/menufold-review/fluid.md).

## Observed tracks and fixes

- **Layout:** fit from separate reference render sampling, spring stiffness 260, damping 25.6, mass 1. Actual first-question overshoot reaches about 245px against a 242px final height. Expanded content is a fixed-width unscaled layer. Compact content keeps its own fixed width while the shell changes size.
- **Text:** summary exits independently over 180ms; expanded body starts after 120ms and resolves over 350ms. On dismissal, outgoing text/body remain until reopening; updated business state is still immediate. Compact text returns after 140ms. The first captured source opening contains repeated frames; the smoother second-question opening plus separate DOM trace determine the fit.
- **Icons:** determinate ring fills before completion. Filled-circle spring starts at +350ms, check drawing at +550ms. The icon track stays live while departing text is retained. This prevents the completed header icon restarting when reopening. Final compact and expanded screenshots show the check. Raw SVG attributes can differ from computed animation state; validation uses computed opacity and stroke dash.
- **Light:** stronger static .22 dark grain, no invented dark radial glow, measured neutral 24px/48px/-16px and 6px/16px/-4px shadow layers. Moving perimeter dust follows the same shell width/height spring; it does not jitter the static interior grain. MenuFold retains its lighter color palette and shadow strength.

## Complete evidence

- Source `reference/lifecycle.webm`: **18.96 seconds, 474 decoded native 25fps frames**. Original clip reused; only missing close/completion attribute timing was supplemented in `motion-review/reference-detail.json` through rendered DOM.
- Baseline `motion-review/before/replica/lifecycle.webm`: **27.04 seconds, 676 decoded native frames**. Assigned source and old analysis/stills preserved beside it. It includes screenshot-induced viewport glitches; these are capture contamination, not a component animation.
- Final `replica/lifecycle.webm`: **26.16 seconds, 654 decoded native frames**. Dedicated Chrome browser, isolated preview at http://127.0.0.1:4211/study/fluid-notch, no HMR, no screenshot calls or dense DOM sampling during recording. Complete three-question → completion → reset → repeat sequence and MenuFold files/music/status/keyboard/rapid-reverse lifecycle recorded at normal speed.
- `motion-review/*-decoded/pts.json` records actual native media PTS. Full decoded sequences and contact sheets were inspected with the image viewer. `replica/keyframes/` contains refreshed native frames; filename indices are not phase anchors.
- `motion-review/open-comparison.png`: reference **4.24s**, before **2.24s**, final **2.08s**, each aligned to the first native frame with changed shell geometry in question 2. Pre-trigger, initial, mid, overshoot and settle shown at the same physical scale.
- `motion-review/exit-comparison.png`: reference **2.20s**, before **1.32s**, final **1.16s**, first native geometry contraction; source/replica sampling differs by up to one 40ms native frame.
- `motion-review/completion-icon.png`: actual compact icon phases. `replica/source-complete.png` is the final expanded completion at **5.96s**, with visible check. `motion-review/settled-stills.json` records final still PTS.
- `motion-review/after-rendered.json` and `geometry-validation.json` are separate non-recording measurements. The latter covers all three question targets, completion, reset and a 70ms answer/reopen interruption.
- `motion-review/final-source/` is the frozen source copy; `source-freeze.json` lists the four component/Study paths.

## Verification

`replica/validation.json` passed: full source fixture cycle, completion only after three explicit answers, completion-header computed opacity and dash both 1, file callbacks/disabled file, play/pause/next/keyboard seek, status complete/error/reset, keyboard Enter/Escape/Home/Right, focus return, outside dismissal, repeated opening, 70ms reversal, 375px width, reduced motion and disabled input. No page errors. Targeted TypeScript compilation of the two TSX files passed.

The pre-open hidden panel sometimes retains an old height (340px MenuFold body before source mode, or 242px before question 2). It is remeasured before the first painted opening. Five measured openings followed the correct target from frame 1, with width/height normalized trajectory deviation ≤0.172px. A 70ms answer/reopen continued into the new 222px question without an old-height flash. This observation did not justify changing the measuring mechanism. Expanded panel and shell transform matrices remain unscaled.

## Remaining differences

Original avatar photos are replaced by initials, and the added close affordance remains. Font metrics, exact grain tiling and dust trajectories are approximations; the native 25fps source cannot establish sub-frame peak timing. MenuFold light colors, fixed top anchor, native controls and file/music/status content have no matching source preview. Escape/outside close without consuming a question. Completion heading wording follows the existing Study. No blanket 1:1 or exact particle-path claim is made.

## Reproduce

Run `node scripts/menufold-review/fluid-preview.mjs` for port 4211. `fluid-record.mjs` runs the lifecycle and behavioral checks; `fluid-measure.mjs` and `fluid-verify.mjs` run separate timing/geometry checks. `fluid-export.mjs`, `fluid-frames.mjs replica` and `fluid-sheets.mjs` export recording evidence. Comparison anchor constants in `fluid-sheets.mjs` belong to this frozen recording; determine visible onsets again after a new capture.

Shared skill, gallery player, registry, bundles, root docs/dependencies and public assets remain parent-owned. Concrete skill lessons are in the review handoff.
