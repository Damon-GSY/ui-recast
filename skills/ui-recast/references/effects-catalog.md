# Motion mechanism index

Start with the observed behavior. These are implementation references, not target parameters or mandatory dependencies. Derive color, geometry, amplitude, and rhythm from recordings and measurements. Read only relevant official documentation.

For WebGL/WebGPU, Three.js, Babylon, Spline, CSS 3D, shader/raymarch, or other spatial references, first read [3D recast](3d-recast.md). Separate camera motion, scene-graph relationships, object transforms, shader/render passes, input controllers, lifecycle/time coupling, and UI compositing before selecting a mechanism.

## Select mechanisms for the output platform

| Target | Mechanisms and constraints | Official references |
| --- | --- | --- |
| Web | DOM controls plus CSS/WAAPI, the project's animation/spring runtime, requestAnimationFrame, Canvas/SVG, or video/media APIs. CSS fits declarative two-state timing; frame-driven controllers suit interruptible springs, gesture velocity, continuous derived properties, and changing canvas/media content | [Web Animations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), [Motion](https://motion.dev/docs/react) |
| SwiftUI | Native views, explicit state/bindings, value-driven animations and view transitions; separate morphing shells from unscaled text/icons | [SwiftUI animations](https://developer.apple.com/documentation/swiftui/animations) |
| UIKit | Native views, layout and interaction; property animators for interruptible view-property changes, with layer animation where the effect requires it | [UIViewPropertyAnimator](https://developer.apple.com/documentation/uikit/uiviewpropertyanimator) |
| AppKit | Native views/windows, AppKit animation contexts and layer-backed effects where appropriate; preserve macOS focus/window behavior | [NSAnimationContext](https://developer.apple.com/documentation/appkit/nsanimationcontext) |

Respect the project's deployment target and available SDK APIs. SF Symbols or another native icon library are candidates, not automatic geometric matches for the reference. Check assets, rendering modes, stroke weight, font metrics, logical units and clipping in the target renderer. Spring coefficients and blur/shadow values must be fitted to rendered output rather than copied numerically between engines. For other stacks, use their existing native equivalents instead of introducing a web dependency.

## Web examples by observed behavior

| Observed behavior | Mechanism to consider | References |
| --- | --- | --- |
| Moving selection or panel switch | Measure position/size, retain continuous identity, unmount after exit | [Animate UI Tabs](https://animate-ui.com/docs/primitives/radix-ui/tabs), [Motion layout](https://motion.dev/docs/react-layout-animations) |
| Collapse, press, or switch morph | Drive content height and control state separately; retarget from current values | [Accordion](https://animate-ui.com/docs/primitives/radix-ui/accordion), [Switch](https://animate-ui.com/docs/primitives/radix-ui/switch) |
| Changing numbers | Distinguish clipped digit rolling from scalar interpolation; preserve format/alignment | [Sliding Number](https://animate-ui.com/docs/primitives/animate-ui/sliding-number), [Number Ticker](https://magicui.design/docs/components/number-ticker) |
| Staggered icon/text entry | Separate subelement opacity, blur, transform, and delay | [Split Text](https://reactbits.dev/text-animations/split-text), [Text Generate](https://ui.aceternity.com/components/text-generate-effect) |
| Border light or node-to-node pulse | Mask bounds; move a bright segment and tail along a CSS path or SVG gradient | [Border Beam](https://magicui.design/docs/components/border-beam), [Animated Beam](https://magicui.design/docs/components/animated-beam) |
| Continuous marquee | Join repeated tracks seamlessly; control direction, period, and pause independently | [Marquee](https://magicui.design/docs/components/marquee) |
| Pointer attraction or tilt | Map pointer coordinates and spring return; keep the outer hit area stable | [Magnet](https://reactbits.dev/animations/magnet), [3D Card](https://ui.aceternity.com/components/3d-card-effect) |
| Scroll reveal or reading trail | Distinguish timed playback after entry from scroll-progress control; bind the right scroll container | [Scroll Reveal](https://reactbits.dev/text-animations/scroll-reveal), [Tracing Beam](https://ui.aceternity.com/components/tracing-beam) |
| Continuous pixel light field | Establish whether Canvas/WebGL is needed, then drive field parameters with time/pointer | [Aurora](https://reactbits.dev/backgrounds/aurora) |

For web targets, CSS/WAAPI often suffices for finite keyframes and two-state changes. Consider [Motion](https://motion.dev/docs/react) for React state, layout, gestures, and springs, or [GSAP timelines](https://gsap.com/docs/v3/GSAP/Timeline/) for complex sequences. Preserve DOM semantics for ordinary controls; use SVG for path-based light effects. Verify current documentation and dependencies before use. A similar example does not prove the target uses the same implementation.
