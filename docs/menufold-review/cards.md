# ExpandableCards + BentoGrid motion review — 2026-10-30

Source frozen. Changes are ready for parent integration. Isolated preview: http://127.0.0.1:4213/study/expandable-cards and /study/bento-grid (HMR disabled). Root 4187 responded HTTP 200; all final recordings used 4213.

## Concrete fixes

- `src/components/expandable-cards.tsx` / `.css`: removed nonuniform scaling of the entire detail surface. The shell now animates real bounds, and the icon, title, description, detail body and close control have independent geometry/opacity tracks. Body content keeps its final width while the shell clips it, so text and fields no longer squash into a ribbon during exit. SVG glyphs keep equal width and height. Retained content, native modal dialog, caller-controlled selectedId, delayed close, focus restoration and scroll lock remain intact. Reversals snapshot displayed geometry before cancellation. The scrim now fades both ways, without the previous immediate blur/dim jump.
- `src/components/bento-grid.css`: restored the source's two hover shadow layers (`0 20px 25px -5px black/10%`, `0 8px 10px -6px black/10%`) and its resting edge layer; removed the extra unselected background/border recolor. Existing 8px/200ms child translation and fixed card width were correct and retained. Bento TSX and both Study fixtures were not edited.

## Evidence and affected verification

Both full existing source clips were reused, decoded across their complete duration at their encoded 25fps cadence, and inspected via actual video contact sheets; source clips were not re-downloaded. Source Standard expansion 16.440s, Bento 13.520s. Final normal-speed canonical replica recordings are 10.720s and 8.200s, recorded sequentially with no dense DOM sampling or HMR during capture.

Per component: `evidence/batch/<slug>/motion-review/before/` preserves original source, Study, analysis and replica footage. `motion-review/source-freeze/` contains the final source and Study copies. `motion-review/reference-decoded/` and `replica-decoded/` contain full-timeline real-frame sheets and PTS JSON. `motion-review/pair-*.png` plus `phase-pairs.json` provide explicit source/corrected phase pairs. Canonical `replica/lifecycle.webm`, actions, overview and transition sheets are refreshed. Before footage remains available separately.

Expandable: 12 browser checks passed plus a separate controlled close-to-open reversal. Actual RAF opening samples show `transform: none` on the panel and title throughout; icon bounds change independently and body opacity interpolates. Early Escape at 35/80/160ms, native modality until exit completion, focus trapping/return, caller rejection, 390px panel containment and reduced motion passed. Controlled close-to-open reversal preserved panel/title/glyph coordinates across the interruption and restored focus after final close. Bento: 6 browser checks passed covering 8px movement with unchanged card width, rapid reverse, keyboard hover equivalence, caller selection, disabled action and reduced motion. No page errors. Targeted strict TypeScript for the two components and Studies passed. These are separate from visual evidence, not a claim of visual equivalence from typechecking.

## Remaining differences

Expandable still uses MenuFold's small original SVG and form content instead of the Standard example's expanding album-art header, artist/action arrangement and long prose; panel sizes, title sizes and travel distances therefore differ. The corrected easing is a bounded fit, not a measured-identical source spring: the local mid-phase reaches more of its final height sooner (source 13.960s versus local 1.840s pair). No reliable separate overshoot peak was resolved in the saved source sequence; no additional bounce was invented. Local close control remains present on desktop. Bento retains five modules, custom illustrations/content, 16px corners and different row heights versus the seven-module source. These differences remain explicit; neither component is labelled 1:1.

## Specific lessons for the parent skill

1. Check mid-transition glyph aspect ratio and field/text shapes independently of shell bounds. A correct endpoint can hide whole-panel scale distortion.
2. Read rendered geometry before cancelling an interrupted animation. Test open-to-close and caller-driven close-to-open separately, keeping modality until exit completes.
3. Compare every shadow layer and whether hover changes background/border. Preserve a correct child translation; do not invent a pop/overshoot absent from the observed source. Use actual video PTS because Playwright action clocks and the first encoded frame differ.

No skill, registry, shared player, dependencies, build outputs or public files were edited. Parent owns bundle/registry refresh. No further component edits are planned for this review.
