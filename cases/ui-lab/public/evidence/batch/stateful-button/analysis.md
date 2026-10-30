# StatefulButton — current color review and preserved motion

Source frozen 2026-10-30. Public rendered reference: [StatefulButton](https://ui.aceternity.com/live-preview/stateful-button-demo). FixedDock additionally uses [Aceternity Floating Dock](https://ui.aceternity.com/live-preview/floating-dock-demo). Only rendered screenshots, visible DOM and computed CSS were inspected; no gated source, bundle text or React internals.

## Current palette

Exact measured source green oklch(0.723 0.219 149.579), white text/icons, and white 2px offset + same-green 4px outer hover ring. Idle, pending, success and retry retain the same primary pair. No dark-to-blue state substitution. No invented inset highlight/drop shadow. Local keyboard outline #008236; disabled #f5f5f5 / #737373; error reason #b91c1c. Study stage is neutral #f5f5f5.

Full property/source-versus-choice mapping: [color handoff](../../../notes/menufold-color/dock-buttons.md). Public rendered measurements and screenshots are in [color-review](color-review/source-rendered.json). Exact pre-edit CSS/TSX, Study, screenshot, analysis and complete previous replica are retained in `color-review/before/`.

## Preserved behavior

300ms open-arc loop, 200ms radial exit + 200ms completion entry, immediate labels, fixed reserved slot, press feedback, reduced motion and real caller-owned state remain unchanged.

Component TSX and Study TSX are byte-identical to the baseline. Only color/paint CSS properties changed; layout, timing and curve declarations were compared against the saved baseline. Prior motion review results remain in `motion-review/`; those images/phase anchors describe the earlier footage and are historical, not current palette evidence. Historical blue ring/palette assertions are superseded by `scripts/menufold-color/dock-buttons-verify.mjs`.

## Current verification and media

11 checks: observed source green, green ring entry/exit and spread, pending/success ring, complete color-pair continuity, white endpoint SVGs, 140x42 layout size, error contrast 6.47:1, disabled visibility/no ring, keyboard focus and reduced motion. Source white/green stays 2.217:1 throughout completion; no interpolation-induced text disappearance.

See [targeted verification](color-review/verification.json). Browser measurements were separate from recording. The initial color lifecycle was recorded once, then replaced by one parent-requested isolated `--stateful` rerecord, at normal speed, on isolated 4215 with publicDir:false, no HMR/watching and one Chrome context at a time. Current [lifecycle](replica/lifecycle.webm), [full recording](replica/source-full.webm), [events](replica/events.json), [keyframes](replica/keyframes.html) and [state sheet](replica/transition-sheet.png) are synchronized. The canonical nine state frames were refreshed. The affected success window was inspected in 26 consecutive native decoded frames over a requested 1.08 seconds; this is not a full motion audit or full-lifecycle extraction. Seek markers in keyframes are requested media positions, not exact phase onsets.

No root build, new dependency, registry or shared-gallery change. Parent owns installs/builds/integration.

## Remaining differences / limitations

Approved reserved 18px icon and 140x42 layout, rounded rectangle, changing Chinese labels and caller-owned results remain; source is an expanding capsule. Source green/white does not satisfy 4.5:1 text contrast. Keyboard/disabled/error colors are semantic additions. The brief recording/compression artifact near 5.1s persists after the single authorized isolated rerecord. It is visible in success-window frame 011; adjacent frames and the canonical success still near requested 5.26s are clear. No further recording, frame repair or interpolation was performed. See [window review](color-review/rerecord-success-window/review.json) and its actual frame sheets. Previous canonical media are preserved in `color-review/rerecord-before/replica/`. CSS/TSX and the existing 27-check results are unchanged; no checks were rerun.
