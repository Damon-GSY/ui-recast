# Verification

Primary scope: light theme, 340px width, the complete three-question lifecycle, completion, reset and interruptions. Source remained frozen after `SOURCE-FROZEN.md`; all final local lifecycle footage is from the resulting production build. The earlier stale development-server capture is explicitly named `lifecycle-baseline-stale-dev.webm` and is not the final result.

## Results

- `npm run build`: TypeScript and production bundle pass. `evidence/build.log` retains the output. Vite reports dependency-level use-client directive warnings; this is a client-only Vite entry.
- Parent independently reported a copied frozen project passing fresh `npm ci` and `npm run build`. This is parent-reported installation evidence; this trial does not claim to have conducted the parent's review. Parent also reported seven production-browser checks passing (three decisions/caller progression, completion/reset, keyboard/focus, 390px overflow and reduced-motion close), no page errors/local 404s, and a byte-for-byte source match to the frozen files.
- `node scripts/lifecycle.cjs reconstruction`: all 9 actual browser lifecycle assertions pass, zero page errors. The same 9 checks pass on the reference. See each recording's `actions.json` and the run logs.
- The lifecycle includes Q1 expansion held through the dust burst, Escape consuming Q1, Q2 retrigger and positive answer, Q3 and completion, completion reopening and Start over, Escape during expansion, an early ignored center click, outside-click retention, successful reopening 240ms into collapse, another completion and reset. Recording is continuous across every action.
- `node scripts/accessibility.cjs`: six checks pass: keyboard opening/primary focus, immediate reduced-motion geometry, dust removal under reduced motion, keyboard answer and focus return, inert closed content, Escape progression/focus restoration. It also confirms the final SVG's white rendered stroke.
- Actual screenshot pairs were viewed: idle, Q1, Q2, Q3, completion, 375x812 narrow view, and representative dark/400px/background-grain/dust-off output. Default card geometry is identical: Q1 340x242 at (310,239), Q2/Q3 340x222 at (310,249), completion 340x202 at (310,259), all at 960x720. Narrow Q1 is 340x242 at (17.5,285). Wide output is 400x222; the reference gallery wrapper contributes a separate 1px border offset.
- Both full recordings were played at normal speed in Chrome, then their first expansion was replayed at .25x. The native decoded media-time samples and shell silhouettes are retained in `playback-review.json`. The native videos are 25fps; callback counts are observations, not a claimed capture FPS.
- Actual decoded intermediate expansion/collapse strips were viewed alongside the whole lifecycle and static sheets. Onset alignment uses the first changed rendered shell silhouette; no time stretching or interpolated frames were used. Requested seeks and selected native requestVideoFrameCallback media times are retained separately in the strip/contact JSON files. Final PNG extraction uses FFmpeg at those native sample times; extraction timestamps are not an independent second measurement.

## Artifacts to inspect

- `evidence/reference/lifecycle.webm` and `evidence/reconstruction/lifecycle.webm`: final full recordings (different startup/navigation delays).
- `evidence/reference/lifecycle-contact.png` and `evidence/reconstruction/lifecycle-contact.png`: whole-cycle native-frame sheets.
- `evidence/comparison/open-strip.png` and `close-strip.png`: first visible change, early travel, text handoff, settling, and overshoot windows. Reference is above local.
- `evidence/comparison/states-1.png` and `states-2.png`: reference left, reconstruction right; identical scale.
- `comparison.html`: two independent full players, adjustable onset offsets, synchronized relative playback at 1x/.25x, native-sample seeking and embedded sheets. Serve through `npm run dev` to access evidence files.

## Remaining differences / limitations

1. Shell geometry and text timing are fitted. Intermediate native frames show a modest travel/settling difference, around one 40ms video sample in parts of expansion/collapse; blur and content reveal do not match every reference intermediate frame. Static geometry matching does not establish identical spring curves.
2. Dust particle positions, directions and exact timing are randomized independently. The finite burst, approximate density, grayscale color and outward movement are reproduced, not particle-for-particle identity.
3. Ring, completion fill/check and focus delays are fitted. The three progress states and completion are present, but every short subelement transition was not independently calibrated at sub-frame resolution.
4. Local startup presents the measured idle pill immediately. The reference's page-load narrow/zero-width reveal and navigation/hydration delay are not replicated. The full question/answer/restart lifecycle is recorded and verified after stable idle.
5. Supplemental modes are representative checks, not exhaustive validation of every slider value. The study controls' layout is deliberately a standalone example. The reference's marketing page/footer and Pro purchase UI are evidence, not reconstruction targets.
6. The dark comparison can show different focus-visible outlines because its action history includes keyboard dismissal on the local side and a theme-button pointer action on the reference side. The primary default light comparison does not depend on that supplemental focus state.

This is a runnable reconstruction with documented fitting deltas, not a claim of 1:1 motion fidelity.
