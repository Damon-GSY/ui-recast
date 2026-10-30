# Stacked Empty State color correction

2026-10-30. Scope: `stacked-empty-state` only. The prior warm gray/olive palette was agent-invented, not user-approved. Keep the requested original SVG artwork, compact three-card structure, center-first motion, and single caller-owned action.

Source: [public Aceternity preview](https://ui.aceternity.com/live-preview/empty-state-with-stacked-cards). Viewed existing `reference/settled.png` and `reference/hover-1.png`, then measured public rendered computed styles in Chrome. No gated source, bundles, or framework internals inspected. `color-review/reference-colors.json` records the exact CSS and canvas-converted sRGB. The new live color screenshots show text/button states; the already captured complete reference screenshots provide card appearance evidence.

| Role | Reference evidence | Applied |
| --- | --- | --- |
| Page | `oklch(.97 0 0)` ≈ `#f5f5f5` | Neutral study page `#f5f5f5` |
| Panel | `oklch(.967 .003 264.542)` ≈ `#f3f4f6` | Exact OKLCH in standalone CSS |
| Cards | `rgb(255,255,255)`, no gradient | White paper, no olive gradient |
| Main/secondary text | Emphasis `#000`; title/body `oklch(.439 0 0)` ≈ `#525252` | Single compact title uses black emphasis; description uses exact secondary |
| Primary/focus | `oklch(.623 .214 259.815)` ≈ `#2b7fff`, white text | Exact blue, white icon/text; existing focus geometry retained |
| Primary hover | Same blue; inset `rgba(30,64,175,.4)` 20px; white ring .4 | Same color and inner-shadow strengths; existing button geometry/timing retained |
| Card shadows | Black at .1, two layers | Black at .1; compact component's existing offsets/blur retained |

Semantic additions, not source measurements: neutral `#525252` native SVG; `#e5e5e5` compact-card borders/dividers; `#d4d4d4` decorative dots/lines; static white highlight. Ambient glow removed because the source does not have one. No per-kind olive/blue-gray/tan tint. Disabled action uses `#525252` on `#e5e5e5`, `#d4d4d4` border and no shadow. Study selected controls use white/black with neutral border; muted copy `#737373`; checkbox/focus use reference blue. The component has no selected/error/success states; fixture callback output remains ordinary neutral text.

Before source, Study, analysis, screenshots and full old replica media are preserved under `evidence/batch/stacked-empty-state/color-review/before/` before editing. Only component CSS and scoped Study CSS change runtime appearance; no TSX, geometry, motion, callback or keyboard changes.

## Frozen delivery and targeted validation

Source frozen after the color correction. `stacked-check.mjs` passed: all three fixture colors, hover shadow/color, visible keyboard focus and Enter callback, disabled action, 390px no overflow, no page errors. Removing Study CSS leaves all standalone component role colors unchanged. Both TSX files are byte-for-byte identical to the saved baseline, preserving SVG markup, center-first spring/stagger, hover/reverse, persistent card identity, callbacks and keyboard contracts.

Viewed final Rules, Stash, focus and disabled screenshots, plus actual decoded final transition and overview frames. Cards are white, lines and static highlights remain visible, and no olive/tan ambient or shadow remains. Re-recorded the existing lifecycle exactly once (13.56s at 1100×1000), covering entrance, all card hover/leave states, rapid reversal, keyboard action, three kinds and replays. Updated canonical `replica/lifecycle.webm`, `actions.json`, desktop/hover/narrow screenshots, all three keyframe PNG/JSON pairs; old media remains under `color-review/before/replica`. No new motion extraction or audit was performed; final frame sheets only synchronize existing evidence with current colors.

Computed flat-color contrast: heading/panel 19.08:1, description/panel 7.10:1, native icon/white 7.81:1 before the light overlay, disabled 6.20:1. Source white-on-blue is 3.76:1; preserve the observed reference color rather than inventing another blue. Study muted captions are 4.35:1. These figures describe role colors, not antialiased pixel contrast.

## Changed files

- `src/components/stacked-empty-state.css`
- `src/batch/stacked-empty-state/study.css`
- `scripts/menufold-color/stacked-preview.mjs`, `stacked-observe.mjs`, `stacked-check.mjs`, `stacked-record.mjs`, `stacked-frames.mjs`
- This note; `evidence/batch/stacked-empty-state/analysis.md`
- `evidence/batch/stacked-empty-state/color-review/` (before, observed colors, state screenshots, validation)
- Canonical `evidence/batch/stacked-empty-state/replica/` media and frame metadata.

No shared gallery, skill, registry, public, dependencies or dist changes. No root build or registry install; parent owns integration. Preview port 4212 and isolated browsers are closed at delivery.

## Remaining differences

Original native SVG/compact rectangular cards and one-action layout are requested adaptations, not source thumbnails. Neutral decorative borders/lines, the static white highlight, disabled colors and study controls are semantic additions. Card shadow geometry stays compact rather than taking the full-size source's 20px/25px and 8px/10px offsets. Main compact title maps to source black emphasis rather than reproducing a mixed-color sentence. The already documented center overshoot/timing and mobile/reference gaps remain; this color pass did not re-audit them. Prior review's claim that warm paper was an approved tradeoff is superseded.
