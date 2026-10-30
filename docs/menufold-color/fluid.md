# Fluid Notch color review

Source frozen: **2026-10-30T12:17:14.820857+08:00**. Component and Study sources are ready for parent integration. Only Fluid Notch was edited. Shared gallery, registry, dependency files, public assets and whole-root builds remain parent-owned.

## Result and evidence

The default Study now opens the existing source reference example. The MenuFold stash remains in the same selector, with files/music/status behavior intact. `theme` still defaults to `light` for consumers, preserving the component API.

Before edits, copied both component files, both Study files, canonical replica media and analysis into `evidence/batch/fluid-notch/color-review/before/`; also captured 12 fresh before-state screenshots and computed colors. Actual original images inspected: reference compact, question 2 and completion, plus a fresh rendered first question.

Source: https://ui.aceternity.com/interactions/fluid-notch. `color-review/reference-colors.json` contains public rendered DOM/computed styles in compact, expanded, secondary hover, primary hover and keyboard-focus states, plus canvas conversion to sRGB bytes. `reference-*.png` contains the real public screenshots. No source, bundles, gated code or React internals were read.

## Exact source mappings

| Role | Observed reference | Applied replica |
| --- | --- | --- |
| Card surface | `oklch(.145 0 0)` → `#0a0a0a` | `--fn-surface:#0a0a0a` in dark component CSS |
| Main text / progress icon | `#fff` | `--fn-ink:#fff`; expanded progress inherits white |
| Header / count badge text | white 70% | `--fn-secondary:rgb(255 255 255 / .7)` |
| Description / people context | white 50% | `--fn-muted:rgb(255 255 255 / .5)` |
| Question index | white 45% | `--fn-quiet:rgb(255 255 255 / .45)` |
| Card edge / count badge fill | white 10% | `--fn-line` and count fill white 10% |
| Secondary action | white 7% fill, white 80% text | Same alpha values |
| Secondary action hover | white 12% fill, white text | Same alpha values; removed brightness filter |
| Primary action | white fill, `#0a0a0a` text | Same values |
| Primary action hover | neutral-200 → `#e5e5e5` | `#e5e5e5`, `#0a0a0a` text |
| Focus | white 50% trigger, 40% secondary, 60% primary | Corresponding outline colors, existing geometry retained |
| Avatar fallback base | neutral-800 → `#262626` | Neutral initial placeholders; photographs remain unimplemented |
| Shadow | Previous rendered falloff calibration | Dark 24/48 -16 black .45 + 6/16 -4 black .15 retained |

Source geometry, grain opacity, dust, spring 260/25.6/1, all content delays, icon completion tracks, focus ownership and keyboard contracts were preserved. The only component TSX change is light shadow RGB channels, now black rather than blue-gray.

## Semantic additions, not source measurements

The source has no light files/music/status UI. That existing adaptation now uses white surface, `#171717` main text, `#525252` secondary, `#686868` muted, `#737373` quiet/disabled, `#e5e5e5` border/selected fill, `#f0f0f0` hover. Light shadows use neutral black with the previous offsets/blur/opacity. The wrapper uses `#fafafa`/white and neutral paper, lines, dots and borders. No olive/yellow tint remains in those roles.

Disabled controls no longer fade their entire subtree to .38; disabled title and metadata use `#737373` with opacity 1. Disabled file icon plates use the existing hover surface. Interactivity is still disabled. Native range controls use the component foreground as their accent rather than a faded blue.

Success is explicitly semantic green `#166534` on `#f0fdf4`; error is red `#b91c1c` on `#fef2f2`. The existing dark adaptation receives green `#86efac` on `#052e16` and red `#fca5a5` on `#450a0a`. Active progress/equalizer stay neutral. Sample cover artwork remains colored: indigo and sky blue replace the invented yellow/olive covers. Avatar initials remain neutral placeholders; these choices are not claimed to match reference photos.

## Targeted validation

- `color-review/validation.json`: **31 property/contrast checks passed**, including default source selection, exact source roles, primary/secondary hover, keyboard focus and exported component colors after removing all Study CSS. No browser page errors.
- Flat-background sRGB contrasts: light secondary description **5.57:1**, disabled title/detail **4.74:1**, selected tab **14.23:1**, source description **5.37:1**, source primary **19.80:1**, source primary hover **15.72:1**, source secondary hover **14.74:1**, success icon **6.81:1**, error icon **5.91:1**, standalone dark error **8.51:1**.
- Source question index is exactly white/45, **4.48:1** on the flat base. Retained for source fidelity; this is not a universal 4.5:1 conformance claim. Grain can affect local pixel contrast.
- `replica/validation.json`: **11 existing lifecycle/behavior checks passed** in one recording: all questions → completion → reset/repeat; file callbacks/remove/disabled; music play/seek/next/pause; active/success/error; keyboard tabs/focus; Escape/outside/reversal. The same run separately checks 375px and reduced motion. No new motion audit or dense trajectory sampling.
- Canonical `replica/lifecycle.webm` (**26.12s**, native 25fps), raw video, action timeline, settled screenshots, narrow screenshots and keyframes now use frozen color sources. Native PTS for the 38 selected actual frames is saved in `color-review/recorded-frames.json`; dispatch-relative opening/closing frame labels are not new phase-alignment measurements.
- Final actual screenshots and recorded lifecycle frames inspected for source cards, selected/hover/focus, disabled file rows, music, success/error and narrow adaptation. Earlier `motion-review/` results describe the historical motion pass; its timing anchors must not be applied to the new video.

## Changed files and replay

Product sources:
- `src/components/fluid-notch.tsx`
- `src/components/fluid-notch.css`
- `src/batch/fluid-notch/Study.tsx`
- `src/batch/fluid-notch/study.css`

Review scripts: `scripts/menufold-color/fluid-{preview,measure,verify,record,export}.mjs`. Evidence: `evidence/batch/fluid-notch/color-review/`, updated canonical `replica/` media and `analysis.md`. This handoff: `notes/menufold-color/fluid.md`.

Use `node scripts/menufold-color/fluid-preview.mjs` (4211, publicDir false, HMR false), then `fluid-verify.mjs` for focused checks. `fluid-record.mjs` and `fluid-export.mjs` replay/export the existing lifecycle. Browser sessions and the preview server are closed at handoff. Parent handles registry/install/build/integration and has separately corrected gallery-level color leakage.

## Remaining differences

Reference portraits are still initial placeholders. The existing extra close affordance, font metrics/weights, grain tiling, particle paths, MenuFold fixed top anchor and business adaptation remain previous known differences. Source edge is an external ring while the reconstruction preserves its existing one-pixel border geometry. Exact focus drawing geometry is retained from the component, with measured reference colors. No blanket 1:1 claim. Gallery integration after the parent fix and registry consumer installation were not performed in this scope.
