# Motion mechanism index

Start with the observed behavior. These are implementation references, not target parameters or mandatory dependencies. Derive color, geometry, amplitude, and rhythm from recordings and measurements. Read only relevant official documentation.

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

CSS/WAAPI often suffices for finite keyframes and two-state changes. Consider [Motion](https://motion.dev/docs/react) for React state, layout, gestures, and springs, or [GSAP timelines](https://gsap.com/docs/v3/GSAP/Timeline/) for complex sequences. Preserve DOM semantics for ordinary controls; use SVG for path-based light effects. Verify current documentation and dependencies before use. A similar example does not prove the target uses the same implementation.
