# CopyButton — current color review and preserved motion

Source frozen 2026-10-30. Public rendered reference: [CopyButton](https://animate-ui.com/docs/primitives/animate-ui/copy-button). FixedDock additionally uses [Aceternity Floating Dock](https://ui.aceternity.com/live-preview/floating-dock-demo). Only rendered screenshots, visible DOM and computed CSS were inspected; no gated source, bundle text or React internals.

## Current palette

Animate source lab(2.75381 0 0) / lab(98.26 0 0) mapped to sRGB #0a0a0a / #fafafa. Hover uses source 90% primary alpha. Copied feedback retains black/white instead of blue. No shadow; existing 1px border is transparent to preserve geometry. Neutral #a1a1a1 focus hue; 50% disabled opacity keeps SVG visible. Chosen local error red #b91c1c. Study canvas/cards are white with neutral text.

Full property/source-versus-choice mapping: [color handoff](../../../notes/menufold-color/dock-buttons.md). Public rendered measurements and screenshots are in [color-review](color-review/source-rendered.json). Exact pre-edit CSS/TSX, Study, screenshot, analysis and complete previous replica are retained in `color-review/before/`.

## Preserved behavior

150ms overlapping blur/scale/opacity crossover, in-place content reset, stale completion protection, actual clipboard promise, keyboard/focus and reduced motion remain unchanged.

Component TSX and Study TSX are byte-identical to the baseline. Only color/paint CSS properties changed; layout, timing and curve declarations were compared against the saved baseline. Prior motion review results remain in `motion-review/`; those images/phase anchors describe the earlier footage and are historical, not current palette evidence. Historical blue ring/palette assertions are superseded by `scripts/menufold-color/dock-buttons-verify.mjs`.

## Current verification and media

9 checks: source palette/hover, keyboard focus, real clipboard readback, visible success glyph, error readability 6.47:1, source color through retry, held-promise completion color continuity and disabled icon visibility. Idle text contrast 18.968:1, hover 15.239:1; sampled completion above 12:1.

See [targeted verification](color-review/verification.json). Browser measurements were separate from recording. The existing complete lifecycle was recorded once for this color update, at normal speed, on isolated 4215 with publicDir:false, no HMR/watching and one Chrome context at a time. Current [lifecycle](replica/lifecycle.webm), [full recording](replica/source-full.webm), [events](replica/events.json), [keyframes](replica/keyframes.html) and [state sheet](replica/transition-sheet.png) are synchronized. Nine actual frames were selected and viewed for color/state checks; this is not a new full motion audit or dense extraction. Seek markers in keyframes are requested media positions, not exact phase onsets.

No root build, new dependency, registry or shared-gallery change. Parent owns installs/builds/integration.

## Remaining differences / limitations

Labeled geometry, reserved 17px icon, persistent copied state and chosen error handling remain local adaptations. The upstream demo is square and resets by timer. Neutral focus hue is retained in the approved outline geometry instead of the source translucent shadow geometry.
