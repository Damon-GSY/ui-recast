# Fluid Notch — independent GPT-6.1 Sol trial

Observed on 2026-10-30 in a clean, headless Chrome profile. This reconstruction uses only rendered evidence from the public preview, visible DOM/computed styles, and permitted visible assets. No original component source, registry, bundles, React internals, previous cases or conversation history was inspected.

## Paid target

Fluid Notch qualifies as the requested paid Pro component: the original page visibly locks Code and offers Get All-Access purchase controls; the full-screen footer labels it Pro. See `evidence/reference/initial.png` and `full-preview.png`. The public preview remained usable without access to gated source.

## Observed behavior

The idle capsule opens question one of three. Each decision folds the card back and decrements the remaining count. Escape also consumes the current question; an outside click does not. Opening after the third decision shows a completion card with Start over. Start over closes and restores three questions. The question and completion panels stay centered on the original pill's center throughout their size changes.

The public Version 1 selector is disabled (`data-disabled=true`); there is no second exposed variant. Active study controls are Card Width, Grain, Dust and Grain Background; the site also exposes a light/dark theme switch. A screenshot or DOM-hidden question was not treated as a visible state.

## Four visual tracks

| Track | Rendered observation | Reconstruction |
| --- | --- | --- |
| Icons | 18px progress circle, 2px strokes, quarter-turn starting at 12 o'clock. Ring advances by thirds; completion fills white and draws a dark check. 24px overlapping pill portraits, 28px portraits in cards. | Independently drawn SVG, separate ring/fill/check animation. Original visible avatar images. Progress is caller-owned and keeps updating during collapse. |
| Light / texture | Light canvas #fff; shell #0a0a0a, dark-theme shell #171717; white 10% outline. Two shadow layers: compact idle and wider open. Fine stationary 160px grain at .22. Eighteen small outward dust flecks appear around edges and fade away; no persistent rotating halo or looping loader was observed. | Separate opacity-crossfaded shadows; reused visible SVG noise asset; finite randomized outward flecks. Dust off removes the burst. Background grain is a separate 180px gray noise asset with .12 multiply / .08 screen compositing. |
| Text | White 16/24px, weight 500, -.4px tracking title; white 50% 14/20 body; 12/16 context/header. Dialog enters from y=-6 with blur 8 to 0 after a short delay. Old text fades before the next question replaces it. Pill blurs to 6px and scales to .94 on open; card text is never stretched with its shell. | Local copy of the displayed Inter font. Measured typography, independent unscaled text layer, outgoing card snapshot. Separate open/close opacity and blur timings. |
| Layout | Approx. 281x40px idle; expanded width 340px. Q1 height 242px; Q2/Q3 222px; completion 202px. Radius 20 to 26px; modest geometric overshoot, settling in roughly 600ms. | ResizeObserver measures actual content and pill. Motion animates width/height/y/radius with fitted stiffness 280, damping 27. Geometry retargets from the currently animated values. |

`evidence/reference/expand-measurements.json`, `collapse-measurements.json` and `collapse-q2-measurements.json` contain actual rAF DOM/computed-style samples, separate from video recording. `motion-fit.json` is a fitted implementation hypothesis, not recovered original parameters. Sampling offsets include action dispatch latency and are not animation delays. Video has native 25fps samples, so it alone cannot resolve every 16ms transition detail.

## Architecture

`src/component/FluidNotch.tsx` and its CSS contain presentation, ephemeral animation snapshots and focus handling. The caller supplies the card, people, reviewed count, total, open state and callbacks. No launch/reviewer/QA decisions live inside the component. `src/example/fixtures.ts` holds the observed sample records; `App.tsx` owns progression, decisions, reset and study controls. The example's live decision text reports callbacks but is hidden from capture mode.

Only React, React DOM and Motion are runtime dependencies. The shell and content have separate animation owners. Reduced-motion users get immediate geometry/content changes and no dust. Closed dialog contents are inert, actions are native buttons, and focus returns to the trigger on close.

Mechanism documentation consulted: [Motion animation](https://motion.dev/docs/react-animation) and [Motion transitions](https://motion.dev/docs/react-transitions). These informed API use, not target measurements.
