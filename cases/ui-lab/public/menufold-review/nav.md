# Nav / tabs / height / accordion — source frozen

Completed: 2026-10-30T11:49:48+08:00. All browser recording/decoding sessions are closed; the isolated 4214 preview is now closed. Root 4187 was observed listening and was not altered.

## Scope correction

The assigned group has four components: SettingsSidebar, InstantTabs, AutoHeight and DetailAccordion. The parent report remains a 15-component review.

ReadingTabs was an extra finding during my review, not a shared dependency of these four components. I interpreted “tabs” too broadly and included it beyond the assigned scope. Its source change and evidence are recorded separately below; they do not increase the parent component count or the assigned-group verification count.

## Assigned four-component results

- InstantTabs: replaced the almost instantaneous 45%-to-100% fade with a 300ms opacity/6px translation/2px blur reveal. Controlled activation stays immediate; no exit wait; Study height remains constant.
- DetailAccordion: restored the rendered 350ms content opacity/blur timing and dynamic 16px lower-edge mask. The existing chevron curve was already correct. Notices remain outside collapse/mask and the neighbor follows height continuously.
- AutoHeight: ordinary dimensional settle was already correct (less than 1px spring overshoot), so its height spring was retained. Study detail text now fades before removal; quick reopen cancels removal. Natural height is exposed as a CSS variable for the accordion mask.
- SettingsSidebar: no supported-path motion defect found. Kept source unchanged; all 15 labels, hover reversal and keyboard selection verified.

## Changed source files

- `src/components/instant-tabs.tsx`
- `src/components/auto-height.tsx`
- `src/batch/auto-height/Study.tsx`
- `src/components/detail-accordion.css`
- `src/components/detail-accordion.tsx`

Extra review finding: `src/components/reading-tabs.tsx` was also changed. Preceding-label growth caused its indicator to jump from 117.41 to 187.73px on the first resized frame. The correction uses two left-origin edges and the current rendered position for reversal timing; the first resized frame remains 117px. Its baseline and evidence are in `evidence/batch/reading-tabs/motion-review/`.

Apart from those five assigned source files and this one extra file, no other source, shared gallery, skill, registry, bundle, public files, dependency files or root build output changed. Source is frozen; parent may integrate immediately.

## Evidence and validation

Assigned group: **34/34** targeted checks passed across four components — InstantTabs **11**, DetailAccordion **9**, AutoHeight **8**, SettingsSidebar **6**.

Extra ReadingTabs finding: **7/7** checks passed, counted separately from InstantTabs and excluded from the main 15-component report. The historical combined execution total is 41/41; it must not be presented as the assigned group's count. No additional checks were run for this scope correction. Includes immediate/latest activation, interruption, retained editor state, keyboard, reduced motion, 390px layout, stable text scale, notices, neighbor continuity and runtime errors. TypeScript passed with `--noEmit --incremental false`; this is separate from visual evidence.

For each assigned slug under `evidence/batch/<slug>/` (the extra `reading-tabs` evidence uses the same layout):

- `motion-review/before/`: pre-edit component/Study source, full prior replica tree and analysis. Reference video reused in place.
- `replica/lifecycle.webm`: replaced canonical final continuous video, 1024×1100, nominal 25fps, one recorder at a time; actions JSON refreshed.
- `motion-review/reference-frames/`, `before-frames/`, `replica-frames/`: complete normal-speed decode logs plus actual timestamped frame sequences. Final frames were checked at entry, middle, spring-tail/settle, exit and reverse.
- `motion-review/phase-anchors.{png,json}`, `motion-traces.{svg,png}`, `before-measurements.json`, `after-measurements.json`, `verification.json`: phase and per-property evidence. Dense measurements ran separately from recording.
- `analysis.md`: rewritten for this review and explicit remaining differences. Canonical contact/keyframe sheets also refreshed; unrelated old screenshots remain historical.

Assigned canonical durations: SettingsSidebar 10.24s; InstantTabs 9.40s; AutoHeight 10.44s; DetailAccordion 8.16s. Extra ReadingTabs recording: 9.48s, outside the main 15-component count.

## Integration and skill lessons

1. Refresh parent-owned `public/evidence` from canonical evidence before reviewing the shared player. A Vite server with default publicDir can silently serve stale `public/evidence/...` instead of the newer root `evidence/...`. Our isolated preview now sets `publicDir:false`; final decoded durations were checked against the actual canonical files.
2. Indicator resize review must include a changing track width/preceding label, not only switching selected tabs. CSS right offsets can jump before the animation while final endpoints still look correct.
3. Sample height, opacity/blur, icon rotation and clipping separately. One shared duration can hide a missing edge mask or content finishing too early.
4. A correct height wrapper does not make an instantly removed child a correct exit. Check the outgoing-content lifetime and cancellation separately from the box spring.
5. A `click()` request that waits for a moving button can miss the intended reversal. For the bounded reversal, use a stable native activation and retain the actual decoded phase; request timestamps alone are not phase alignment.

## Remaining differences

No 1:1 claim. Flat permanently labelled navigation and immediate/stable InstantTabs are preserved explicit decisions; the source tree/collapse and tab exit wait are therefore absent. ReadingTabs keeps manual tab semantics rather than reference radio drag semantics. AutoHeight Study remains top anchored and fades its details rather than replacing all copy. Original icons, palette, labels and dimensions remain different. Incoming lift and Study fade timings are fits to the observed sequence; exact source curve identity is not asserted. Classic ReadingTabs timing was not re-fit.

Reproduction scripts: `scripts/menufold-review/nav-*.mjs`. No additional checks are pending.
