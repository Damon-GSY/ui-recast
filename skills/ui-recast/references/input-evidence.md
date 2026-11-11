# Input and capture

## Sources and boundaries

Record the URL or input file, component region, variant, theme, viewport, crop, action sequence, and timing. Preserve original material with component/state names. Distinguish reused icon assets, reused source, and independent implementation.

For a reconstruction without source access, inspect the visible output first. For web references, supplement it with visible DOM, computed styles, rendered animation tracks, and public API descriptions. For native references, use visible accessibility information, window/view geometry and screen recordings. Keep rendered evidence separate from assumptions about the underlying framework. Record public Pro restrictions; an anonymous HEAD request to a known registry can establish access status without reading its body. Do not inspect original implementation source, bundles or private framework state. Inaccessible states remain unverified.

## Screenshot and video input

Inspect the full image before close-ups. Leave room for shadows, halos, and popup anchors. Label marketing images separately from actual browser output. One frame leaves timing, curves, and hidden behavior unknown.

Record the image's pixel width, height, and capture scale. A 2880px-wide screenshot may represent a 1440 CSS-pixel viewport; image pixels, CSS pixels, and native logical points are not interchangeable. If the scale is unknown, state the assumption and keep it consistent for both reference and reconstruction. Keep crop coordinates in the source coordinate system.

Measure from clean regions rather than single pixels. Sample a small rectangle in each stable surface for a median color; avoid antialiased text/icon edges, gradients, compression artifacts, and video frames unless the compressed motion itself is the track being measured. Record each sample as role, source rectangle, color, color profile when known, opacity/compositing context, and actual background. For layout, record the box's source coordinates, width/height, distances to stationary anchors, and normalized ratios; ratios guide implementation while absolute coordinates locate errors. For cropped icons, textures, and logos, preserve source bounds, background, licensing/provenance, and transparent-pixel interpretation.

Use visible web measurements to supplement a screenshot when available: element/client/scroll boxes, computed typography, transform matrices, effective stacking context, and active animation/transition declarations. Treat these as rendered evidence, not proof of the reference's internal implementation. A visually identical reconstruction may legitimately use different markup or properties.

Preserve original video timing and frame rate. Watch the sequence, locate change windows, then extract real intermediate frames or timestamped sheets. The included Python helper is independent of the component implementation language. It uses Python 3.9+ standard library and a full FFmpeg installation; no Python packages are required.

```sh
python3 <skill-dir>/scripts/video_frames.py <input.webm> <output-dir> 12
# If FFmpeg is not on PATH, pass --ffmpeg /path/to/ffmpeg (or set FFMPEG).
```

