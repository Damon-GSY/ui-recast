# Integration Settings — Clean/light comparison

Reference: https://www.affectui.com/components/integration-settings, observed 2026-10-29. Public preview usable; published registry endpoint returned **401 to anonymous HEAD**. No source or registry response body was read. Public DOM, computed style/animation values, and rendered SVG assets supplied geometry and motion parameters. Shopify SVG provenance is also documented in `notes/batch-integration-settings.md`.

Both sides use Chrome headless, isolated profiles, light color scheme, 1440 × 1100 viewport, loaded Inter fonts, 560px rendered card (500px nominal at zoom 1.12), and the same scripted lifecycle. `full-lifecycle.webm` preserves each source video; `lifecycle.webm` is a 584 × 520 crop of the actual preview stage. Native rate is 25fps (40ms intervals). Raw frames and contact sheets contain actual video frames, without interpolation. Dense DOM/animation sampling is separate from capture.

## Observed tracks

| Track | Reference evidence and behavior | Reconstruction |
| --- | --- | --- |
| Icons | Clock and solid key are static SVGs. Validation check translates up 2px while fading over 240ms. Menu check scales .5 → 1 over 260ms. Switch thumb travels 12px over 280ms. Regenerate ring rotates over a 700ms period. Copy changes to a green check. | Rendered icon paths transcribed with provenance. CSS implements the observed independent icon motions. `key-regenerate-contact.png`, `key-copy-contact.png`, and fold sheets show actual intermediate frames. |
| Light | No ambient glow. First key request has a 90° white text sweep (38/50/62% gradient stops, 300% background size, 1.4s nominal cycle). Green key background marks fresh revealed value. Field focus uses a blue outline; invalid field uses pink background/outline. | CSS pseudo-element sweeps over the text; regeneration uses its own ring. Outline strength and spinner stroke were corrected after computed-style comparison. The source's roughly 650ms fixture request ends before a complete nominal sweep cycle. |
| Text | Paused metadata swaps immediately. Generating label is stable beneath the sweep. Newly revealed key enters with opacity and 2px translation over 320ms; green copy reminder over 240ms. Hiding removes the reminder. No observed asynchronous Save pending/error/success UI. | Controlled key pending/fresh inputs, independent local reveal and copy feedback. Key generation and the 650ms fixture delay exist only in Study. Save/discard call the owner; no fake persistence or fabricated API key is built into the component. |
| Layout | Three divided groups. Dirty row uses 0fr → 1fr, 360ms; fold uses 420ms grid rows and 260ms opacity. Curve is cubic-bezier(.22,1,.36,1). Menu enters with translateY(-4px), scale(.98), opacity over 200ms. Source stage centers short cards and top-aligns oversized content through its intrinsic grid sizing. | Same CSS mechanisms and measured parameters, including interrupt/reverse. Card/head/group geometries match at desktop. Native frames compare opening, closing, key insertion, and final retrigger. |

## Coverage and evidence

The continuous video covers: initial reset; focused and invalid domain; correction; discard; menu/search/Tokyo selection; Save; reopen and Escape; pause/resume; key request; hide/show; actual clipboard copy; regeneration; discard key; a second save; reset; dirty retrigger/discard; fold interruption and reversal. Each event has its actual execution timestamp and root bounds in `video-timeline.json`.

A final transition comparison exposed an ownership detail: toggling sync in the reference does not dirty the save fields. Study was corrected to compare only key/domain/time-zone, and the paused-state test now asserts that the save row remains closed. This prevents an extra save-row animation during folding.

Stable PNGs include default, invalid, dirty, discarded, zone menu/filter/selection, saved, paused, generating, generated key, hidden key, copied key, regeneration, discarded key, and reset. `preview.png` is a sharp direct screenshot outside video recording. `frames/` and the `*-contact.png` sheets retain intermediate frames for save opening/closing, menu entry, fold opening/closing, pending key, copy, regeneration, and interrupted fold.

Measured desktop geometry: root 560 × 404.84375; header 560 × 80.609375; groups 99.53125, 124.171875, 99.53125px. Dirty root is 560 × 458.578125. The final badge uses tabular numerals, matching the 35.140625px reference width. At 390px, the reference card is 326px wide with a 36px logo, header padding 14/14/14/12, and group padding 12/12/14; these responsive adjustments were added after direct comparison.

`verification.json` reports specific browser assertions, not a similarity score. Checks exercise owner callbacks and baseline behavior, invalid-save disabling, search/empty/filter/Escape, Space toggle and inert folded content, actual clipboard text, pending reset cancellation, 390px width, and reduced motion. Targeted TypeScript compilation covers the two owned TSX files. No repository-wide build, installation, or commit was performed.

## Residuals and limits

- The demo key is the explicit `sk_demo_nonfunctional_fixture_0001` input. Original random demonstration key text differs. Regeneration reloads the supplied fixture rather than inventing a new key. This is intentional data ownership, and it changes the visible key string.
- Escape/selection in the replica returns focus to the time-zone trigger for keyboard continuity. The reference drops focus to the document body. A keyboard focus outline can therefore remain visible in the replica after Escape.
- Native 25fps recordings can differ by a frame in action-to-render alignment. CSS animation timelines substantiate durations, but the recordings cannot establish sub-40ms visual equivalence. Browser scheduling under parallel capture also introduces occasional repeated frames.
- Inter is provided by the existing local variable-font package; the reference loads named Inter weights. Very small rasterization differences remain possible.
- The copy confirmation's 1400ms hold is a fitted UI duration; the source recording establishes its temporary appearance and restoration, not an exact timer value.
- The source's 520px preview stage clips lower menu rows and the bottom of the taller fresh-key save state. Study preserves this preview framing; the reusable component itself permits menu overflow. Raw full recordings and root screenshots preserve the distinction.
- Only Clean/light was reconstructed. No asynchronous save/server error/success branch was exposed by the public preview; those states are not claimed. The reported browser checks do not establish real integration service behavior or persistence.

The result is an evidence-based independent reconstruction with the above explicit differences, not a claim of pixel-for-pixel identity.
