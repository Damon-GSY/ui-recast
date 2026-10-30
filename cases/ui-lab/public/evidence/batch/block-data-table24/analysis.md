# Grouped transactions with hidden headings

Source: https://www.shadcnblocks.com/block/data-table24
Theme: Shadcn Default / light. Observation date: 2026-10-29.

## Provenance and access

The public Pro page and its official embedded preview were observed. Original full video was captured before implementation. Source TypeScript/TSX, JavaScript bundles, registry bodies and framework internals were not used as implementation inputs. The source gate is recorded in `source-gate.json` and `reference/public-page.png`. Direct preview navigation was rejected by the site's iframe-origin policy; `reference/direct-navigation-denied.*` preserves that result. The official parent-page iframe was accessible without bypass or purchase. No registry endpoint was probed.

Original browser viewport:1440×1400; embedded preview:1277×900. Replica viewport:1277×900. Video crop is1276×900 because the encoder requires even dimensions. Source and replica raw videos are retained as `full-lifecycle.webm`; `lifecycle.webm` is cropped and synchronized to a visual marker. Screenshots/computed-style measurements were taken separately from recording.

## Four visual tracks

**Icons.** No decorative icons in the source table. Reference identifiers are links. Accessible column headings remain visually hidden.

**Light and surface.** Muted date group backgrounds, white rows and subtle borders under the first two columns. Link hover underline and focus outline are visible; no shimmer or glow.

**Text.** 24/32 bold heading, 14/20 description/body; transaction identifier and amount emphasize hierarchy, tax is smaller and muted. All values are explicit demonstration fixtures. Actual rendered sans font is the system fallback; see shared evidence within this assignment at `../block-timeline1/reference/font-measurements.json`.

**Layout and transitions.** 960px content inside the same 1024px padded container; 128px top/bottom spacing. Three 41px group strips and eight 64px data rows; column proportions approximately 16.3/29/23.4/31.3 percent. Total rendered root height is 988px, matching the observed source. No entrance, row expansion, data loading or other dynamic transition was observed. The full video records initial render, link hover/focus, bottom/top scroll and reset. Recreated behavior is intentionally static apart from normal link states.

## Reusable interface

`groups: TransactionGroup[]` with stable group and transaction ids; transaction fields are reference, amount, currency, optional tax, client, description and optional href. Optional `onTransactionSelect`, `formatAmount`, title, description and className. An href works without a callback; a callback owns the selected record action.

Source: `src/components/block-data-table24.tsx` and adjacent CSS. Default-exported demo: `src/batch/block-data-table24/Study.tsx`. Component data is caller-owned; fixture mutations, selected-record panels and demonstration messages belong to Study. No real invitation, account or financial/backend integration is connected.

## Recorded and verified coverage

All three groups/eight records, first link hover, second link keyboard focus, last row hover, full scroll range and reset. Local checks also open/close the Study details dialog using the exact selected transaction.

The recorded action sequence and actual dispatch/completion times are in each side's `video-timeline.json`. `contact-sheet.png` includes baseline, meaningful states and post-reset tail. `transition-contact-sheet.png` and `micro-transition-contact-sheet.png` contain actual video frames at intermediate phases; individual PNGs are retained. Visual comparison uses rendered phases rather than assuming equal network reload latency.

4/4 original local functional checks passed with no page errors. Targeted TypeScript checking passed. Follow-up regression results, full video errors and final comparison findings are in `verification.json`. Local390px layout checks passed; equivalent narrow source behavior was not exhaustively observed. Parent owns registry packaging and independent consumer build; this worker did not run or modify them.

## Limits and remaining differences

- Source link destinations and any downstream detail pages were not opened; source detail interaction is not claimed.
- The Study detail dialog is an independently supplied callback example, not a reconstruction of an observed source modal.
- Minor text antialiasing and browser focus-outline differences remain.
- Native recordings are25fps (40ms per frame). A100ms transition spans only2–3 native frames, and some frames repeat. Computed CSS and still measurements supplement the video; no exact easing or pixel-identical claim is made.
- Source network hydration/reload may show temporary blank frames; final tail samples demonstrate the restored state. These source loading delays are evidence, not component motion reproduced locally.
- Avatar URLs in the member demos reference publicly rendered Shadcnblocks image assets and need network access. Components also accept caller-provided avatar URLs/initials.

## Dependencies

Existing React19 and CSS. The three interactive popover components use already-installed `motion/react`; the grouped table and static timeline do not. No package or lockfile change, install, purchase, commit or shared-file modification was made.

## Final comparison and freeze

Final source/replica lifecycle frame sheets were actually viewed; opening, change and closing microframes were also viewed for the interactive components. Material omissions found in review were corrected before the final replica recording. The final five recordings completed with no page errors and the same named action chains as their references. Source reload latency and individual frame dispatch differ.

- Matched measured group strips and 988px root height.

Final remaining differences: Minor glyph rasterization and link-focus outline differences. Source downstream details were not observed; Study detail dialog is demo-only.

4 functional checks plus 1 targeted follow-up checks passed. Source, Study, CSS and evidence are frozen for parent registry installation/consumer verification. No worker capture/export process remains running.
