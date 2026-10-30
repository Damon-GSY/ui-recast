# Cards color correction — 2026-10-30

**Source frozen.** Assigned scope: `expandable-cards` and `bento-grid`. The earlier warm gray/olive palette was agent-invented and was not user-approved. This pass replaces it using each actual public reference. Shared gallery changes, source distribution and integration remain parent-owned.

## Source evidence and exact mappings

Viewed the saved reference PNGs, then measured the public rendered DOM and computed styles in the Standard Expandable Card and default Bento preview. No gated source, bundle inspection or React internals were used. Current color captures, including source button hover and expanded state, are in each component's `color-review/reference/`. Exact values are retained as OKLCH in the component CSS; hex values below are approximate sRGB labels.

| Role | Public source value | Local mapping |
| --- | --- | --- |
| Bento wrapper | `oklch(0.97 0 0)` ≈ #f5f5f5 | Study wrapper |
| Bento card | `rgb(255,255,255)` | `.mf-bento__item` white |
| Bento border | `oklch(0.922 0 0)` ≈ #e5e5e5 | `--mf-bento-border` |
| Bento title and body | `oklch(0.439 0 0)` ≈ #525252, both roles in source | `--mf-bento-text`; weight preserves title hierarchy |
| Bento icons | `oklch(0.556 0 0)` ≈ #737373 | `--mf-bento-icon` |
| Bento skeleton | `to right bottom`, neutral .922 → .97 | Component header gradient; original fixture illustrations use neutral strokes, fills, edges and shadows |
| Bento resting shadow | black/10% `0 2px 3px -1px`; rgb(25,28,33)/2% `0 1px`; rgb(25,28,33)/8% `0 0 0 1px` | Already matched in motion review; retained |
| Bento hover shadow | black/10% `0 20px 25px -5px` + `0 8px 10px -6px` | Retained exactly; no unselected surface recolor |
| Expandable wrapper / detail | neutral .97 / white | Study wrapper / component detail panel |
| Expandable list title | `oklch(0.269 0 0)` ≈ #262626 | `--mf-expandable-title` |
| Expandable detail title | `oklch(0.371 0 0)` ≈ #404040 | Detail heading |
| Expandable secondary/body | `oklch(0.439 0 0)` ≈ #525252 | `--mf-expandable-text`, description, metadata, detail body |
| Expandable row hover | `oklch(0.985 0 0)` ≈ #fafafa | Trigger hover |
| Expandable resting action | `oklch(0.967 0.003 264.542)` / black | Local arrow surface / glyph |
| Expandable action hover and detail action | `oklch(0.723 0.219 149.579)` ≈ #00c951 / white | `--mf-expandable-accent`; trigger hover arrow and fixture primary action. Source detail action has the same color on hover, retained locally |
| Expandable scrim | black/20% | Existing scrim preserved |

Public sources: [Bento default](https://ui.aceternity.com/live-preview/bento-grid-demo), [Expandable Standard](https://ui.aceternity.com/live-preview/expandable-card-demo-standard).

## Local semantic additions

These states do not exist in the corresponding source demo and are deliberately distinguished from measured source values:

- Bento selected surface: neutral .97, neutral .556 border; selected hover: neutral .922. Action buttons: white / neutral .439 text, #d4d4d4 edge, neutral .97 hover. Focus uses neutral .439 at the existing 3px width and offset.
- Expandable selected row: neutral .97 / #d4d4d4 border. Its hover arrow receives the source action accent because the entire local row is one control. Source's separate Play button geometry is not introduced. Close focus and field focus use neutral .439; original focus dimensions remain.
- Both disabled controls retain native disabled semantics; opacity changes from .4/.42 to .65 to improve legibility without adding an action. Neutral custom icon fills replace olive fills in both Study TSX files.
- Study labels use #666, fields have an explicit neutral foreground and #737373 placeholder, custom illustration shadows use black. Expandable's existing panel/icon shadow sizes and timing are retained, with their green RGB channels replaced by black. Transparent animation endpoints likewise become transparent black.
- No error or success visual states exist in these component APIs. The fixture status output is ordinary neutral text; no new business state was invented.

## Targeted verification and media

`cards-verify.mjs`: 12/12 checks for each component, zero browser errors. Checks cover exact source colors, component colors with Study CSS disabled, unchanged resting bounds, unchanged TSX behavior apart from color literals, keyboard focus, caller selection, native disabled behavior and Expandable Escape/focus return. Bento's existing 8px child translation remains. The prior motion review remains the motion evidence; this pass did not repeat its dense sampling or a whole-root build.

Contrast measured from rendered colors in sRGB: Bento normal body 7.81:1, selected-hover body 6.20:1, selected border 3.76:1, disabled action 3.25:1. Expandable list title 15.13:1, detail title 10.37:1, description/body 7.81:1, disabled description 3.25:1. Native focus rings and enabled text were inspected in desktop and 390px screenshots.

Recorded the unchanged existing lifecycle once per changed component, sequentially in isolated Chrome on port 4213 with `publicDir:false` and HMR disabled. Bento **8.24s**, Expandable **10.76s**, both 1100×1000; zero recording page errors. Canonical `replica/lifecycle.webm`, action logs, raw media, desktop/narrow/selected/detail stills and overview/transition/detail sheets are synchronized. Sparse real decoded frames were inspected (12 overview frames and 6/8 state frames), not a new motion audit. Frame metadata separates requested action-guided times from actual video PTS. Bento's narrow still was retaken after settling to avoid saving the clearing transition as the default state.

Each `color-review/before/` preserves source/CSS/Study, analysis, all previous replica media and fresh before-edit screenshots/computed values. `color-review/source-freeze/` contains the final component and Study copies. `color-review/after/`, `validation.json`, `frames/color-states.png` and `reference/rendered-colors.json` are the current evidence. Historical motion-review frame times refer to the previous replica archived under `color-review/before/replica/`, not the new video.

## Changed files

- `src/components/bento-grid.css`
- `src/components/expandable-cards.css`
- `src/components/expandable-cards.tsx` — two transparent shadow color literals only
- `src/batch/bento-grid/Study.tsx` — SVG fill literals only
- `src/batch/bento-grid/study.css`
- `src/batch/expandable-cards/Study.tsx` — SVG fill literals only
- `src/batch/expandable-cards/study.css`
- `scripts/menufold-color/cards-preview.mjs`, `cards-measure.mjs`, `cards-verify.mjs`, `cards-record.mjs`, `cards-frames.mjs`
- This note; both components' scoped `color-review/`, canonical `replica/` media and `analysis.md`.

`src/components/bento-grid.tsx` is unchanged. No shared gallery, skill, registry, dependency, public or dist changes were made by this worker. No new dependencies or hashes were added. Browser sessions and owned preview server are closed after delivery checks. Parent owns actual registry installs/build/integration.

## Remaining differences

- Source green with white action text measures **2.22:1**, below 4.5:1 for small text. It is preserved to match the explicitly requested actual source accent; this is not an accessibility-conformance claim.
- Existing MenuFold content, original SVG illustrations, module counts, sizes, radii, form fields and action geometry remain. Expandable's original panel shadow/border still differs from the source's shadow-free, border-free detail panel; its color is now neutral. Removing those layers would change the previously reviewed light/geometry track, so this color pass retained their shape and timing.
- Original fitted motion differences documented in the prior motion review remain. Neither component is claimed to be pixel-identical or newly installed through the registry by this worker.
