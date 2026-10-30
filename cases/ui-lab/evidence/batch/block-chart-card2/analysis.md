# Chart Card 2

Source: https://www.shadcnblocks.com/block/chart-card2. Pro code not read. Only the publicly embedded renderer, its DOM/computed styles and hover output were observed. Standalone fullscreen preview requests login; screenshot is retained.

Files: `src/components/block-chart-card2.tsx/.css`, `src/batch/block-chart-card2/Study.tsx`, `evidence/batch/block-chart-card2/`. API: periods with explicit labelled numeric points and optional axisMax, controlled/uncontrolled selection, onPeriodChange, title/description, color, seriesLabel, formatValue. Existing React and Motion only.

Synthetic fixtures reflect publicly displayed tooltips: 7d 186/205/237/223/249/214/231; 30d 1420/1650/1580/1820; 90d 4200/4800/5100. They are not real analytics. Geometry: card 672 × 372; 24px padding; plot 624 × 256; inner plot x60–614, y10–226. Orange stroke oklch(.646 .222 41.116), gradient .2 → 0. Tabs transition 150ms; curve motion fitted to actual original intermediate frames at 1.5s. Data-to-curve interpolation is independently implemented.

Checks: TypeScript; all period selections and domains; ArrowRight/Home/End; hover/leave; reduced motion; 390px overflow. Recordings include entry reset, period 30d/90d/7d, hover/leave each, keyboard next and return to 7d.

Visual correction: separate public SVG samples identified old-point subset mapping, simultaneous x/y movement and a short initial hold. The replica was revised and the same lifecycle was recorded again.

Known limits: exact paint-phase alignment remains limited by 25fps video and browser scheduling. Initial reveal timing and tooltip positioning retain small differences; private chart internals remain unknown. The 390px replica was checked for overflow; an original mobile A/B was not performed. No 1:1 motion claim.

## Four visual tracks

### Icons

No decorative icons; active hover circle is 4px and appears/disappears with the cursor.

### Light

Orange area gradient is static within the animated curve; no moving glow or shimmer.

### Text

Axis labels switch with the selected period; tooltip appears with explicit label/value; no numeric ticker observed.

### Layout

672x372 fixed card; 624x256 plot; original entry reveals the curve and period transitions reshape it. Tabs have a measured 150ms transition. 1.5s fitted morph keeps latest shape on interruption.

## Evidence boundaries

Image observations: reference/preview.png, period PNGs where present, and actual video contact sheets. Render measurements: measurements.json or rendered.json, chart tooltip values, additional-observations.json. Implementation inference: custom SVG interpolation and any controls explicitly described as demo extensions. No target TSX, JS bundle, registry body, or React internal state was read. No purchase or gate bypass.

Video recordings use isolated headless Chrome, 1440x1100, light theme, with no screenshots during the recording. The public source iframe is 1277x900. Native encoded cadence is 25fps (40ms); duplicate frames and renderer scheduling limit precise micro-transition timing. Frames are extracted without interpolation.

## Final motion correction

`reference/rendered-motion.json` contains actual path coordinates and selected-tab labels sampled via requestAnimationFrame, separately from recording. The measured 7-point to 4-point transition starts from old indices 0, 1, 3, 5; x and y both move. The independent implementation now carries those anchors forward and recomputes the monotone curve. Its new video and native intermediate-frame sheet replace the earlier mismatch.
