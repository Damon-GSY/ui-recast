---
name: ui-recast
description: Rebuild UI components from screenshots, videos, or live URLs into editable, runnable source for web or native platforms. Use for reference-driven reconstruction with full interaction capture and comparison of colors, icons, light effects, and subtle transitions across light and dark themes.
---

# UI Recast

Rebuild UI from visual evidence. Deliver editable components, interactive examples, and reference comparisons. This workflow is self-contained; library documentation helps select mechanisms, while the observed target determines the result.

## 1. Define the target

Identify the component region, variants, theme, viewport or window size, target platform, language, UI framework, and deployment target. Inspect the existing project and honor its stack. Infer the output from the user request and workspace; if the platform is still unknown and would change the deliverable, clarify it before implementation. The reference platform does not determine the output platform: a web reference can be rebuilt as a native SwiftUI component. Record cross-platform behavior choices explicitly.

When the reference exposes light and dark themes, inspect both unless the user explicitly limits the scope. Record theme coverage alongside the component list and honor explicit exclusions. Completing one component or variant does not complete the others.

Separate user-requested product adaptations from visual defects. Unrequested jumps, stretched content, or missing animation tracks require fixes rather than an “adaptation” label.

A screenshot proves one visible state; a video proves only the recorded sequence. When a URL is interactive, capture the missing behavior first. With screenshot-only input, implement visible states and identify inferred interactions. For public source reuse, preserve provenance and licensing. For a reconstruction without source access, follow the [capture boundaries](references/input-evidence.md#sources-and-boundaries).

## 2. Capture the complete interaction

Use [input and capture](references/input-evidence.md) to find the real preview and establish a repeatable initial state. Record the target's actual lifecycle continuously: before triggering, entrance, full loops, phase changes, completion or exit, and another trigger. Include reverse actions and cancellation where supported; let the behavior determine recording length.

Capture each in-scope theme against its real canvas; distinguish a dark component from a dark page using the [theme capture guidance](references/input-evidence.md#light-and-dark-theme-capture). Review the whole sequence before inspecting real intermediate frames and relevant close-ups. Write a short specification for four tracks: icons, light effects, text, and layout. Record triggers, properties, timing, curves, and interruption behavior. Distinguish visual observations, rendered measurements, and implementation hypotheses. Capture missing short transitions before tuning; label unconfirmed parameters as fitted.

## 3. Implement from the evidence

Extract the color roles first: canvas, surfaces, text, borders, accents, and status colors. Match static geometry, typography, icon assets, and layering before connecting state and motion. Palette changes need user direction or reference evidence; a self-chosen brand palette is not a default adaptation.

Use the target framework's controls, state ownership, layout, accessibility, and animation mechanisms. Select web tools such as CSS/WAAPI, Motion or GSAP only for compatible web stacks; use native view and animation APIs for SwiftUI, UIKit or AppKit. Consult the [platform and mechanism index](references/effects-catalog.md) as needed. Reconstruct the observed behavior in the target framework rather than translating JSX or CSS literally; a native request calls for native source, not an unrequested web wrapper. Fit motion trajectories rather than assuming identical spring parameters across engines.

Keep business data and state with the caller using the target framework's bindings, callbacks or equivalent interfaces; place simulated responses in examples. Preserve keyboard navigation, focus, disabled/error states, and reduced motion. Interrupt animations from the current rendered value. Give each animated property one owner. Keep reusable views/components, styling, and assets independent of the example host.

## 4. Compare actual output

Record the reconstruction with the same theme, dimensions, content, and action chain. Follow [comparison and delivery](references/verification-delivery.md): watch at normal speed for rhythm, then inspect slow playback and real frames for icon, light, and transition details. Align phases by rendered changes. Fix concrete omissions and recheck affected sequences; a passing build or matching endpoint does not establish motion fidelity.

For pop, expansion, and collapse, compare onset, mid-travel, overshoot, and settling. Inspect the shell and inner text/icons separately. Save the baseline before edits and verify continuity through actual output, beyond checking whether a control opens and closes. Apply the [dark-mode comparison](references/verification-delivery.md#dark-mode-and-theme-changes) to each in-scope theme and supported theme changes; report static checks and complete lifecycle coverage separately.

## 5. Deliver and coordinate

Deliver source, a runnable entry point in the selected stack, recordings or frames, verified platform/theme scope, and remaining differences. Build and exercise the actual browser app, simulator target or native app; a preview alone does not prove runtime behavior. When source distribution is requested, provide actual file bodies and dependencies, then install, build, and render them in an independent consumer. Claim 1:1 only when the stated scope has no known differences. A working trial and full visual fidelity are different results.

For batches, assign disjoint source and evidence paths. Capture and implementation may run in parallel; centralize shared entry points, dependencies, and distribution. Record each item's status and remaining differences. Reuse established evidence and checks unless edits or new failures warrant retesting. Isolate recording from other video decoding, dense measurements, and hot reloads.
