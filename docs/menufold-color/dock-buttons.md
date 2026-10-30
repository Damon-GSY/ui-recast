# Dock / Stateful / Copy — color correction, source frozen

2026-10-30. **Source frozen for parent integration.** Only the three assigned standalone component CSS files, their Study CSS, assigned color-review evidence, canonical replica media/analysis and group scripts were changed. Component TSX and Study TSX are byte-identical to the before copies. Existing layout, geometry, state ownership, keyboard handling and motion declarations were preserved. The parent's gallery cascade correction is separate.

## Rendered source → component mapping

| Component / role | Public source evidence | Final standalone CSS |
| --- | --- | --- |
| Stateful default, pending, success, retry surface | Aceternity public live preview computed `oklch(0.723 0.219 149.579)` in idle, hover, clicked and result | `--mfs-accent:oklch(0.723 0.219 149.579)` throughout; no blue success substitution |
| Stateful text/icons | Source `rgb(255,255,255)`; no color change on result | `--mfs-on-accent:#fff`, all SVGs retain currentColor |
| Stateful hover ring | Source white 2px offset + same green 4px spread, no idle shadow | Exact white/green layers; same existing 200ms timing; no invented inset highlight or drop shadow |
| Copy surface/text | Animate rendered `lab(2.75381 0 0)` / `lab(98.26 0 0)` | sRGB equivalents `#0a0a0a` / `#fafafa`; success retains this pair |
| Copy hover | Animate `oklab(0.145 … / .9)`; screenshot near `#232323` over white | `rgb(10 10 10 / .9)`; foreground stays `#fafafa` |
| Copy shadow/border | Source no shadow, zero-width border | No shadow; transparent existing 1px border preserves approved geometry |
| Dock shell / icons | Magic: transparent tray on white, `oklch(.922 0 0)` border, `.269` icon foreground, no shadow | White shell, `#e5e5e5` border, `#262626` icons, no shadow. Explicit white preserves the reference appearance in the local Study |
| Dock hover | Magic `.97` neutral fill / `.205` foreground | `#f5f5f5` / `#171717` |
| Dock selected | Aceternity visible icon disks: `oklch(.928 .006 264.531)` | `#e5e7eb` reused as persistent local selection; selection itself is a MenuFold addition |
| Dock tooltip | Viewed Aceternity screenshot; dominant tooltip pixel `#f3f4f6` | `#f3f4f6` fill, `#e5e7eb` border, `#404040` readable text, no shadow. Text/border are local neutral role choices, not exact measured tooltip declarations |

Source URLs and JSON: `evidence/batch/<slug>/color-review/source-rendered.json`; Dock also `magic-rendered.json`, `magic-detail.json`, `aceternity-detail.json`, `tooltip-pixels.json`; Copy also `copy-detail.json`. Read only public rendered DOM, computed CSS and public screenshots. No gated source, bundle text, registry bodies or React internals were read. Reference screenshots were viewed before choosing colors.

## Local semantic additions and Study treatment

- Stateful keyboard outline uses dark green `#008236`; disabled uses `#f5f5f5 / #737373` with `#e5e5e5` border, keeping icons visible and removing the hover ring. These states are local semantic choices; not claimed as measured upstream disabled/error behavior.
- Copy uses the source's neutral focus hue `#a1a1a1`, retaining the approved 2px outline/3px offset geometry rather than replacing it with the source's 3px half-opacity shadow. Disabled uses 50% button opacity (visible in source rendered class), no removed icon.
- Dock focus is neutral `#737373`; disabled icons `#a3a3a3`, disabled selected fill `#f5f5f5`. Fixed keyboard selection remains distinct from transient hover.
- Both error reasons use chosen semantic red `#b91c1c`, measured 6.47:1 against their white card. Retry button retains its component's source primary color.
- Study stage: Stateful uses the source preview's neutral `#f5f5f5`; Dock and Copy use their white source canvases. Cards are white, borders `#e5e5e5`; supporting text/icons `#737373`, Copy diagnostic text `#525252`. The Study's custom content/card roles are local choices. No olive/yellow hue remains in wrappers, text, decoration or shadow.

