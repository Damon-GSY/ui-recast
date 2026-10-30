# Tool Call Card — public-source adaptation

Source: https://www.affectui.com/components/tool-call-card (Clean preview). Official public MIT registry `https://www.affectui.com/r/tool-call-card-clean.json`; classic registry also retained. Unversioned upstream, captured 2026-10-29 UTC. Exact registry bodies, retrieval provenance and official MIT copyright/license are in `../../integration-supplement/tool-tabs/upstream/`. The source code is reused with adaptations, not presented as an independent reconstruction.

## Evidence

- `reference/lifecycle.webm`: 55.68 s native Chrome recording, 1440×1600, nominal 25 fps. Includes initial run, success, error, explicit Retry, code expansion/copy/show all/show less, group collapse/reopen and restart. The documentation stage was enlarged to 1140 px to expose expanded cards; component styles, content and timing were untouched. The original clipped first capture remains in `reference/raw/`.
- `replica/lifecycle.webm`: 16.84 s native Chrome recording, 1440×1100, nominal 25 fps. Unknown → running → explicit success → missing payload → error → captured null → explicit empty → arbitrary ToolContent → long code → reset/dark. User actions and elapsed times are in each `actions.json`.
- `reference/error.png`, `reference/expanded.png`; `replica/unknown.png`, `replica/tool-content.png`, `replica/dark.png`.
- `reference/storyboard.jpg` and `replica/storyboard.jpg` show real selected frames through the recording. `frame-times.json` records the actual selected video timestamps. Nominal video fps does not prove continuous unique frames.
- Separate rendered DOM/CSS sampling: `../../integration-supplement/tool-tabs/rendered-measurements.json`. 43 source and 44 local frames in approximately 0.7 seconds; never recorded concurrently with native video.

## Four visual tracks

**Icons:** public MIT SVG paths for the wrench, spinner, blue success circle/check, error, copy and chevron are retained. Source and local computed icon box are approximately 16 px; chevron approximately 12 px. Spinner retains the official CSS rotation; unknown status renders no success icon. Local no-timer running text is an intentional data-contract change.

**Light and surfaces:** Clean white card, 10 px corners, thin inset shadow, faint code surface and code fade are reused from the source. Expanded screenshot inspection confirms the source's clean surfaces and the local custom-content layout. Group shimmer/derived aggregation is not used; group status is explicitly supplied. Dark tokens are retained and local dark screenshots inspected.

**Text:** measured source and local header use 13 px / 20 px and tool name/code use 12 px / 20 px; monospace stack and code padding 10×12 px agree. Source and local text/content differ by design: local shows explicit status and availability, and demo data is labelled as fixtures. ToolContent accepts ordinary React content including a real nested button and table.

**Layout and motion:** observed source/local header is approximately 44 px tall with 14 px horizontal padding. Both computed body transitions are 380 ms cubic-bezier(.22,1,.36,1) for grid rows and 240 ms opacity; chevron 360 ms, code cap 420 ms. The reference changes its result while the open-body sample runs, so its height trace is not a fixed-content curve-fit comparison. Local body remains inert when closed, while the native disclosure buttons support Enter/Space. Copy morph/show all/show less were exercised.

## Meaningful verification

The isolated production consumer and direct Playwright checks cover unknown status stability, absent clocks/Retry, result availability independent of explicit success, captured null/false/0/empty string, explicit empty result, controlled expansion callbacks, keyboard disclosure and skipped inert controls, nested ToolContent callback, native clipboard readback, caller copy callback/error, stale copy-feedback clearing after new data, and capped-code expansion. Build/typecheck and rendered checks pass; full results: `../../integration-supplement/tool-tabs/verification.json`.

## Deliberate differences and limits

This is a read-only integration adapter: no live elapsed timer, retry protocol, automatic business-state transition, inferred success, child-prop group aggregation or automatic error opening. Missing result means not captured, not a successful empty return. Only a supplied authoritative duration is displayed. Source demo is 460 px wide; the local Study uses a 700 px host and different content. Shared tokens/mechanisms were checked, but no pixel-identical or identical-flow claim is made. No backend/jobs/SSE/files/deadlines contract was supplied. The sample connects actual React props/callbacks, not a real service. Main owns registry/route installation and delivery checks.
