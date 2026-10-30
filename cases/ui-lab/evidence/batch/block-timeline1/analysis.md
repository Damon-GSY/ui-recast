# Three-stage process timeline

Source: https://www.shadcnblocks.com/block/timeline1
Theme: Shadcn Default / light. Observation date: 2026-10-29.

## Provenance and access

The public Pro page and its official embedded preview were observed. Original full video was captured before implementation. Source TypeScript/TSX, JavaScript bundles, registry bodies and framework internals were not used as implementation inputs. The source gate is recorded in `source-gate.json` and `reference/public-page.png`. Direct preview navigation was rejected by the site's iframe-origin policy; `reference/direct-navigation-denied.*` preserves that result. The official parent-page iframe was accessible without bypass or purchase. No registry endpoint was probed.

Original browser viewport:1440×1400; embedded preview:1277×900. Replica viewport:1277×900. Video crop is1276×900 because the encoder requires even dimensions. Source and replica raw videos are retained as `full-lifecycle.webm`; `lifecycle.webm` is cropped and synchronized to a visual marker. Screenshots/computed-style measurements were taken separately from recording.

## Four visual tracks

**Icons.** Files, panel/layout and growth arrow geometries were obtained from the public rendered SVG elements, saved in reference/public-assets.json. They remain static; the circle and connectors also remain static.

**Light and surface.** Black outlines on white, muted descriptions; no illumination, radial pulse, draw-on connector or hover glow was observed.

**Text.** Source computed family names advertised Inter/IBM Plex Mono but platform-font evidence shows system sans and monospace fallbacks in this environment. Replica uses system-ui and ui-monospace to reproduce actual render, including line breaks. No text animation. Actual rendered sans font is the system fallback; see shared evidence within this assignment at `../block-timeline1/reference/font-measurements.json`.

**Layout and transitions.** 576px centered text column; 128px outer vertical padding. Three96px circles with2px borders and32px icons. Titles30/36 medium, descriptions16/24 monospace;144px vertical dotted connectors with12px margins. Total root height1252px matches source. Static initial/hydrated state; ordinary document scrolling exposes the three steps. Icon hover does not animate. Full video records top, middle, bottom, return and reset. No dynamic timeline completion is claimed.

## Reusable interface

`steps: ProcessTimelineStep[]` with stable id, title, ReactNode description, ReactNode icon and optional href/actionLabel. Optional label, className and onStepSelect(id). Exported TimelineProcessIcon supplies the three observed icon geometries; callers can supply their own.

Source: `src/components/block-timeline1.tsx` and adjacent CSS. Default-exported demo: `src/batch/block-timeline1/Study.tsx`. Component data is caller-owned; fixture mutations, selected-record panels and demonstration messages belong to Study. No real invitation, account or financial/backend integration is connected.

## Recorded and verified coverage

All three distinct steps, exact public rendered SVG geometries, full vertical scroll range, hover/no-animation and reset. Local demo toggles optional actions and verifies a stable configuration step callback.

The recorded action sequence and actual dispatch/completion times are in each side's `video-timeline.json`. `contact-sheet.png` includes baseline, meaningful states and post-reset tail. `transition-contact-sheet.png` and `micro-transition-contact-sheet.png` contain actual video frames at intermediate phases; individual PNGs are retained. Visual comparison uses rendered phases rather than assuming equal network reload latency.

4/4 original local functional checks passed with no page errors. Targeted TypeScript checking passed. Follow-up regression results, full video errors and final comparison findings are in `verification.json`. Local390px layout checks passed; equivalent narrow source behavior was not exhaustively observed. Parent owns registry packaging and independent consumer build; this worker did not run or modify them.

## Limits and remaining differences

- The public timeline is static; no unavailable interaction or progress animation has been invented.
- Optional action buttons in Study are an explicit API example and are disabled by default; they are not source-observed.
- Fonts are platform fallbacks; another OS may produce different glyph rasterization or wrapping.
- Native recordings are25fps (40ms per frame). A100ms transition spans only2–3 native frames, and some frames repeat. Computed CSS and still measurements supplement the video; no exact easing or pixel-identical claim is made.
- Source network hydration/reload may show temporary blank frames; final tail samples demonstrate the restored state. These source loading delays are evidence, not component motion reproduced locally.
- Avatar URLs in the member demos reference publicly rendered Shadcnblocks image assets and need network access. Components also accept caller-provided avatar URLs/initials.

## Dependencies

Existing React19 and CSS. The three interactive popover components use already-installed `motion/react`; the grouped table and static timeline do not. No package or lockfile change, install, purchase, commit or shared-file modification was made.

## Final comparison and freeze

Final source/replica lifecycle frame sheets were actually viewed; opening, change and closing microframes were also viewed for the interactive components. Material omissions found in review were corrected before the final replica recording. The final five recordings completed with no page errors and the same named action chains as their references. Source reload latency and individual frame dispatch differ.

- Matched public rendered SVG geometry, 1252px root height and actual platform font fallbacks.

Final remaining differences: OS-dependent system/monospace fallback rasterization. Original timeline is static; optional action controls are demo-only.

4 functional checks plus 1 targeted follow-up checks passed. Source, Study, CSS and evidence are frozen for parent registry installation/consumer verification. No worker capture/export process remains running.
