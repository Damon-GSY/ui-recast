# FixedDock — current color review and preserved motion

Source frozen 2026-10-30. Public rendered reference: [FixedDock](https://magicui.design/docs/components/dock). FixedDock additionally uses [Aceternity Floating Dock](https://ui.aceternity.com/live-preview/floating-dock-demo). Only rendered screenshots, visible DOM and computed CSS were inspected; no gated source, bundle text or React internals.

## Current palette

Magic Dock white tray / #e5e5e5 border / #262626 icons; hover #f5f5f5 with #171717 icons. Aceternity Floating Dock provides the neutral #e5e7eb disk reused for local selected state and screenshot-observed #f3f4f6 tooltip fill. No invented blue selection, warm-white shell or warm shadows remain.

Full property/source-versus-choice mapping: [color handoff](../../../notes/menufold-color/dock-buttons.md). Public rendered measurements and screenshots are in [color-review](color-review/source-rendered.json). Exact pre-edit CSS/TSX, Study, screenshot, analysis and complete previous replica are retained in `color-review/before/`.

## Preserved behavior

150ms hover opacity, 180ms/6px tooltip motion, moving neutral hover layer, fixed persistent selection and keyboard/Escape contracts remain unchanged.

Component TSX and Study TSX are byte-identical to the baseline. Only color/paint CSS properties changed; layout, timing and curve declarations were compared against the saved baseline. Prior motion review results remain in `motion-review/`; those images/phase anchors describe the earlier footage and are historical, not current palette evidence. Historical blue ring/palette assertions are superseded by `scripts/menufold-color/dock-buttons-verify.mjs`.

## Current verification and media

7 checks: palette, focus, persistent selected surface during hover, keyboard selection, intact disabled icons, fixed 44px slots, neutral disabled selection. Selected icon contrast 12.223:1.

See [targeted verification](color-review/verification.json). Browser measurements were separate from recording. The existing complete lifecycle was recorded once for this color update, at normal speed, on isolated 4215 with publicDir:false, no HMR/watching and one Chrome context at a time. Current [lifecycle](replica/lifecycle.webm), [full recording](replica/source-full.webm), [events](replica/events.json), [keyframes](replica/keyframes.html) and [state sheet](replica/transition-sheet.png) are synchronized. Nine actual frames were selected and viewed for color/state checks; this is not a new full motion audit or dense extraction. Seek markers in keyframes are requested media positions, not exact phase onsets.

No root build, new dependency, registry or shared-gallery change. Parent owns installs/builds/integration.

## Remaining differences / limitations

Fixed positions, caller icons and selection are retained. Magic and Aceternity source magnification/mobile behavior remain excluded. This combined Dock is not an exact single-source reproduction. Tooltip text/border and focus/disabled roles are chosen neutral additions.
