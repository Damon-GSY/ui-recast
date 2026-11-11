---
name: ui-recast
description: Rebuild UI components from screenshots, videos, or live URLs into editable, runnable source for web or native platforms. Use for reference-driven reconstruction with full interaction capture and comparison of colors, icons, light effects, and subtle transitions across light and dark themes.
---

# UI Recast

Rebuild UI from visual evidence. Deliver editable components, interactive examples, and reference comparisons. This workflow is self-contained; library documentation helps select mechanisms, while the observed target determines the result.

## 1. Define the target

Identify the component region, variants, theme, viewport or window size, target platform, language, UI framework, and deployment target. Inspect the existing project and honor its stack. Infer the output from the user request and workspace; if the platform is still unknown and would change the deliverable, clarify it before implementation. The reference platform does not determine the output platform: a web reference can be rebuilt as a native SwiftUI component. Record cross-platform behavior choices explicitly.

Select the smallest scope supported by the evidence. The scope may be expanded only when the user requests it or the reference exposes the additional behavior:

| Input and request | Minimum evidence and claim |
| --- | --- |
| One screenshot | Reconstruct visible structure, palette, typography, spacing, and assets. Mark interactions, curves, and timing as inferred or unverified. |
| Recorded clip | Preserve the recorded sequence and timing. Do not extrapolate hidden states, reverse actions, or behavior outside the clip. |
| Static live reference | Capture every explicitly requested state at the real size and theme; inspect rendered geometry and colors rather than the DOM alone. |
| Interactive live reference | Record the complete requested action chain, supported interruption/reversal, and each in-scope theme before claiming behavioral fidelity. |
| Source distribution | In addition to visual/runtime checks, install the delivered files in an independent consumer and compare them with current source. |
| Explicit batch | Define per-item scope, evidence paths, status, and remaining differences; representative completion does not complete the batch. |

When the reference exposes light and dark themes, inspect both unless the user explicitly limits the scope. Record theme coverage alongside the component list and honor explicit exclusions. Completing one component or variant does not complete the others.

Separate user-requested product adaptations from visual defects. Unrequested jumps, stretched content, or missing animation tracks require fixes rather than an “adaptation” label.

