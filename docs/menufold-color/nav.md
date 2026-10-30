# MenuFold nav color correction — source frozen

Scope: **SettingsSidebar, InstantTabs, DetailAccordion, AutoHeight only**. ReadingTabs was excluded from preview and recording. No shared gallery, skill, registry, package/dependencies, public or dist files were edited. No root build or registry installation was run; parent owns integration.

## Source evidence and color mapping

All four existing `reference/initial.png` images were viewed. Public rendered previews were then measured in Chrome on 2026-10-30; no component source, bundles or gated content were read. Each component has `color-review/reference-colors.json`, `reference-initial.png`, and `reference-hover.png`. CSS Lab values were converted using a browser sRGB canvas, not estimated from compressed movies.

| Component / reference | Measured source roles | Applied mapping |
| --- | --- | --- |
| [Sidebar](https://animate-ui.com/examples/base-ui/sidebar) | Surface `lab(98.26 0 0)` → `#fafafa`; ink/icons `lab(2.75381 0 0)` → `#0a0a0a`; hover `lab(90.952 0 0)` → `#e5e5e5`; group label uses 70% ink; no shadow | Sidebar `#fafafa`, primary/icons `#0a0a0a`, moving hover `#e5e5e5`, group text `#525252`, separators `#e5e5e5`. Removed cream surfaces and blue selection. |
| [Tabs](https://animate-ui.com/examples/base-ui/tabs) | Rail `#f5f5f5`; selected white; active ink `#0a0a0a`; inactive ink `rgb(10 10 10 / .6)`; selected shadow black 10%, `0 1px 3px` + `0 1px 2px -1px`; transparent borders | These values live directly in `instant-tabs.css`. Study preview decorations use neutral grays; no blue highlight or olive desktop gradient remains. |
| [Accordion](https://animate-ui.com/docs/primitives/base-ui/accordion) | White page/panel; ink `#0a0a0a`; separators `#e5e5e5`; chevron `#737373`; no shadow | White component surface, source ink/dividers/chevron; neutral icon tiles. Permission and error notices are separated semantically as described below. |
| [Auto Height](https://animate-ui.com/docs/primitives/animate-ui/auto-height) | Transparent wrapper, white content card, ink `#0a0a0a`, border `#e5e5e5`, no card shadow; button hover `#f5f5f5` | Wrapper retains transparency and defines neutral default ink in its own CSS. Study card/paragraph/button match these roles; decorative surfaces and tooltip are neutral. |

All Study stages are white. Headers, muted labels, form fields, preview illustrations, borders, icon fills, shadows and checkbox accents were corrected within their owned Study files. Decorative status dots no longer imply an unrequested green success state.

## Deliberate semantic additions, not measured source states

- Sidebar's existing persistent selection must remain distinguishable from the moving hover: selection `#f5f5f5` plus inset `#d4d4d4`, hover source `#e5e5e5`. The inset does not change geometry.
- Tabs keep the existing independent hover distinction using `#e5e5e5`; the source only darkens inactive text on hover. This is distinct from the white selected indicator.
- Focus uses `#737373` instead of the source's lighter `#a3a3a3` ring. Disabled text uses full-opacity neutral ink (`#6b6b6b` on sidebar/tabs; `#737373` on white accordion/height surfaces) rather than fading already-muted text below readable contrast. Disabled semantics, hit behavior and keyboard rules are unchanged.
- Accordion summaries and settings/icon tiles are local adaptations. Neutral hover `#f5f5f5` is retained; summary text becomes `#525252` on hover. Permission notices use `#525252` on `#f5f5f5`; errors use `#b91c1c`, including invalid input text/border/focus. The source FAQ has no permission/error fixture; these are chosen semantic colors, not source measurements. There is no success state in these four components to recolor.
- AutoHeight's local tooltip uses white text on `#171717`; local form fields use neutral borders and ink. Its decorative mark and the Study result-row hover labels use `#525252` on light gray.

## Changed source files

- `src/components/settings-sidebar.css`
- `src/components/instant-tabs.css`
- `src/components/detail-accordion.css`
- `src/components/auto-height.css`
- `src/batch/settings-sidebar/study.css`
- `src/batch/instant-tabs/study.css`
- `src/batch/detail-accordion/study.css`
- `src/batch/auto-height/study.css`
- `src/batch/detail-accordion/Study.tsx` — only the two SVG knob fills, warm gray → neutral `#f5f5f5`.

All four component TSX files and other Study TSX files are byte-for-byte unchanged from the saved baseline. No new shared CSS dependency, theme framework, hashing or dependencies were introduced.

Supporting changes: `scripts/menufold-color/nav-{preview,capture,reference,verify,record,media}.mjs`; each assigned component's `color-review/`, canonical `replica/` media and `analysis.md`; this note.

## Validation and delivery

- **37/37 targeted browser checks passed**: Sidebar 9, Tabs 10, Accordion 10, AutoHeight 8. Actual settled foreground/background contrast across captured states: minimum **4.54:1** for Sidebar, **4.74:1** for the other three. Normal, hover, selected, disabled, keyboard focus, permission, invalid-field and collapsed-error screenshots are retained. See each `color-review/verification.json` and `after/`.
- Initial checks caught disabled selected-sidebar text and hovered help text at 4.35:1; both were darkened, and related summary/result-row hover text was checked. The final run has no contrast or runtime failures.
- Removing Study styles in the browser still leaves all four standalone component roots with `#0a0a0a` ink. Sidebar and tabs source surfaces were checked explicitly; invalid border and text were checked against actual computed RGB values.
- Eight CSS files retain the same non-paint declaration sequence, including all sizes and transition parameters. Evidence: `evidence/batch/auto-height/color-review/source-preservation.json`. The prior motion and keyboard review remains authoritative; it was not repeated as a dense audit.
- Before editing, all component/Study source, previous full replica media and analysis were copied into each `color-review/before/`; fresh before screenshots are there too.
- Each changed component's existing lifecycle was re-recorded **once**, on isolated Chrome/4214, `publicDir:false`, `hmr:false`, one recorder at a time. Canonical durations: Sidebar **10.20s**, Tabs **9.16s**, Accordion **8.40s**, AutoHeight **10.20s**. Actions include the existing reverse/retarget and keyboard paths.
- Final movies were decoded at normal speed in Chrome. Eight actual frames per component were saved with `requestVideoFrameCallback` media times and visually inspected. `color-review/final-frames.{png,json}`, `replica/lifecycle.webm`, posters/contact sheets and keyframes all use the current colors. Obsolete canonical screenshots were removed after their full before copies were preserved. No new dense motion extraction.

## Remaining differences / integration

Typography, icons, local content, geometry and prior accepted behavior adaptations still differ from the references. Sidebar stays flat with persistent labels; Tabs activates immediately with stable preview size; Accordion keeps summaries and critical notices; AutoHeight keeps the local top anchor and detail-only fade. This is a color correction, not a new 1:1 claim. Semantic additions above intentionally differ from literal reference states.

Parent should refresh its public evidence and registry/bundle artifacts from these frozen sources. Parent's shared-gallery fixes were acknowledged and left untouched. Integration builds/install verification remain parent-owned.

Freeze handoff: 2026-10-30T12:26:12+08:00. Source is frozen; parent may begin builds/install immediately. All browsers launched by these scripts completed and closed. Owned preview PID 61842 was stopped; port 4214 has no listener. No source edits followed the passing checks or recording.
