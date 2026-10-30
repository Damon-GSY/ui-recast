# Member directory

Source: https://www.shadcnblocks.com/block/member-list1
Theme: Shadcn Default / light. Observation date: 2026-10-29.

## Provenance and access

The public Pro page and its official embedded preview were observed. Original full video was captured before implementation. Source TypeScript/TSX, JavaScript bundles, registry bodies and framework internals were not used as implementation inputs. The source gate is recorded in `source-gate.json` and `reference/public-page.png`. Direct preview navigation was rejected by the site's iframe-origin policy; `reference/direct-navigation-denied.*` preserves that result. The official parent-page iframe was accessible without bypass or purchase. No registry endpoint was probed.

Original browser viewport:1440×1400; embedded preview:1277×900. Replica viewport:1277×900. Video crop is1276×900 because the encoder requires even dimensions. Source and replica raw videos are retained as `full-lifecycle.webm`; `lifecycle.webm` is cropped and synchronized to a visual marker. Screenshots/computed-style measurements were taken separately from recording.

## Four visual tracks

**Icons.** Static status indicators, avatar dots, filter/display/plus/team controls. Publicly rendered team gradients and hidden team names were measured separately in reference/team-labels.json and copied into demo fixture data, with source provenance. Duplicate names retain distinct ids.

**Light and surface.** Thin neutral rules; subtle row hover; dark tooltip with arrow, source chart-color gradients and small menu shadows. Status green/yellow/gray is semantic availability, not a financial trend.

**Text.** 14/20 member names and header, 12/16 emails/role/team/join date. Header total remains16 while filtering, as observed. Tooltip exposes full team labels and codes. No animated counters. Actual rendered sans font is the system fallback; see shared evidence within this assignment at `../block-timeline1/reference/font-measurements.json`.

**Layout and transitions.** Full-width directory. Header 57px; column strip 37px; 61px row pitch, final row 60px; total 1069px for 16 fixtures. 32px avatars; columns 36/16/14/20/14 percent. Team tooltip width224px, 28px gradient icons and three 36px label rows. Static entry, approximately100ms filter popovers and 150ms tooltip fade/scale. Tooltip dwell is fitted around600ms. Availability and role selections replace visible rows; sort reorders stable ids. Record includes filter, Away selection, team tooltip, row hover, scrolling, visible Display/Invite actions and resets.

## Reusable interface

`members: DirectoryMember[]` with stable id, name, email, optional avatar, availability, role, teams and joined label/optional ISO joinedAt. Teams expose stable id, code, name and optional CSS color/gradient. Required `onInvite`, `onDisplay`; optional `onMemberSelect(id)`, `onFiltersChange`, title and className.

Source: `src/components/block-member-list1.tsx` and adjacent CSS. Default-exported demo: `src/batch/block-member-list1/Study.tsx`. Component data is caller-owned; fixture mutations, selected-record panels and demonstration messages belong to Study. No real invitation, account or financial/backend integration is connected.

## Recorded and verified coverage

Availability submenu/selection/reset, all team tooltip labels, row hover, bottom/top scroll, Display/Invite activation and final reset in full lifecycle. Separate source screenshots cover Role and Sort by submenus. Local checks additionally cover Member filter, descending-name sort and selecting the second duplicate Jack id.

The recorded action sequence and actual dispatch/completion times are in each side's `video-timeline.json`. `contact-sheet.png` includes baseline, meaningful states and post-reset tail. `transition-contact-sheet.png` and `micro-transition-contact-sheet.png` contain actual video frames at intermediate phases; individual PNGs are retained. Visual comparison uses rendered phases rather than assuming equal network reload latency.

7/7 original local functional checks passed with no page errors. Targeted TypeScript checking passed. Follow-up regression results, full video errors and final comparison findings are in `verification.json`. Local390px layout checks passed; equivalent narrow source behavior was not exhaustively observed. Parent owns registry packaging and independent consumer build; this worker did not run or modify them.

## Limits and remaining differences

- Display and Invite produced no visible source panel in the observed public preview; replica exposes explicit callbacks and the Study reports them outside the crop.
- Role/sort options are source-observed in still states and locally exercised; the main lifecycle video records the availability branch rather than every menu permutation.
- Tooltip dismissal timing across the source iframe boundary and custom icon strokes remain small visible differences.
- Native recordings are25fps (40ms per frame). A100ms transition spans only2–3 native frames, and some frames repeat. Computed CSS and still measurements supplement the video; no exact easing or pixel-identical claim is made.
- Source network hydration/reload may show temporary blank frames; final tail samples demonstrate the restored state. These source loading delays are evidence, not component motion reproduced locally.
- Avatar URLs in the member demos reference publicly rendered Shadcnblocks image assets and need network access. Components also accept caller-provided avatar URLs/initials.

## Dependencies

Existing React19 and CSS. The three interactive popover components use already-installed `motion/react`; the grouped table and static timeline do not. No package or lockfile change, install, purchase, commit or shared-file modification was made.

## Final comparison and freeze

Final source/replica lifecycle frame sheets were actually viewed; opening, change and closing microframes were also viewed for the interactive components. Material omissions found in review were corrected before the final replica recording. The final five recordings completed with no page errors and the same named action chains as their references. Source reload latency and individual frame dispatch differ.

- Matched measured 1069px list geometry.
- Corrected tooltip text sizes, public gradient tokens and hidden team labels.
- Preserved stable ids for duplicate names; verified role filter and descending sort.

Final remaining differences: Small custom status/team icon stroke differences. Tooltip appearance is later within the sampled opening window; dismissal also differs slightly when the source pointer crosses its iframe boundary. Role/sort are observed in separate source states and locally tested; main video covers Availability branch.

7 functional checks plus 3 targeted follow-up checks passed. Source, Study, CSS and evidence are frozen for parent registry installation/consumer verification. No worker capture/export process remains running.