## Focused validation and synchronized media

`node scripts/menufold-color/dock-buttons-preview.mjs` serves only the three studies on 4215, `publicDir:false`, HMR/watching off. `dock-buttons-verify.mjs` passed **27 checks** (Dock 7, Stateful 11, Copy 9): source palette, hover/focus, persistent selection, fixed layout slots, disabled icon visibility, error contrast, real clipboard readback, held clipboard promise and completion color continuity. Stateful ring checks now expect the measured green, including pending/success/disabled/reduced motion. This new scoped verification supersedes the blue expectations in historical `scripts/menufold-review/dock-buttons-ring.mjs` and `dock-buttons-palette.mjs`; those files are outside this worker's ownership and were not edited.

Contrast: Stateful white/source-green stays **2.217:1** through pending→success; no foreground/background crossfade erases the label. Copy idle **18.968:1**, hover **15.239:1**; completion samples stay above 12:1. Dock selected icon **12.223:1**, hover-selected **14.480:1**. Disabled opacity is recorded separately and isn't included in Copy's reported active-state contrast. Check endpoints for intact SVGs; preserve the already-approved source shrink/pop's transient low-visibility interval. The geometry assertion uses layout size, excluding the existing press transform.

`color-review/before/` contains pre-edit CSS/TSX, Study sources, screenshots, analysis and complete old replica media. `css-changes.json` in Dock's color-review confirms only color/paint declarations changed; no timing/layout declaration changed. No whole-root build or new dependencies.

Each changed component's initial color lifecycle was recorded **once**, sequentially in independent Chrome contexts, by `dock-buttons-record.mjs`. Parent then requested **one additional isolated `--stateful` rerecord** for the brief media artifact; only Stateful canonical media were replaced. Dock/Copy media and all frozen code are unchanged, and the 27 checks were not rerun. Canonical `replica/source-full.webm`, `lifecycle.webm`, `events.json`, state PNGs, `keyframes/`, `keyframes.html` and `transition-sheet.png` now show these colors. `dock-buttons-media.mjs` decodes only nine focused state frames per component; no new full motion extraction/audit. Actual images and contact sheets were viewed, including pending, errors, success, disabled and Dock selected/tooltip states. Requested seek times are approximate media locators, not exact transition onsets.

## Remaining differences / limitations

Stateful deliberately keeps the approved 140×42 layout, 18px reserved icon, Chinese state labels, rounded rectangle and caller-owned outcomes; source is an expanding green capsule. Its measured source white-on-green pair does **not** reach 4.5:1 text contrast; no arbitrary darkening was applied. Copy keeps the labeled button and persistent copied feedback instead of the square timed source demo. Dock merges Magic's white tray/dark icons with Aceternity-derived neutral tooltip/selection fill and retains fixed 44px slots, not source magnification. These are not blanket 1:1 claims.

Stateful's brief recording/compression artifact around 5.1s **persists after the one parent-authorized isolated rerecord**. The focused 1.08s success window contains 26 consecutive decoded frames; frame 011 shows the artifact, while adjacent frames and the canonical success still at requested 5.257s are clear. See `evidence/batch/stateful-button/color-review/rerecord-success-window/` for actual frame sheets and `review.json`. Previous media are preserved in `color-review/rerecord-before/replica/`. The new canonical lifecycle/full video, event times, state PNGs, keyframes and contact sheet are synchronized. No further recording, frame repair or interpolation was introduced.

Parent owns registry regeneration, installation, builds and shared integration. Independent browser sessions and 4215 preview are closed at handoff.

## Changed files

- `src/components/{fixed-dock,stateful-button,copy-button}.css`
- `src/batch/{fixed-dock,stateful-button,copy-button}/study.css`
- `scripts/menufold-color/dock-buttons-{preview,observe,source-detail,verify,record,media}.mjs`
- `evidence/batch/{fixed-dock,stateful-button,copy-button}/color-review/**`
- `evidence/batch/{fixed-dock,stateful-button,copy-button}/replica/**` and `analysis.md`
- `notes/menufold-color/dock-buttons.md`
