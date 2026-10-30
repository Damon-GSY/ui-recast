# Dashboard 2

Source: https://www.shadcnblocks.com/block/dashboard2. Pro implementation not read. Normal embedded preview was operated; separate fullscreen link is login-gated. Public rendered Lucide SVG icons and avatar/brand images are reused in the demo with `assets-provenance.json`; component implementation is independent.

Files: `src/components/block-dashboard2.tsx/.css`; `src/batch/block-dashboard2/Study.tsx` plus fixture JSON/assets. Data interfaces supply brand/user/navigation, periods with explicit revenue/COGS/operating points, metrics, transactions, notifications and icon slots. Chart/summary/footer slots allow replacement. Callbacks expose navigation, export, draft save, period changes, notification read and transaction actions. Existing React/Motion only. No backend claims; all finance values, 50 transaction records and side effects belong to the synthetic Study fixture.

Measured structure: 1277 × 900 viewport; 256px sidebar; 8px inset, 69px header; scrolling content padded 24px; two 337px chart cards; four-column metrics strip; transaction table with toolbar/pagination. Source curve and cost hover values were collected explicitly. The source yearly cost headline is $2,705,800 while observed point values sum to $2,633,200: `costTotal` is a separate explicit input preserving that discrepancy. It is not silently treated as the sum.

Verified: combined status/method/search filtering, no-results, pagination, cancelled draft retained on reopen, Escape focus return, save callback, mark notifications read, CSV callback/download, periods, sidebar reversal, 390px no page overflow. Full source and replica action chains include chart hover/leave, Directory fold/reverse, period switches, sidebar collapse/reverse, notifications, draft type/cancel/reopen/Escape, status selection/reset, search/clear, method menu, row-actions menu, next/previous page.

Known limits: independent SVG smoothing and cross-period graph interpolation differ from the source chart engine. Source filter state is URL-persistent; this reusable component intentionally keeps it local, with the integration layer responsible for any URL state. Account/navigation/row actions are callbacks; the demo does not recreate destination pages. Row-details display and duplicate/void fixture behavior are demo extensions, not evidence of the original destinations. Source mobile behavior not A/B captured. No 1:1 claim.

## Four visual tracks

### Icons

Public Lucide outline icons and real rendered logo/avatar assets; Directory chevron turns; notification count and status symbols change semantically. An incorrect SVG stroke rewrite was found in replica review and fixed before final recording.

### Light

Static neutral surfaces/shadows, black area gradient and stacked bars. Dialog overlay adds darkening and blur; no animated glow.

### Text

Period totals and labels replace immediately, menu/dialog text appears with the container; input retains draft on close/reopen. Displayed cost headline is distinct from chart-point sum.

### Layout

Sidebar collapses and expands, Directory opens/closes, menus/dialog fade/scale, charts transition by period, table shrinks/changes on filtering and scrolls within the content inset. Source menu opening animation computed at 100ms; sidebar/chevron around200ms; charts fitted independently.

## Evidence boundaries

Image observations: reference/preview.png, period PNGs where present, and actual video contact sheets. Render measurements: measurements.json or rendered.json, chart tooltip values, additional-observations.json. Implementation inference: custom SVG interpolation and any controls explicitly described as demo extensions. No target TSX, JS bundle, registry body, or React internal state was read. No purchase or gate bypass.

Video recordings use isolated headless Chrome, 1440x1100, light theme, with no screenshots during the recording. The public source iframe is 1277x900. Native encoded cadence is 25fps (40ms); duplicate frames and renderer scheduling limit precise micro-transition timing. Frames are extracted without interpolation.

Final visual correction: native sidebar-transition frames exposed independently moving stacked-bar layers. Both layers now use the same SVG path geometry, and resize updates are immediate for both; period transitions remain animated. The affected lifecycle was recorded again.

The final capture excludes its own Vite HMR WebSocket to prevent unrelated shared-workspace edits reloading the recording. An interrupted take was discarded; the final video has a continuous capture clock. `replica/stack-geometry-check.json` records the measured left/vertical joins of both bar layers during sidebar collapse/reverse (maximum gap 0).

Net Profit evidence correction: parent review found the prior comparison showing $213,010.00 instead of the public stable $213,100.00. The current Study already supplies $213,100.00; both live reference and replica DOM were checked at 2.2 seconds and again 0.5 seconds later, with unchanged values. `metric-check.json` and original-size `metric-comparison.png` record that result. Stable previews/comparison and the replica lifecycle were refreshed from the current implementation. This resolves stale fixture/evidence, not an animation phase mismatch; no phase-alignment claim is made from the old image.