Use a new output directory. The script writes PNGs and `frames.json`. `actualMs` comes from the decoder's presentation timestamp, with container start shifted to zero; `sampleBucketStartMs` is the requested sampling bucket's start, not an observed animation onset. Time buckets are anchored to the first decoded frame; it selects the first native frame in each occupied bucket. Raising the requested rate above the source rate does not generate extra or interpolated frames. The helper supports formats decoded by the installed FFmpeg, including typical MP4 and WebM recordings. See the official [select](https://ffmpeg.org/ffmpeg-filters.html#select_002c-aselect) and [showinfo](https://ffmpeg.org/ffmpeg-filters.html#showinfo) documentation for the underlying filters.

Higher export rates, duplicate frames, or interpolation add no evidence. A browser-bundled minimal FFmpeg may omit the required filters; use a full build with `select`, `showinfo`, and PNG support.

If a decoder cannot read the container, such as WebM in some macOS environments, use browser decoding and `requestVideoFrameCallback` to record `mediaTime`. Preserve requested seek times separately from actual decoded frame times. A sheet requested every 100ms is not proof of exact 100ms sampling.

## Recording a live URL

1. Use an authorized browser tool. Use independent Playwright when permitted; do not reuse a personal browser profile. Existing authorization carries forward.
2. Locate the real preview and state, observe autoplay, then reset manually. Wait for fonts. Confirm the state visually: hidden text in the DOM does not prove that state appeared.
3. For acceptance evidence, record the complete action chain continuously: entrance, loops, phase handoffs, exit/completion, and retrigger. Cover at least one full cycle of each looping track. Exercise reversal, cancellation, and changing targets where supported. Capture static components by state.
4. Save action request and return times, then identify actual rendered changes separately. Use the correct crop coordinate system. Keep the complete component, popups, and light effects visible at both ends; add margins near viewport edges.
5. With screenshot-only APIs, preserve capture times, call the result a screenshot sequence, and report its actual sampling rate. If browser interaction is unavailable, implement visible structure and leave dynamic verification pending.

## Working versus acceptance capture

Use two capture modes deliberately. A **working capture** answers one pending implementation question: the current default state, a hovered control, a popup anchor, or a short frame strip around the transition being fitted. Do not repeat the complete lifecycle after every tweak, decode parallel videos while recording, or regenerate settled evidence.

An **acceptance capture** establishes delivery scope. Match theme, viewport/device scale, content, component size, selection/focus history, scroll position, and action chain; include reference and reconstruction under those same conditions. Use it before delivery, after changes whose effects are unclear, and whenever the final claim covers motion or lifecycle. Do not promote a working capture to an acceptance claim.

Capture the properties users feel most precisely. For controls, keep press/hover/focus/loading/disabled states and repeat-trigger behavior visible. For overlays, keep the trigger, anchor edge, popup, shadow, portal stacking, page scroll, and both before/after positions in frame. For motion, preserve a quiet period before the first visible change so onset is measurable; do not trim the first frame to the click timestamp.

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
| Layout | Size, position, padding/inset, gaps, optical alignment, clipping, stationary anchors, easing/overshoot, content/container sequencing, popups, and exiting nodes. |

Attach frames/times or rendered measurements to each observed track. Measure subtle transitions by property rather than assigning one duration or spring to everything.

When fitting padding and alignment, record stationary edges as well as distances. The same 16px gap can come from different padding, justification, or grid combinations and produce different wrapping, overflow, hover expansion, and popup placement. Check text baseline/cap alignment, icon visual center versus icon file bounds, number tabularity, box-sizing, and whether the reference reserves space for absent decorations. For buttons and inputs, measure label inset, icon-label gap, minimum and target height, native control chrome, focus-ring offset, and press/disabled geometry.

When fitting motion, describe curves by trajectory rather than only by a named easing. On short UI transitions, capture transform origin/direction, onset, mid-travel, overshoot/undershoot, settling, and exit separately. A cubic-bezier name, spring coefficient, or duration does not transfer between engines; rendered samples over the same distance and content do. Distinguish a single moving property from coupled tracks: a button may scale while its label stays sharp, a panel may expand while text remains constant-size, and a popup may translate while its mask independently fades. Record which properties repeat, reverse, and interrupt cleanly.

For popups and overlays, record the anchor relationship before styling: which edge or point the layer tracks, fixed versus absolute positioning, portal/stacking context, clipping, viewport collision, page scroll and scroll-lock behavior, and where focus goes on open/close. Then capture entrance and exit separately, including arrow/caret motion, shadow growth, scrim/background dimming, content delay, and whether trigger geometry changes while the overlay is open.

## Insufficient sampling

Low native frame rates cannot establish short-transition peaks or curves. Recapture the relevant window or measure rendered property trajectories before choosing parameters. Nominal FPS does not guarantee continuously updated frames.

If video skips while direct observation is continuous, separate dense measurement from recording, pause unrelated decoding, prevent hot reloads, and recapture the affected window. Do not interleave element screenshots that scroll or resize the page during recording; extract them afterward. Preserve the target's real speed and business timing.

For parallel Vite previews, use separate cache directories and resolve a single React instance per preview. Shared dependency prebundling can break the main page or contaminate captures. Isolated preview servers should still import the actual deliverable source.
