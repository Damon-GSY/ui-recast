# 3D and shader-driven recast

Use this reference when the target presents spatial motion: WebGL/WebGPU, Three.js, Babylon, Spline, CSS 3D, native SceneKit/Metal, shader/raymarch effects, or a 2D interface whose objects move with depth, parallax, lighting, or perspective.

## Decompose the moving systems

Screen motion alone does not identify the mechanism. Before fitting parameters, separate the systems that can produce the same pixels:

- **Camera:** perspective or orthographic projection, FOV/frustum, aspect, near/far, position, orientation, look-at/target, viewport, and camera path.
- **Scene graph:** objects, groups, pivots, parent-child relationships, local versus world transforms, constraints, contact, collision, occlusion, and stationary anchors.
- **Objects:** position, quaternion rotation, scale, deformation, morph/skeletal pose, visibility, and material changes.
- **Input controller:** pointer mapping, raycast targets, orbit/drag/wheel behavior, damping/inertia, scroll progress, hover selection, and which object owns the gesture.
- **Material/light/render system:** lights, environment, shadows, reflections, transmission, normal/displacement maps, tone mapping, post-processing, transparency sorting, and antialiasing.
- **UI compositing:** transparent canvas, device pixel ratio, resize behavior, DOM transform, page scroll, and DOM overlays projected onto 3D positions.

With video-only evidence, the split between camera motion and object motion is a hypothesis. Label it as fitted unless interaction, visible controls, public API documentation, or an authorized source exposes the actual decomposition.

## Relationships are primary

Reconstruct relationships before individual transform values. A child rotating with its parent, an object pivoting around a distant origin, a highlight traveling across a fixed surface, and a camera dollying past stationary objects can look similar in one viewport but diverge on interaction.

Record pivots and stationary anchors, not only object centers. Preserve parent-child grouping, transform order, local/world space, contact and ground relationships, shadows/reflections, silhouette intersections, and near/far occlusion. Incorrect pivot or hierarchy often causes a plausible default state but wrong hover, drag, reversal, resize, or camera behavior.

Give each transform channel one owner. Business state should not fight an animation controller; camera controls should not drive object-local motion; pointer parallax should not overwrite an entrance animation. Interrupt from the currently rendered transform.

## State machine and time model

Draw one lifecycle map before implementing motion. Name the stable states and the events that connect them: entrance, hover, press, drag start/update/release, cancel, pointer leave/reenter, re-trigger, exit, reset, and loop boundary. Record which state survives a reversal or interruption, whether re-entry replays from the beginning, resumes the rendered pose, or toggles a committed result, and how failed/edge input returns to a safe state.

Identify the time source and coupling. Motion may run on wall-clock time, scroll progress, pointer position, animation-frame delta, user gesture velocity, or an external state stream. Record whether it is frame-rate independent, how it behaves after tab suspension or context loss, and how the reference catches up after a long pause. For multiple tracks, distinguish phase-locked tracks, fixed offset/stagger, free-running loops, and one-shot sequences.

Do not make a simulation pretend to be a tween, or a tween pretend to be simulation. If the evidence shows inertia, damping, collision, contact, constraint, mass response, or continuous disturbance, model those relationships; if it shows a repeatable keyframed path, use deterministic playback. Verify repeated triggers, reverse, rapid input, tab suspension/resume, and end-of-range behavior.

## Fit spatial motion from trajectories

Compare trajectories in both screen space and the reconstructed scene's world space. For representative points—object center, edge/silhouette, contact point, shadow, and highlight—record onset, direction, path curvature, velocity, overshoot, settling, loop seam, and phase relative to other objects. Preserve stagger and secondary motion; do not collapse a cascading relationship into simultaneous keyframes.

Separate rotation, translation, scale, deformation, texture/material motion, and camera motion. Check whether apparent scale is an object growing or the camera moving, whether a highlight moves because the light or object rotates, and whether depth is real mesh geometry, a normal-map illusion, parallax layers, or a 2D shader. Use quaternion rotation for 3D reconstruction when it preserves the observed path; compare rendered trajectories rather than exporting Euler angles or spring coefficients blindly.

For pointer- or scroll-driven motion, record the input coordinate system, element bounds, device pixel ratio, normalization, dead zones, clamping, inversion, damping, and return behavior. Repeated, reversed, fast, and out-of-range input often exposes a fitted trajectory that a single playthrough does not.

## Rendering and materials

Lighting and renderer settings can dominate geometry. Record light direction/color/intensity, environment reflections, shadow radius/contact, emissive and bloom layers, roughness/metalness/clearcoat, transmission/refraction, opacity/depth sorting, texture color space, exposure, tone mapping, background alpha, and antialiasing. A gray material mismatch may be lighting rather than albedo.

Match the reference's actual presentation mechanism. A raymarched/fluid/SDF effect or parallax plane should not become a heavy mesh scene merely to call itself 3D; conversely, a real mesh with interactive orbit should not be replaced by a prerendered video if interaction is in scope. Preserve provenance and licensing for models and textures.

## Decompose shaders and rendering passes

For shader-driven effects, determine which stage owns each visible change. The same look can come from vertex displacement, fragment material color, UV distortion, noise/time fields, lighting, depth, or screen-space post-processing. Separate geometry, UV/texture motion, material parameters, procedural fields, lighting response, and post-effects before fitting a shader. Record precision hints, units, wrap/repeat behavior, seeding of procedural noise, and whether time is normalized or seconds.

Diagnostic working captures may temporarily expose geometry (wireframe), normals, depth, UVs, raw unlit color, or individual effects. These are debugging aids, not reference-equivalent acceptance evidence. For the final output, restore the full render path, tone mapping, and UI compositing, then verify the complete visual.

## UI integration

Keep the canvas and DOM aligned: viewport size, device pixel ratio, resize strategy, transparent background, page scroll, safe-area insets, pointer-event ownership, focus visibility, loading/placeholder state, WebGL context loss or fallback, reduced motion, and low-power behavior. If a 3D position drives a DOM label, popup, or connector, verify the projection at edges and during camera motion rather than only at the default view.

## Verification

Capture reference and reconstruction with the same viewport, device scale, aspect, camera/controller state, content, input chain, and time base. Watch normal speed for rhythm, then inspect slow playback and real intermediate frames. Compare object trajectories, contact/shadow continuity, occlusion, silhouette edges, highlights, transparency ordering, and camera/object separation.

Use controlled working captures to isolate one system: hold the camera still to inspect object motion, hold objects still to inspect camera motion, or temporarily simplify lighting while fitting geometry. These are diagnostic captures, not acceptance evidence. Final acceptance must put the systems back together and repeat the interaction chain.

Exercise the lifecycle rather than one pretty pass: repeat trigger, reverse, release/reenter, interruption at several phases, rapid input, out-of-range input, scroll boundary, viewport/aspect change, device-pixel-ratio change, context loss/fallback where supported, and reduced motion. Record whether state and rendered pose remain consistent.

Check runtime feasibility against the reference's intended use: target frame rate on the actual target device, expensive post-processing, texture/model footprint, draw calls or shader complexity when available, and the chosen degradation path. Report measured results only from a relevant real renderer/device; do not extrapolate desktop performance to a low-power target.

Pixel differences can locate geometry, material, and layering errors but cannot score 3D fidelity. Report the evidence for the camera/object decomposition, fitted trajectory parameters, asset provenance, fallback behavior, and any remaining differences in depth, lighting, interaction, or performance.