A screenshot proves one visible state; a video proves only the recorded sequence. When a URL is interactive, capture the missing behavior first. With screenshot-only input, implement visible states and identify inferred interactions. For public source reuse, preserve provenance and licensing. For a reconstruction without source access, follow the [capture boundaries](references/input-evidence.md#sources-and-boundaries).

## 2. Capture the required evidence

Use [input and capture](references/input-evidence.md) to find the real preview and establish a repeatable initial state. When interaction is in scope, record the actual lifecycle continuously: before triggering, entrance, full loops, phase changes, completion or exit, and another trigger. Include reverse actions and cancellation where supported; let the behavior determine recording length.

Capture each in-scope theme against its real canvas; distinguish a dark component from a dark page using the [theme capture guidance](references/input-evidence.md#light-and-dark-theme-capture). Review the whole sequence before inspecting real intermediate frames and relevant close-ups. Write a short specification for four tracks: icons, light effects, text, and layout. Record triggers, properties, timing, curves, and interruption behavior. Distinguish visual observations, rendered measurements, and implementation hypotheses. Capture missing short transitions before tuning; label unconfirmed parameters as fitted.

For spatial/3D or shader-driven references, follow [3D recast](references/3d-recast.md): separate camera, scene-graph, object, material, input-controller, shader/render-pass, and UI-compositing systems before fitting motion. Object relationships, pivots, lifecycle states, and time/input coupling are as important as transform values.

Separate working capture from acceptance capture. During implementation, use the cheapest current output that answers the pending question: one state screenshot, a short close-up, or a few frames around the changed window. Reserve complete matched-theme, matched-size, matched-content recordings for final acceptance. A working capture never becomes the evidence for a 1:1 or complete-lifecycle claim.

Before implementation, write a short reference contract: component region and variants; observed states and action chain; themes and viewport; output platform/framework; caller-owned data and callbacks; requested adaptations; known unknowns; and the exact acceptance wording. Update it when scope changes rather than silently expanding the claim.

## 3. Implement from the evidence

Extract the color roles first: canvas, surfaces, text, borders, accents, and status colors. Match static geometry, typography, icon assets, and layering before connecting state and motion. Palette changes need user direction or reference evidence; a self-chosen brand palette is not a default adaptation.

Use the target framework's controls, state ownership, layout, accessibility, and animation mechanisms. Select web tools such as CSS/WAAPI, Motion or GSAP only for compatible web stacks; use native view and animation APIs for SwiftUI, UIKit or AppKit. Consult the [platform and mechanism index](references/effects-catalog.md) as needed. Reconstruct the observed behavior in the target framework rather than translating JSX or CSS literally; a native request calls for native source, not an unrequested web wrapper. Fit motion trajectories rather than assuming identical spring parameters across engines.

Choose the mechanism from rendered evidence, not from the component family. A React/shadcn source distribution does not imply CSS transitions; inspect rendered transitions, animation frames, canvas/video state, and derived properties while the reference is moving. A two-state visual change may fit CSS; continuous spring/inertia, pointer-driven values, interruptible drag, derived opacity, canvas, SVG, or shader tracks generally need frame-driven state or the project's animation/runtime mechanism. Do not collapse a frame-driven system into declarative CSS timing.

Measure spacing as relationships, not only as four numbers: content inset, gap, control height, border/radius contribution, optical icon alignment, text cap and baseline positions, and stationary anchors. Record whether sizes include borders or scrollbars in both reference and output coordinate systems. Reproduce the reference's alignment system and intrinsic content sizing before adding responsive adaptations.

For controls and overlays, preserve trigger hit area, cursor/pointer semantics, press feedback, focus ring origin, disabled/loading/error transitions, popup anchor and collision behavior, clipping/portal stacking, Escape/outside-close behavior, and keyboard focus return. Match the observed layering and anchor geometry; do not hide popup differences by switching to a centered modal.

Fit each visible motion track separately: onset, velocity, overshoot, settling, exit, delay, stagger, loop seam, and interruption from the current rendered value. Distinguish transform motion from width/height/layout changes, and preserve text and stroke scaling when the reference keeps them stable. Convert spring/curve values between engines only by comparing rendered trajectories, never by copying coefficients.

Keep business data and state with the caller using the target framework's bindings, callbacks or equivalent interfaces; place simulated responses in examples. Preserve keyboard navigation, focus, disabled/error states, and reduced motion. Interrupt animations from the current rendered value. Give each animated property one owner. Keep reusable views/components, styling, and assets independent of the example host.

## 4. Compare actual output

Record the reconstruction with the same theme, dimensions, content, and action chain. Follow [comparison and delivery](references/verification-delivery.md): watch at normal speed for rhythm, then inspect slow playback and real frames for icon, light, and transition details. Align phases by rendered changes. Fix concrete omissions and recheck affected sequences; a passing build or matching endpoint does not establish motion fidelity.

For pop, expansion, and collapse, compare onset, mid-travel, overshoot, and settling. Inspect the shell and inner text/icons separately. Save the baseline before edits and verify continuity through actual output, beyond checking whether a control opens and closes. Apply the [dark-mode comparison](references/verification-delivery.md#dark-mode-and-theme-changes) to each in-scope theme and supported theme changes; report static checks and complete lifecycle coverage separately.

## 5. Deliver and coordinate

Deliver source, a runnable entry point in the selected stack, recordings or frames, verified platform/theme scope, and remaining differences. Build and exercise the actual browser app, simulator target or native app; a preview alone does not prove runtime behavior. When source distribution is requested, provide actual file bodies and dependencies, then install, build, and render them in an independent consumer. Claim 1:1 only when the stated scope has no known differences. A working trial and full visual fidelity are different results.

For batches, assign disjoint source and evidence paths. Capture and implementation may run in parallel; centralize shared entry points, dependencies, and distribution. Record each item's status and remaining differences. Reuse established evidence and checks unless edits or new failures warrant retesting. Isolate recording from other video decoding, dense measurements, and hot reloads.
