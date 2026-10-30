# Workspace members

Source: https://www.shadcnblocks.com/block/settings-members2
Theme: Shadcn Default / light. Observation date: 2026-10-29.

## Provenance and access

The public Pro page and its official embedded preview were observed. Original full video was captured before implementation. Source TypeScript/TSX, JavaScript bundles, registry bodies and framework internals were not used as implementation inputs. The source gate is recorded in `source-gate.json` and `reference/public-page.png`. Direct preview navigation was rejected by the site's iframe-origin policy; `reference/direct-navigation-denied.*` preserves that result. The official parent-page iframe was accessible without bypass or purchase. No registry endpoint was probed.

Original browser viewport:1440×1400; embedded preview:1277×900. Replica viewport:1277×900. Video crop is1276×900 because the encoder requires even dimensions. Source and replica raw videos are retained as `full-lifecycle.webm`; `lifecycle.webm` is cropped and synchronized to a visual marker. Screenshots/computed-style measurements were taken separately from recording.

## Four visual tracks

**Icons.** Search, chevron, more, check, close and return marks are static SVG geometry. Role selection swaps the check mark; avatars are ordinary images or initials, without icon animation.

**Light and surface.** White surface, neutral rules, panel shadows; invitation backdrop uses 10% black and 4px blur. No glow, pulse or moving highlight was observed.

**Text.** 24/32 heading, 14/20 primary text, 12/16 metadata. Search updates the count and list immediately. No text morph or number animation. Actual rendered sans font is the system fallback; see shared evidence within this assignment at `../block-timeline1/reference/font-measurements.json`.

**Layout and transitions.** 768px section with 32px side padding, 704px content; at 1277×900 the section starts at (254.5,100), heading at (286.5,228). Four 40px avatars; 65px row pitch; 96px role triggers. Dialog is 448px wide with header, tinted form body, and white action footer. Entry is static after the source preview hydrates. Role and action panels have short fade/scale transitions; source computed animation duration is 100ms. Invite opens/closes with fade/scale and backdrop blur. Filtering changes the centered section height immediately. Escape, cancel, reopen and reset are in the recorded chain.

## Reusable interface

`members: WorkspaceMember[]` with stable `id`, `name`, `email`, `role`, optional avatar URL. Required `onRoleChange(id, role)`, `onRemove(id)`, `onTransferOwnership(id)`, `onInvite({email, role})`; the invitation callback may return a promise. Optional title, description, permissions-help callback and className.

Source: `src/components/block-settings-members2.tsx` and adjacent CSS. Default-exported demo: `src/batch/block-settings-members2/Study.tsx`. Component data is caller-owned; fixture mutations, selected-record panels and demonstration messages belong to Study. No real invitation, account or financial/backend integration is connected.

## Recorded and verified coverage

Search Jack, clear, empty search, role select/change, member menu open/close, invite open, email entry, role choice, cancel/reopen, final reset. Local checks additionally cover removal, successful demo invitation and trigger focus restoration.

The recorded action sequence and actual dispatch/completion times are in each side's `video-timeline.json`. `contact-sheet.png` includes baseline, meaningful states and post-reset tail. `transition-contact-sheet.png` and `micro-transition-contact-sheet.png` contain actual video frames at intermediate phases; individual PNGs are retained. Visual comparison uses rendered phases rather than assuming equal network reload latency.

8/8 original local functional checks passed with no page errors. Targeted TypeScript checking passed. Follow-up regression results, full video errors and final comparison findings are in `verification.json`. Local390px layout checks passed; equivalent narrow source behavior was not exhaustively observed. Parent owns registry packaging and independent consumer build; this worker did not run or modify them.

## Limits and remaining differences

- Source permission help destination, actual invitation delivery and ownership transfer effects were not verified; callbacks leave these responsibilities with the host.
- Custom SVG strokes and native-dialog/backdrop easing retain small differences from the public preview.
- Invitation email focus and popup Escape behavior were fixed after frame comparison; final recordings reflect the fixes.
- Native recordings are25fps (40ms per frame). A100ms transition spans only2–3 native frames, and some frames repeat. Computed CSS and still measurements supplement the video; no exact easing or pixel-identical claim is made.
- Source network hydration/reload may show temporary blank frames; final tail samples demonstrate the restored state. These source loading delays are evidence, not component motion reproduced locally.
- Avatar URLs in the member demos reference publicly rendered Shadcnblocks image assets and need network access. Components also accept caller-provided avatar URLs/initials.

## Dependencies

Existing React19 and CSS. The three interactive popover components use already-installed `motion/react`; the grouped table and static timeline do not. No package or lockfile change, install, purchase, commit or shared-file modification was made.

## Final comparison and freeze

Final source/replica lifecycle frame sheets were actually viewed; opening, change and closing microframes were also viewed for the interactive components. Material omissions found in review were corrected before the final replica recording. The final five recordings completed with no page errors and the same named action chains as their references. Source reload latency and individual frame dispatch differ.

- Matched measured centered layout and role popup alignment.
- Added enter/exit transitions and matched backdrop blur.
- Fixed email focus on first open and reopen; trigger focus returns on Escape.

Final remaining differences: Small custom SVG stroke differences. Native dialog/backdrop easing is a visual fit, not the original implementation.

8 functional checks plus 3 targeted follow-up checks passed. Source, Study, CSS and evidence are frozen for parent registry installation/consumer verification. No worker capture/export process remains running.
