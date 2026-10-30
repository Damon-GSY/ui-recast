# Combobox reconstruction study

## Evidence boundary

Public browser preview at https://www.affectui.com/components/combobox, Clean/light, Chrome headless in an isolated browser context, viewport 1440×1000 at DPR 1. Original full interaction video was completed, cropped and its real frames viewed before implementation. The public DOM/computed styles and animation effects were measured separately, without recording or screenshots during video capture. Rendered SVG elements are preserved in `reference/rendered-svg-assets.json`. Pro access and HEAD 401 are in `reference/source-gate.json`. No target source, registry body, bundles or React internals were inspected.

## Four visual tracks

- **Icons.** 20px neutral initial avatars on rows; 16px avatars inside 24px chips. Blue 16px checks go from scale .4 to 1: computed opacity 160ms and transform 380ms with cubic-bezier(.34,1.56,.64,1). Chevron reverses over 260ms. The small create plus has a 20px bordered square, fixed after the first comparison. Public-rendered path geometry is the icon provenance.
- **Light.** No moving light or glow. White field and popover use thin neutral shadow borders; keyboard/input focus adds a soft blue ring. Shared gray active-row fill moves over 90ms and fades out over 140ms. Reference and replica include focus, mouse hover and pointer departure.
- **Text.** Inter, main 13px/20px; hint and chips 12px/16px; uppercase groups 10px/16px with .5px spacing. Search uses a pale-blue match mark. Selection count and overflow count roll, while chip names stay on one line. Reference chip body measured 340ms pop through scale .6 → 1.05 → 1; replica uses an independent width/opacity/scale Motion fit. The public docs describe a removal flash, but the separate rendered removal samples did not establish its exact phase; it is not claimed matched.
- **Layout.** Field 420×32px plus a 16px label and 6px gap. Popover follows 6px below; radius 10px, 4px list padding, 32px rows, 300px maximum scroll area, 32px footer. Open animation measured 240ms from y=-4/scale=.98. Filtered height moves over 300ms, cubic-bezier(.22,1,.36,1). Live source keeps chips on one line and folds excess into +N, despite an older responsive paragraph saying chips wrap. Replica measures chip widths rather than assuming a fixed count.

## Observed and exercised chain

Reset → open/focus → select Maya → select Jonas → search sara → keyboard pick → clear search → Backspace arm/removal → unmatched query → restore list → ArrowDown/Enter → Escape → arrow reopen → outside dismissal → reopen → reset → pick again. Full videos contain the same sequence. Stable filtered images separately fix pointer position on Sara for comparable highlighting. Source Invite creation is present only in the source-demo Study; reusable default is single/noncreatable. The single-choice behavior, native disabled and empty-options branches are browser tested locally. Source single-choice example is Pro-gated; loading is absent from the public API.

## Comparison and verification

`reference/preview.png` and `replica/preview.png` show the same two selected reviewers and open list. `stable-selected.png`, `stable-filtered.png`, `stable-empty.png`, `stable-dismissed.png` retain the settled states. `select-maya-frames.png`, `search-sara-frames.png` and `open-focus-frames.png` contain actual video frames; `render-trajectory.json` supplements short animations. Review corrected the active highlight's 4px list inset, the create-row square glyph, and the empty/create typography (source empty height 42px, 13px/20px). Keyboard-origin highlight now stays active while typing; pointer-origin highlight fades on leave. `verification.json` records actual browser checks and errors. Strict TypeScript was run only over the four owned TSX entry points. No whole-project build or registry install was claimed.

## Limitations

Native screencast is 25fps (40ms), with repeated frames and occasional capture stalls in the original; it cannot establish exact phase peaks. Video timings mark completed actions, not exact animation starts. Computed animation timings constrain the fit, and separate trajectories show real rendering, but chip pop/fold and count roll are not claimed identical. The source demo's first automated opening is interrupted by manual interaction and the user-driven reset chain is reproduced; its unattended marketing autoplay is not implemented. Dark/Classic skins, gated variant visuals and physical touch are unverified. Disabled is an explicit local extension; no source loading animation was invented.


Review note (2026-10-29): the saved stable-selected comparison was observed with unequal list scroll positions (reference DESIGN heading scrolled out, replica visible). That screenshot is not phase-aligned evidence of row padding or selected-row geometry. Treat its vertical offset as a scroll-state mismatch; no 1:1 claim follows from it.
