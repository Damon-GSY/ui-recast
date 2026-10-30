# MenuFold color correction — lists

Source frozen **2026-10-30 12:18:50 +08:00**. Assigned items: `number-ticker`, `event-list`, `partition-list`, `selectable-cards`. This is a color correction against each public rendered reference. The previous warm gray/olive palette was agent-invented, not a user preference.

## Reference evidence and implemented values

Each `evidence/batch/<slug>/color-review/reference-colors.json` contains a fresh preview-only computed-style measurement; `reference-default.png` and, where applicable, `reference-hover.png` show the actual source. Existing reference stills/movies were retained. Both existing and fresh images were inspected with `view_image`. No gated source, bundles or framework state were used.

| Component / source | Measured reference | Implemented mapping |
| --- | --- | --- |
| [NumberTicker](https://magicui.design/docs/components/number-ticker) | Number `rgb(0,0,0)`, transparent on white; no shadow | Main Study number `#000`; Study `#fff`, borders `#e5e5e5`, secondary labels `#737373`. Component TSX/CSS unchanged: the primitive still inherits caller color. |
| [EventList](https://magicui.design/docs/components/animated-list) | Card `#fff`; title and description `oklch(.269 0 none)`; time `oklch(.551 .027 264.364)`; icon surfaces `#1e86ff`, `#00c9a7`, `#ffb800`, `#ff3d71` | Card `#fff`; title/description `#262626`, time `#6b7280`; exact four source icon surface values restored. Source shadow copied as black .03 ring plus .05 2px/4px and .05 12px/24px layers. Existing 1px layout border made transparent. |
| [PartitionList](https://animate-ui.com/docs/primitives/animate-ui/pinned-list) | Text `lab(2.75381 0 0)`, muted `lab(48.496 0 0)`, row `lab(96.52 0 0)`, button `lab(100 0 0)`; no shadow | sRGB neutral equivalents `#0a0a0a`, `#737373`, `#f5f5f5`, `#fff`. Row border transparent; static icon `#525252` on white. |
| [SelectableCards](https://ui.aceternity.com/components/card-hover-effect) | Black cards; title `oklch(.967 .001 286.375)`, description `oklch(.705 .015 286.067)`; default border transparent; hover border `oklch(.372 .044 257.287)`; no shadow | Card `#000`, title `#f4f4f5`, description `#a1a1aa`; same exact hover-border OKLCH value, transparent resting border and no resting shadow. Study white with neutral labels/decorations. |

Hex conversions of source text colors are 8-bit sRGB equivalents; the raw CSS color-space values remain in the evidence. Source accents are retained in EventList; SelectableCards' black is restored rather than converted to a pale neutral card.

## Explicit local semantic additions

These states/content are MenuFold adaptations, not colors claimed to be measured from nonexistent source states:

- **EventList:** existing status `tone` is now exposed on the icon via `data-tone`. Neutral→source blue, success→source teal, pending→source yellow, error→source pink. Dark icon strokes `#102a43 / #003d33 / #5c3d00 / #600023` keep the existing outline artwork visible. Status text remains meaningful: neutral `#4b5563`, success `#047857`, pending `#92400e`, error `#be123c`. Selected row `#eff6ff` with source-blue border; selected time deepens to `#4b5563`. Hover is a neutral action-button surface. Focus `#2563eb`; disabled action retains a readable gray glyph on `#f3f4f6`.
- **PartitionList:** extra descriptions `#6b6b6b`, count text `#525252`. Selected destination `#e5e5e5 / #0a0a0a` with an inset `#737373` edge, versus hover `#f5f5f5`; disabled selected remains recognizable at `#d4d4d4 / #525252`. Pending `#92400e`, error `#b91c1c`. Success is the accepted location update, without a fabricated success decoration. Focus `#525252`. A first black/white selected candidate was discarded after actual transition contrast fell below 4.5; the final gray selection preserves text contrast and the existing 140ms transition.
- **SelectableCards:** selected cards stay black, with a pale border/check and gray outer edge. Check uses `#f4f4f5` fill and black stroke; focus ring `#71717a`. Disabled cards use explicit `#27272a` fill and readable `#a1a1aa` text, instead of fading the entire card. The already-reviewed moving hover layer remains `#e4e4e7`; the public source still did not expose a comparable moving background element. The local background/shape SVG thumbnails are neutral grays, with geometry and opacity unchanged. “A warm, opaque surface” becomes “A solid, opaque surface” to match the corrected artwork.
- **Study shells:** white panels, neutral labels, gray borders and untinted black shadows. Local checkbox accents are neutral. The isolated preview body is `#f5f5f5`. Event Study focus selectors now exclude the component action, so its own focus color is not overwritten.

## Changed source files

- `src/components/event-list.tsx` — only the icon `data-tone` attribute.
- `src/components/event-list.css`
- `src/components/partition-list.css`
- `src/components/selectable-cards.css`
- `src/batch/number-ticker/study.css`
- `src/batch/event-list/study.css`
- `src/batch/partition-list/study.css`
- `src/batch/selectable-cards/study.css`
- `src/batch/selectable-cards/Study.tsx` — thumbnail color values and the one color-description phrase.

NumberTicker component files, PartitionList TSX, SelectableCards TSX, and all motion/geometry/business/keyboard logic are unchanged. No shared gallery, skill, registry, package/dependency, public or dist files were edited by this group. The parent owns integration and actual registry installation/builds.

## Verification and media

Before editing, every component's TSX/CSS, Study files, analysis and full replica directory were copied to `color-review/before/`. Actual before-state screenshots and rendered styles were also saved there. Source freeze records contain paths, sizes and modification times only.

- `lists-snapshot.mjs`: actual initial, hover, focus/selected, disabled, pending/error/success and empty screenshots where applicable. Colors are in standalone CSS, not gallery overrides.
- `lists-contrast.mjs`: sampled small-text minimum ratios **4.74** (Ticker), **4.83** (Events), **4.54** (Partitions), **5.81** (Cards). Event icon minimum **4.05**. The affected Partition selected-to-disabled transition was sampled separately and stayed above 4.5 after correction. These are scoped checks, not a complete accessibility audit.
- `lists-verify.mjs`: initial/immediate counts, status tone/text/order, keyboard selection/focus, disabled actions, partition request/failure/acceptance, selected-vs-hover, radio arrow navigation/disabled skip/form value. Removing Study styles leaves the three standalone components' surface/ink/border/shadow unchanged. No runtime page errors.
- Before/after initial DOM rectangles match for all four (`geometry-preserved.json`). No new dense motion sampling or new full motion audit.
- `lists-record.mjs`: **one** existing lifecycle recording per item after the final source freeze. Canonical `replica/full.webm`, `lifecycle.webm`, `actions.json`, `crop.json` updated. NumberTicker is included because its Study colors changed.
- `lists-frames.mjs`: native decoded color-state frames and canonical contact sheets updated and inspected with `view_image`; action clocks are approximate navigation anchors, not timing/fidelity conclusions.
- `lists-stills.mjs`: canonical desktop/narrow/special-state stills refreshed. Fresh 390px layouts fit. No whole-root build, dependency changes or registry generation performed.

Scripts live in `scripts/menufold-color/lists-*.mjs`; preview uses port 4216, `publicDir:false`, `hmr:false`. All browser runs close their own sessions. The preview server is stopped at handoff.

## Remaining differences

Existing geometry/content adaptations remain: compact EventList outline artwork instead of source emoji, three PartitionList groups and destination controls instead of two pin groups, and compact radio cards/thumbnails/checks instead of external-link cards. Ticker still uses the approved immediate-initial/.65s-update behavior. Source spring equivalence and SelectableCards moving-background equivalence remain unestablished; earlier motion findings are retained in the analyses as historical evidence.

Parent integration follow-up: the observed invisible hover box after desktop hover → leave → resize to 390px has been fixed in `src/components/selectable-cards.tsx`. The last hovered slot remains observed while the layer fades, so resize updates its bounds. The regression now reports viewport/document width 390px and both groups without overflow; rapid hover reversal remains visible. Evidence: `evidence/menufold-color/cards-resize.json`. Earlier media-sync output records the pre-fix finding. This bounded correction does not change the color or motion parameters, and the desktop lifecycle remains applicable.
