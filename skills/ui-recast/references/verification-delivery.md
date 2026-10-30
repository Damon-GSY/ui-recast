# Comparison and delivery

## Match the conditions

Fix theme, fonts, content, viewport, component size, scroll position, selection, and focus. Use the same scale and stationary anchors; preview wrappers must not change component layout. Preserve full recordings, with slow/frame playback and proportionate close-ups where useful. Confirm the player reads the latest media rather than an old static copy.

Align phase starts using actual rendered changes or transition/animation events. Compare intermediate states, phase gaps, and overlapping tracks on the same time scale. Action timestamps describe scheduling; phase offsets alone do not prove different curves. Follow the [sampling guidance](input-evidence.md#insufficient-sampling) when evidence is sparse.

Paired players should support independent starting positions, relative synchronization, and complete playback. Absolute-time synchronization can compare different phases. Offset alignment removes trigger skew; never stretch time to hide speed differences. Interpret stepping against the media's native samples, not as a new frame for every seek.

## Inspect actual output

- **Static structure and assets:** geometry, wrapping, icons, radii, border/shadow layers, stacking, and current state.
- **Motion:** all four tracks through the complete action chain, including tiny loaders, persistent/moving light layers, loop seams, short transitions, completion, and exit. Watch normal speed for rhythm, slow playback for real intermediate states.
- **Interaction:** values/callbacks, keyboard paths, focus return, repeated triggers, cancellation, and supported interruptions.
- **Containers:** reference-supported wrapping/scrolling at narrow widths; clipped popups/content. Label responsive behavior that has no reference comparison.

Actually view both outputs and connect concrete differences to fixes. Pixel differences can locate geometry errors; one score cannot establish motion fidelity. Preserve the pre-edit baseline. Recheck affected behavior after changes without repeatedly redoing settled checks.

## Color and compositing

Lock the real preview and theme. Record canvas, surfaces, primary/secondary text, borders, icons, accents, and observed status colors. Supplement images with rendered colors. Avoid antialiased text edges when sampling screenshots; compressed video values are approximate. Label business states absent from the reference as local choices.

Compare default, hover, selected, focus, disabled, loading, and result states where supported. Record color separately from opacity, then inspect compositing on the actual background. Preserve gradient endpoints, masks, shadow layers, and light effects rather than substituting an average color. Restoring neutral surfaces must retain a reference's green button, blue action, or black panel.

Compare standalone rendering with the host page. Gallery paragraph/link selectors, inherited colors, transparent containers, and theme rules must not override component roles. Put fixes in the reusable source. Refresh recordings and distributed copies after palette changes.

## Pop and expansion continuity

Set time zero at the first visible change. Compare onset, mid-travel, overshoot, recovery, and settling. Measure collapse separately rather than assuming reversed expansion. Track anchors, size, radius, clipping, and shadow alongside independent icon/text timing. During simultaneous foreground/background transitions, check intermediate contrast.

If the reference preserves text and stroke sizes, do not substitute nonuniform scaling of the entire panel for shared geometry. Separate the morphing shell from its content. Returning to natural dimensions must not cause an extra jump. Gaps or overlap between outgoing content, incoming content, and container changes require visual evidence. Preserve outgoing content snapshots when business state advances; let independent progress tracks keep updating so reopening does not replay completed icons.

Resume from current rendered values on reversal, pointer leave/reentry, or content changes. For shared moving backgrounds, inspect composite brightness across overlapping layers. For inserted list items, inspect existing rows yielding space. Ensure entrance stagger/delay is not accidentally reused for hover, click, or reversal. Preserve tracks without overshoot rather than applying one spring universally.

Record capture, implementation, verification, and remaining differences per component. One variant does not validate others; representative samples do not complete an explicit batch. Report builds, static checks, installation previews, and real runtime verification separately.

## Editable source

Deliver components, CSS, necessary assets, and runnable examples. For shadcn registries, follow the [official schema](https://ui.shadcn.com/docs/registry/registry-item-json): include actual file bodies, target paths, and required dependencies. Preserve relative imports and client boundaries.

Install from the actual registry URL in an independent consumer, then build and exercise key behavior. Compare delivered files with current source. Same-project copies or old installed snapshots do not substitute. Regenerate distribution after source changes. State verified scope, asset provenance, and remaining visual/behavioral differences.
