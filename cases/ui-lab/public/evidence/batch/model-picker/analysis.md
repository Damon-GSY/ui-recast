# Model Picker reconstruction study

## Evidence boundary

Public source https://www.affectui.com/components/model-picker, Clean/light, isolated Chrome at 1440×1000, DPR 1. Full source video and actual intermediate frame sheets were viewed before implementation. Public rendered DOM/computed styles and active animations were sampled independently of recording. SVG path provenance is in `reference/rendered-svg-assets.json`. The visible Pro gate is saved; no registry URL was guessed or downloaded. No target source, registry bodies, JS bundles or React internals were read.

## Four visual tracks

- **Icons.** Trigger glyph is 18px; list glyphs 20px with soft borders. Explicit source demo glyphs O/S/H and Auto star are Study assets. Selected check springs in over 320ms. Chevron reverses with opening. Study-only bulb unfolds beside the name over 360ms when the visual thinking switch is on; its own 280ms opacity is delayed by 80ms. Switch knob moves 10px; reusable component receives optional indicator and content nodes without implementing backend capabilities.
- **Light and meters.** There is no background glow. The popover has a soft stationary shadow. Pointer focus adds a neutral row fill and reduces other rows to .45 opacity. Caller-supplied score segments light blue; rendered source measurements show 45ms per-segment and 70ms per-column delays, 180ms color transition, 360ms scaleY pulse 1 → 1.6 → 1. Those tracks are independently implemented and present in the recorded hover windows.
- **Text.** Inter 13px/20px, weight 500 model names; 12px descriptions and footer; 10px uppercase column labels. Trigger name crossfades with blur over 320ms. Footer numbers interpolate to explicit latency/price inputs; Auto uses supplied text. Metrics-to-text changes crossfade. Source stable Opus/Medium resolves to 5.3s (verified after 1 second); earlier 420ms video frame still says 5.2s. Replica's independent 420ms fit reaches the rounded endpoint a little sooner. Scores and timing fixtures exist only in Study, and empty metrics are not populated with estimates.
- **Layout.** Source composer wrapper 360×86px. Trigger 28px high, menu 320px wide, 6px offset, 10px corner radius; header 28px, rows 48px, footer 36px. Menu opens from y=-4/scale=.96 with opacity 200ms and transform 320ms cubic-bezier(.32,.72,.24,1). Study effort row unfolds 30px over 420ms; its opacity begins after 100ms. The effort selection fill translates over 220ms. Both fold and reversal are in source and replica frames and rendered trajectories. Narrow replica clamps menu position within the viewport.

## Observed and exercised chain

Reset → open → hover Opus/Haiku/Auto → select Opus → reopen → demo thinking on → High → demo web switch → thinking off → Escape → keyboard reopen → End → choose Auto → reopen → outside dismiss → reset → reopen → select Haiku. Source and replica full videos retain that same chain. Additional checks cover missing supplied metrics, plain reusable picker without demo switches, native disabled trigger, empty options, 390/320px layout and reduced-motion behavior. The source has no search input or clear-selection action; those are not fabricated.

## Comparison and verification

`preview.png` on each side shows hovered Opus with the same selected Sonnet, scores and footer. `stable-hovered.png`, `stable-selected-closed.png`, `stable-thinking.png`, `stable-auto.png` retain settled comparisons. Actual transition frames are in `open-frames.png`, `hover-opus-frames.png`, `thinking-on-frames.png` and `select-opus-frames.png`; raw frames remain under `frames/`. First comparison added the metrics/text blur crossfade and fixed menu positioning near a narrow right edge. `verification.json` holds browser test results. Targeted strict TypeScript passed. No shared build, registry publication or backend capability verification claimed.

## Limitations

Native recording is 25fps, 40ms per frame, with repeated frames and occasional source capture stalls. Action completion times do not perfectly phase-align first rendered frames; separate public animation measurements constrain durations. Numeric interpolation's intermediate rounding and name/caption blur remain fitted rather than identical. Source marketing autoplay is interrupted by manual interaction; unattended autoplay is not reproduced. Dark/Classic, top/end visual variants and physical touch are unverified. Empty/disabled are local interface extensions. Loading is not an exposed source state. Source-demo labels and scores are visual fixtures, not assessments of real models.
