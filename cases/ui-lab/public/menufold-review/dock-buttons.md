# Dock / StatefulButton / CopyButton motion review — 2026-10-30

Source freeze: the six assigned files in `src/components/{fixed-dock,stateful-button,copy-button}.{tsx,css}` are ready for parent integration. No shared player, registry, public bundle, dependency or skill files changed. Preview: `http://127.0.0.1:4215/study/<slug>`; HMR and file watching are off, so restart the preview after edits.

## Findings and fixes

- **CopyButton:** baseline used sequential 140ms exits/entries and ±25° rotation, leaving an empty icon slot. The actual Animate UI rendered crossover has simultaneous old/new icons, scale 0.5↔1, blur 2↔0px, opacity and no rotation. Replaced it with a shared grid cell and 150ms simultaneous blur/scale/opacity crossover. Changing `value` used to remount the entire button, skipping reverse motion and losing focus; it now resets the operation in place, invalidates stale async completions, and animates the icon back. Clipboard fulfillment still owns success.
- **StatefulButton:** baseline had a dim full-circle + quarter arc spinning every 850ms, a plain check, and vertical slides. The source has an open arc rotating about every 300ms, followed by a radial shrink and circled-check expansion. Matched those tracks with 200ms radial exit and 200ms completion entry, preserving caller-owned outcomes. Source shrink/pop is monotonic; no unsupported overshoot was added. Final frame review also found that simultaneous dark→pale background and white→blue text interpolation made the label nearly disappear mid-transition; state palette now switches together while only the icon animates. Source hover ring is also restored as a 200ms static 2px warm-white offset plus 2px ink/blue outer ring, with intermediate shadow samples, exit, pending, disabled and reduced-motion checks.
- **FixedDock:** hover surface disappeared immediately while tooltip was still exiting; desktop first/last labels were permanently aligned inward rather than centered. Added 150ms hover fade-out, symmetric 180ms/6px tooltip entry/exit, 8px gap, centered desktop labels and retained narrow edge alignment. A rendered follow-up caught the selected blue surface migrating with the shared hover layer. Selection color now belongs permanently to the button, and the moving hover layer stays neutral. All icon slots remain 44×44px; no magnification was introduced.

## Evidence and verification

Each slug has:

- `motion-review/before/`: exact pre-edit component source, Study source, previous analysis and complete previous replica evidence.
- Original canonical reference videos reused without duplicating them. `motion-review/reference*/frames/` and complete sheets decode every native 25fps frame, including source loop/exit/repeat. Rendered DOM-only supplements for Copy and Stateful are in `reference-rendered-motion.json`; no source code, bundle contents or React internals were read.
- Corrected `replica/lifecycle.webm`, `source-full.webm`, events, PNG states, native keyframes and `transition-sheet.png`. Full corrected decoded sequence is in `motion-review/after/`. `phase-comparison.png` aligns actual rendered transitions from reference, baseline and corrected footage.
- `motion-review/verification/results.json`: 13 Dock, 13 Stateful and 12 Copy behavior checks (38 total). `rendered-motion.json`: 5 Dock, 6 Stateful and 6 Copy focused motion checks (17 total). These include rapid reversal, fixed geometry, stable selected color, tooltip enter/exit, matching spinner phase, overlapping Copy icons, retained focus, keyboard activation, real clipboard readback, rejected/held promises, obsolete resolution, and reduced motion with preference set before mount. TypeScript noEmit passed. The final Stateful palette fix is verified in `palette-verification.json` and final rendered frames. The requested hover-ring increment passed 7 focused checks in `ring-verification.json`; it was inspected in `ring-hover.png` and included in the refreshed Stateful canonical video.

Recordings ran one browser context at a time on isolated 4215, at normal animation speed, without simultaneous dense sampling or screenshots. Copy's slow loader segment explicitly holds/release the Clipboard promise in the test harness; production has no timer or invented success. Font synthesis/antialiasing matches the root gallery. Requested action times and native media times remain separate.

## Concrete remaining differences

These are **not** a blanket 1:1 pass. FixedDock retains fixed geometry, local icons, warm pale labels and its local moving hover surface; upstream magnification/mobile menu remains absent. Stateful retains its dark/pale palette, changing Chinese labels and reserved icon slot instead of the green expanding capsule. Its restored ring follows the local palette. The source's coupled SVG width/scale contraction differs from our fixed slot. Copy retains a labeled text button and persistent copied state; source is square and resets after its demo timeout. All three retain the existing local press feedback. No new traveling glow was found in the reviewed reference cycles.

## Skill lessons for parent

1. Do not blanket-remove `mode="wait"`: inspect actual source choreography. Copy overlaps; Stateful genuinely shrinks out before the completion icon expands. A transition's empty interval can be either evidence or a defect.
2. Inspect animation loops independently of icon replacement. The same general spinner silhouette hid a 300ms versus 850ms mismatch.
3. Persistent selection and moving hover must be separate color owners; check selected-item continuity during rapid hover reversal.
4. Preserve the interactive DOM node across content resets when the desired reverse transition/focus must continue; invalidate old async work separately.
5. Inspect foreground/background interpolation together: individually smooth color tweens can erase text at their crossing point.
6. Recording and dense rAF sampling must stay separate. Tag each sampling run so a queued callback from the previous run cannot contaminate a later selector's measurements.
