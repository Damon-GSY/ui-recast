# ReadingTabs — motion review, 2026-10-30

Source: [rendered reference](https://www.affectui.com/components/segmented-control). This review supersedes the previous motion claims; the prior analysis, exact component/Study source and replica evidence are preserved in [motion-review/before](motion-review/before/). Reference clips are reused in place, not duplicated.

## Finding and correction

A supported label-size change made the track grow before the indicator animation: the selected pill jumped from 117.41px to 187.73px on its first resized frame. Rapid reversal also chose leading/trailing timing against the previous target rather than the current rendered position.

Both animated edges now use absolute coordinates from the track left edge, expressed through two animated CSS variables. Width is their difference. Direction is chosen from the rendered indicator position. The first resized frame now remains 117px, followed by smooth two-edge interpolation; text is not scaled.

## Observed tracks

Observed reference radio/drag motions, tray and underline variants were inspected across the full clip. The local indicator retains 160ms leading/220ms trailing clean timing and stable labels/count chip. Panel rendering remains caller-owned with manual activation by default; no source panel fade exists to reconstruct.

Complete source and baseline lifecycles were decoded at normal speed. Actual decoded frames and media timestamps are in [reference frames](motion-review/reference-frames/frames.json), [baseline frames](motion-review/before-frames/frames.json), and [final frames](motion-review/replica-frames/frames.json). Sequence sheets retain actual samples across the full timeline; no inserted or interpolated frames. [Rendered phase anchors](motion-review/phase-anchors.png) and [motion plots](motion-review/motion-traces.png) are under motion-review/. The full videos remain authoritative for the intervals between sampled frames.

## Verification and evidence

- [Canonical replica lifecycle](replica/lifecycle.webm): 00:00:09.48, 1024×1100 native Chrome video, 25fps nominal, recorded on isolated port 4214 with HMR disabled and one recording context.
- [Targeted browser verification](motion-review/verification.json): 7/7 passed; rapid interruption, keyboard and reduced-motion checks are included.
- [Observed before/after motion plot](motion-review/motion-traces.svg), [before measurements](motion-review/before-measurements.json), [after measurements](motion-review/after-measurements.json). Dense measurement runs were separate from recording.
- [390px rendering](motion-review/narrow.png); no document horizontal overflow.
- TypeScript passed with --noEmit --incremental false. Visual findings come from real video/frames and live computed rendering, not that compilation check.
- Source frozen for parent integration. No root registry, public copies, dependencies, bundle or skill files changed.

## Recorded actions

Times are scheduling offsets, not actual rendered phase boundaries.

| Action | Requested s | Completed s |
| --- | ---: | ---: |
| manual focus only | 1.150 | 1.169 |
| Enter activates Annotations | 1.921 | 1.934 |
| rapid Sources | 2.685 | 2.717 |
| rapid Article | 2.808 | 2.822 |
| rapid Annotations 3 | 2.914 | 2.931 |
| preceding label resize | 3.625 | 3.628 |
| return Article | 4.379 | 4.393 |
| tray variant | 5.145 | 5.157 |
| tray Sources | 5.908 | 5.922 |
| underline variant | 6.673 | 6.683 |
| underline Article | 7.434 | 7.447 |

## Remaining differences

ReadingTabs retains tab semantics and lazy content; reference is a radiogroup with pointer dragging. The two controls have different labels and dimensions. Classic timing was not re-fit in this pass; the implementation retains its prior parameters.

Reference/local content and geometry differ; this is not a 1:1 visual-pass claim. Parent owns final shared-player integration and refreshing public/registry/bundle copies. Historical screenshots remaining under replica/ belong to the old review unless named motion-review-final.png; use the new motion-review frames for this source freeze.
