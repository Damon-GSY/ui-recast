# Stats Card 4

Source: https://www.shadcnblocks.com/block/stats-card4 (Pro implementation; normal embedded preview accessible).

Independent implementation: `src/components/block-stats-card4.tsx` and `.css`. Demo: `src/batch/block-stats-card4/Study.tsx`. Props hold current/previous numeric values and labels, formatter, title/className. Swap/reset is a synthetic demo harness. No new dependency.

Measured default: 320 × 152, same 24px card rhythm; 24/32 bold values in a two-column grid with 16px gap and a 1px divider. Previous value/labels use #737373. No icons, glow, hover animation or automatic lifecycle observed.

Checks: TypeScript, live render, swap and reset values/labels, 390px overflow. Source/replica recordings capture actual steady/hover/leave states.

Known limits: period swapping is a supplied demo control, not a source-preview control. This is a static visual reconstruction with reusable values, not a claim of an unobservable animation. Dark theme not covered.

## Four visual tracks

### Icons

No icon.

### Light

Static shadow/ring; no animated light.

### Text

Two stable value/label pairs; current dark, previous muted; no original ticker or crossfade.

### Layout

320x152; fixed two-column grid, 16px gap, vertical divider; no layout transition observed.

## Evidence boundaries

Image observations: reference/preview.png, period PNGs where present, and actual video contact sheets. Render measurements: measurements.json or rendered.json, chart tooltip values, additional-observations.json. Implementation inference: custom SVG interpolation and any controls explicitly described as demo extensions. No target TSX, JS bundle, registry body, or React internal state was read. No purchase or gate bypass.

Video recordings use isolated headless Chrome, 1440x1100, light theme, with no screenshots during the recording. The public source iframe is 1277x900. Native encoded cadence is 25fps (40ms); duplicate frames and renderer scheduling limit precise micro-transition timing. Frames are extracted without interpolation.
