# Faceted orders table

Source: https://www.shadcnblocks.com/block/data-table12
Theme: Shadcn Default / light. Observation date: 2026-10-29.

## Provenance and access

The public Pro page and its official embedded preview were observed. Original full video was captured before implementation. Source TypeScript/TSX, JavaScript bundles, registry bodies and framework internals were not used as implementation inputs. The source gate is recorded in `source-gate.json` and `reference/public-page.png`. Direct preview navigation was rejected by the site's iframe-origin policy; `reference/direct-navigation-denied.*` preserves that result. The official parent-page iframe was accessible without bypass or purchase. No registry endpoint was probed.

Original browser viewport:1440×1400; embedded preview:1277×900. Replica viewport:1277×900. Video crop is1276×900 because the encoder requires even dimensions. Source and replica raw videos are retained as `full-lifecycle.webm`; `lifecycle.webm` is cropped and synchronized to a visual marker. Screenshots/computed-style measurements were taken separately from recording.

## Four visual tracks

**Icons.** Static outline status marks, plus-circle facets, visibility sliders, sort arrows and pagination chevrons. The Pending symbol is static in the observed preview, not a loading spinner.

**Light and surface.** Neutral white/gray surfaces, dashed facet trigger outlines, pill badges, thin row rules and small popover shadows. Selected paid/fulfilled badges use dark fills. No ambient animated light.

**Text.** System sans for labels, UI monospace for order/payment identifiers; 12px status pills. Counts, selected facet labels and page text change immediately. Actual rendered sans font is the system fallback; see shared evidence within this assignment at `../block-timeline1/reference/font-measurements.json`.

**Layout and transitions.** 1024px max outer container with 32px inset, producing 960px content; 128px top spacing. Heading is 24/32 bold. Search and facet toolbar is 32px high, 16px above a 40px table header and approximately 37px data rows. Count and page controls sit below the table. Popover entry/exit is a short opacity/scale/offset transition, fitted to observed 100ms CSS. Search, facet intersection, column visibility and pagination replace/reflow table rows without an invented chart animation. Source wrapper centers short results vertically.

## Reusable interface

`rows: FacetedOrder[]` with stable id, order, item, quantity, customer, orderStatus, paymentStatus and paymentMethod. Optional `onFiltersChange`, `onOrderSelect`, title, description and className. Filtering, sorting, visibility and pagination are local view state; data remains external.

Source: `src/components/block-data-table12.tsx` and adjacent CSS. Default-exported demo: `src/batch/block-data-table12/Study.tsx`. Component data is caller-owned; fixture mutations, selected-record panels and demonstration messages belong to Study. No real invitation, account or financial/backend integration is connected.

## Recorded and verified coverage

Order/payment facet opening, selection, intersection and clearing; search hit/empty/clear; customer visibility; next/first page; order sort; reset. Separate observed states include both page-size choices and page three. Local checks cover page-size 20 and selected-record callback.

The recorded action sequence and actual dispatch/completion times are in each side's `video-timeline.json`. `contact-sheet.png` includes baseline, meaningful states and post-reset tail. `transition-contact-sheet.png` and `micro-transition-contact-sheet.png` contain actual video frames at intermediate phases; individual PNGs are retained. Visual comparison uses rendered phases rather than assuming equal network reload latency.

11/11 original local functional checks passed with no page errors. Targeted TypeScript checking passed. Follow-up regression results, full video errors and final comparison findings are in `verification.json`. Local390px layout checks passed; equivalent narrow source behavior was not exhaustively observed. Parent owns registry packaging and independent consumer build; this worker did not run or modify them.

## Limits and remaining differences

- The final lifecycle video follows the recorded main chain; page-size and page-three menus are additionally documented in separate source states rather than every permutation in the video.
- The reconstructed table/footer has roughly a 2px total-height residual at the baseline viewport, and hand-drawn status icon strokes differ slightly.
- Selected-order details are an explicit local Study callback example, not a verified source detail route.
- Native recordings are25fps (40ms per frame). A100ms transition spans only2–3 native frames, and some frames repeat. Computed CSS and still measurements supplement the video; no exact easing or pixel-identical claim is made.
- Source network hydration/reload may show temporary blank frames; final tail samples demonstrate the restored state. These source loading delays are evidence, not component motion reproduced locally.
- Avatar URLs in the member demos reference publicly rendered Shadcnblocks image assets and need network access. Components also accept caller-provided avatar URLs/initials.

## Dependencies

Existing React19 and CSS. The three interactive popover components use already-installed `motion/react`; the grouped table and static timeline do not. No package or lockfile change, install, purchase, commit or shared-file modification was made.

## Final comparison and freeze

Final source/replica lifecycle frame sheets were actually viewed; opening, change and closing microframes were also viewed for the interactive components. Material omissions found in review were corrected before the final replica recording. The final five recordings completed with no page errors and the same named action chains as their references. Source reload latency and individual frame dispatch differ.

- Corrected baseline column widths, line boxes, badge alignment and footer typography.
- Fixed Escape after Clear filters removes the focused option.
- Moved capture controls outside the document scroll range; filter/empty transitions retain viewport position.

Final remaining differences: Approximately 2px baseline total-height residual. Status/filter SVG details and short popover easing are approximate. Page-size and page-three coverage is in separate states/local checks, not every full-video branch.

11 functional checks plus 3 targeted follow-up checks passed. Source, Study, CSS and evidence are frozen for parent registry installation/consumer verification. No worker capture/export process remains running.
