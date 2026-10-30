# DetailAccordion — colors synchronized; source frozen

Source: [public rendered reference](https://animate-ui.com/docs/primitives/base-ui/accordion). Final color correction: 2026-10-30. The prior analysis and complete old media are preserved under [color-review/before](color-review/before/). No source/bundles or gated reference content were read.

## Applied colors and preserved behavior

Source white surface, #0a0a0a ink, #e5e5e5 separators and #737373 chevron. Local permission notices use #525252 on #f5f5f5; errors and invalid input borders/text use #b91c1c. Alerts stay outside the collapsing region. The prior 350ms opacity/blur/chevron timing, height spring and 16px reveal mask are unchanged.

Source values come from actual reference images and public rendered computed styles: [reference colors](color-review/reference-colors.json), [initial image](color-review/reference-initial.png), [hover image](color-review/reference-hover.png). All local Study stages are neutral white. Full role mapping and deliberate semantic additions are in [nav color handoff](../../../notes/menufold-color/nav.md).

## Current evidence

- [10/10 targeted color/state checks](color-review/verification.json) passed, including standalone component ink after removing Study styles, keyboard/state behavior and runtime errors. Minimum settled text contrast in the captured states: **4.74:1**.
- [Before screenshots and source](color-review/before/) were saved before editing. [Final state screenshots](color-review/after/) include normal, hover/focus and the relevant disabled/error/tooltip states.
- [Canonical lifecycle](replica/lifecycle.webm): **8.40s**, 1024×1100, recorded once with the existing action chain on isolated Chrome/4214, publicDir:false, hmr:false. [Action scheduling offsets](replica/actions.json) are not measured animation onsets.
- [Final actual frame sheet](color-review/final-frames.png) and [eight decoded media timestamps](color-review/final-frames.json) were visually inspected. No interpolation, new dense motion sampling, or repeated recording. Canonical posters/keyframes now match the current source.
- All component TSX behavior code is unchanged; the only Study TSX edit across the four components changes two Accordion SVG fill colors. The eight owned CSS files retain their non-paint declaration sequence: [geometry/timing preservation](../auto-height/color-review/source-preservation.json).

## Prior motion evidence retained

The [previous motion checks](motion-review/verification.json), [phase anchors](motion-review/phase-anchors.png) and [motion traces](motion-review/motion-traces.svg) remain historical evidence for the unchanged motion implementation. Their screenshots predate this color pass and should not be used as current palette evidence. No new motion-audit claim is made.

## Remaining differences / integration

Typography, geometry, local content/icons and the accepted MenuFold behavior adaptations still differ from the reference. Stronger neutral focus/disabled text and local selected/hover/notice/tooltip colors are explicit semantic additions in nav.md. This is not a 1:1 fidelity claim.

Source is frozen and ready for parent build/real installation. Shared gallery, registry, package/deps, public and dist remain parent-owned. Parent should refresh copied public evidence and generated bundles from this source. Obsolete canonical screenshots were removed after their complete old versions were preserved in color-review/before/replica.
