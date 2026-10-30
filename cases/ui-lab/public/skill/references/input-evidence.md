# Input and capture

## Sources and boundaries

Record the URL or input file, component region, variant, theme, viewport, crop, action sequence, and timing. Preserve original material with component/state names. Distinguish reused icon assets, reused source, and independent implementation.

For a reconstruction without source access, inspect the visible output first. For web references, supplement it with visible DOM, computed styles, rendered animation tracks, and public API descriptions. For native references, use visible accessibility information, window/view geometry and screen recordings. Keep rendered evidence separate from assumptions about the underlying framework. Record public Pro restrictions; an anonymous HEAD request to a known registry can establish access status without reading its body. Do not inspect original implementation source, bundles or private framework state. Inaccessible states remain unverified.

## Screenshot and video input

Inspect the full image before close-ups. Leave room for shadows, halos, and popup anchors. Label marketing images separately from actual browser output. One frame leaves timing, curves, and hidden behavior unknown.

Preserve original video timing and frame rate. Watch the sequence, locate change windows, then extract real intermediate frames or timestamped sheets. The included Swift script is an optional **macOS video-frame extraction utility**, not a SwiftUI component or a requirement to generate Swift code. Use it on macOS when AVFoundation can decode the recording:

```sh
swift <skill-dir>/scripts/video-frames.swift <input.mp4> <output-dir> 12
```

It records requested and actual frame times. On other hosts, or with unsupported formats, use an available FFmpeg or browser decoder. The capture-tool language is independent of the implementation language. Higher export rates, duplicate frames, or interpolation add no evidence.

If a decoder cannot read the container, such as WebM in some macOS environments, use browser decoding and `requestVideoFrameCallback` to record `mediaTime`. Preserve requested seek times separately from actual decoded frame times. A sheet requested every 100ms is not proof of exact 100ms sampling.

## Recording a live URL

1. Use an authorized browser tool. Use independent Playwright when permitted; do not reuse a personal browser profile. Existing authorization carries forward.
2. Locate the real preview and state, observe autoplay, then reset manually. Wait for fonts. Confirm the state visually: hidden text in the DOM does not prove that state appeared.
3. Record the complete action chain continuously: entrance, loops, phase handoffs, exit/completion, and retrigger. Cover at least one full cycle of each looping track. Exercise reversal, cancellation, and changing targets where supported. Capture static components by state.
4. Save action request and return times, then identify actual rendered changes separately. Use the correct crop coordinate system. Keep the complete component, popups, and light effects visible at both ends; add margins near viewport edges.
5. With screenshot-only APIs, preserve capture times, call the result a screenshot sequence, and report its actual sampling rate. If browser interaction is unavailable, implement visible structure and leave dynamic verification pending.

## Capturing native references and cross-platform targets

Use an authorized native-app, simulator, device or screen-recording tool for native references; browser automation is the web path. Record OS/runtime, device or window size, display scale, and input method. Distinguish screen pixels from logical points or CSS pixels when aligning crops and geometry. Capture the real supported touch, pointer and keyboard paths, including focus, hover and window behavior where relevant.

When rebuilding into a different platform, preserve the reference's visible state/motion specification, then choose target-native interactions. Record decisions such as hover-only details becoming a touch action; do not silently count those adaptations as exact behavioral matches. Capture the native result itself, not a web rendering standing in for it.

## Light and dark theme capture

Identify what the reference's theme control actually changes: site chrome, preview canvas, component tokens, or all three. A black component on a white canvas is not evidence of dark-mode support. Distinguish explicit component themes, host/app/window appearance and system preferences (`prefers-color-scheme` on the web); verify the rendered result instead of inferring it from a class name or toggle position.

For each in-scope theme, use the same content, dimensions, selection and focus history. Record the complete primary interaction chain and the states it exposes. Save separate theme-labelled recordings, screenshots and rendered measurements. A dark default-state screenshot does not validate dark loading, completion or exit. When only one theme is exposed, document that boundary; label an added theme as a local design choice.

Extract a role palette per theme: canvas, raised/recessed surfaces, primary/secondary/disabled text, borders, icons, focus, accents and status colors. Separately record alpha, gradients, glow/shadow layers, masks, texture and blend modes on their real backgrounds. Note theme-specific image/logo variants and whether transparent assets reveal the canvas. Do not derive dark values by inverting the light palette.

If the reference supports live switching, capture light→dark and dark→light from the same state, including an open popup or active animation when reachable. Observe whether it preserves state, focus and motion phase, switches immediately, or transitions specific properties. Keep theme switching measurements separate from the uninterrupted recordings so they do not contaminate motion comparison.

## Four visual tracks

| Track | Observe |
| --- | --- |
| Icons | Geometry, stroke, color, subelement motion, state replacement, completion morphs, and small loaders in lists/popups. Use consecutive frames to distinguish whole-icon rotation, sequential ray opacity, and static shapes. Check visibility on the actual background. |
| Light | Separate persistent halos from state-triggered layers. Record gradients, masks, bounds, paths, tails, cycles, and handoffs. Distinguish expanding shadow radius from element scaling. Preserve the relationship between base geometry and light layers. |
| Text | Old/new overlap, independent translation, opacity, blur, delays, and duration. Distinguish numeric interpolation from digit rolling. |
| Layout | Size, position, clipping, stationary anchors, easing/overshoot, content/container sequencing, popups, and exiting nodes. |

Attach frames/times or rendered measurements to each observed track. Measure subtle transitions by property rather than assigning one duration or spring to everything.

## Insufficient sampling

Low native frame rates cannot establish short-transition peaks or curves. Recapture the relevant window or measure rendered property trajectories before choosing parameters. Nominal FPS does not guarantee continuously updated frames.

If video skips while direct observation is continuous, separate dense measurement from recording, pause unrelated decoding, prevent hot reloads, and recapture the affected window. Do not interleave element screenshots that scroll or resize the page during recording; extract them afterward. Preserve the target's real speed and business timing.

For parallel Vite previews, use separate cache directories and resolve a single React instance per preview. Shared dependency prebundling can break the main page or contaminate captures. Isolated preview servers should still import the actual deliverable source.
