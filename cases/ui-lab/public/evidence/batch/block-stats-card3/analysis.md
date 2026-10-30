# Stats Card 3

Source: https://www.shadcnblocks.com/block/stats-card3 (Pro implementation; normal embedded preview accessible).

Independent implementation: `src/components/block-stats-card3.tsx` and `.css`. Demo: `src/batch/block-stats-card3/Study.tsx`. Props: title, numeric value/target, formatter, className. Synthetic fixture and slider/reset live only in Study. No new dependency.

Measured default: 320 × 196, white 12px radius, 24px padding/gap, 14/20 muted heading, 30/36 bold value, 8px track; bar at 75%. Public preview has no interactive control, icon, glow, automatic cycle or hover change. Computed progress transform transition is 150ms cubic-bezier(.4,0,.2,1). Demo slider is an added input harness, not an observed original action.

Checks: TypeScript, live local render, 0/75/125 percent inputs, capped aria-valuenow, reset, 390px overflow. Source and replica steady/hover/leave recordings use the same action chain; actual contact sheets kept in evidence.

Known limits: reference provides no way to change the goal, so value-change motion cannot be claimed as a dynamically matched source interaction. Dark theme not part of this light-theme assignment.

## Four visual tracks

### Icons

No icons in the rendered component.

### Light

No glow; static white surface, subtle ring/shadow; no hover effect observed.

### Text

Heading, value and helper labels remain stationary during the original hover/leave recording.

### Layout

320x196 stable; public progress indicator transform transition measured at 150ms cubic-bezier(.4,0,.2,1). No public value-changing control.

## Evidence boundaries

Image observations: reference/preview.png, period PNGs where present, and actual video contact sheets. Render measurements: measurements.json or rendered.json, chart tooltip values, additional-observations.json. Implementation inference: custom SVG interpolation and any controls explicitly described as demo extensions. No target TSX, JS bundle, registry body, or React internal state was read. No purchase or gate bypass.

Video recordings use isolated headless Chrome, 1440x1100, light theme, with no screenshots during the recording. The public source iframe is 1277x900. Native encoded cadence is 25fps (40ms); duplicate frames and renderer scheduling limit precise micro-transition timing. Frames are extracted without interpolation.
