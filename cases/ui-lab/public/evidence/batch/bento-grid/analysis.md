# BentoGrid — color correction, 2026-10-30

**Source frozen for parent integration.** [Public rendered reference](https://ui.aceternity.com/live-preview/bento-grid-demo). This supersedes the current-palette claims in the earlier motion report; the original report and replica media are preserved in [color-review/before](color-review/before/).

White cards; exact rendered neutral-600 title/body, neutral-500 icons, neutral-200 edges and neutral-200 → neutral-100 diagonal headers. Source resting/hover shadows remain. Selected, focus and disabled states use documented neutral local additions. The previous warm gray/olive palette was agent-invented, not user-approved. All reusable colors are in the standalone component CSS; Study decorations and inline SVG fills were corrected too.

See [complete color mappings, semantic additions, changed files and limitations](../../../notes/menufold-color/cards.md). [Measured reference colors](color-review/reference/rendered-colors.json), [before screenshots](color-review/before/desktop.png), [final desktop](replica/desktop.png), [final state frames](color-review/frames/color-states.png), [frozen source](color-review/source-freeze/) and [targeted validation](color-review/validation.json) are retained.

12/12 focused checks passed, zero browser errors. Component colors survive removal of Study CSS, resting geometry is unchanged, and TSX behavior is unchanged apart from color literals. Existing keyboard/controlled/disabled behavior was exercised on the affected path. No full new motion audit, root build or registry install was performed.

The unchanged lifecycle was re-recorded once at 1100×1000, 8.24s, with isolated port 4213, no HMR and no parallel decoding. [Current lifecycle](replica/lifecycle.webm), [actions](replica/actions.json), canonical screenshots and sparse decoded keyframe sheets all use the new palette. Actual media PTS is stored in frame JSON; action offsets are not claimed as precise motion phase measurements. Final actual frames were visually inspected. The detailed prior motion comparisons in `motion-review/` refer to the older video now archived in `color-review/before/replica/`.

Remaining differences are consolidated in the linked color report: custom MenuFold content/geometry and prior fitted motion remain; source fidelity is not claimed as 1:1. Parent owns shared gallery, registry packaging and consumer integration. Owned browser sessions and preview server are closed after delivery.
