# Shells fidelity audit — 2026-10-30

Scope: `app-shell-flat`, `app-shell-inset`, `agent-run`, Clean/light. Official live previews were reopened at 1440×900; mobile shell sequences use 390×844. Canonical inset target remains `https://www.affectui.com/screens/app-shell/full`. Public rendered DOM, computed colors/animations and SVG geometry only; no gated source, bundles or React internals.

Source edits are frozen. Parent owns shared integration, registry generation, installation and root build. No shared app/main/catalog/package/build files changed and no dependencies added.

## Concrete findings and direct fixes

1. Both shell news widgets incorrectly added a 240ms opacity `.3→1` / `translateY(4px)→0` entrance and a 280ms container/padding transition when dismissing the first card. The live source changes the text and stack immediately, keeping the front card at its existing anchor. Removed these invented animations from Inset component CSS and Flat Study CSS. The live `motion-probe.json` and old original `news-dismiss-contact-sheet.png` agree.
2. Both setup guides replaced expanded text immediately on close. The source retains that content, fades it out over 260ms `ease`, then replaces it with the summary at approximately 420ms; the summary enters over 360ms while the 480ms shell contraction completes. Added retained inert outgoing content, cleanup of the visual timer, and reduced-motion immediate replacement. Existing 480ms height/radius, 200ms shadow, 360ms opening content and 380ms group geometry remain. This preserves fixed-size text rather than scaling the whole panel.
3. Agent Run's 6px header state dot was frozen at opacity `.35`. The source breathes `1→.35→1` over 1400ms `ease-in-out` while Running and Needs input, then becomes fully opaque when Done. Restored the independent loop and disabled it under reduced motion.
4. Run header status colors were approximate and its 4px left margin was absent. Needs input is `#b45309` on `rgb(217 119 6 / .1)`; Done is `#15803d` on `rgb(22 163 74 / .1)`. Restored those measured values and 22px pill height / 4px margin. Running remains `#4469fc` on `#eef3ff`.

Edited deliverable files:
- `src/components/app-shell-inset.tsx`
- `src/components/app-shell-inset.css`
- `src/components/agent-run.css`
- `src/batch/app-shell-flat/Study.tsx`
- `src/batch/app-shell-flat/study.css`

`AppShellFlat` itself already matched its observed shell geometry and rendered icons; its incorrect news/guide behavior lived in the actual imported Study. AgentRun remains caller controlled: no autoRun/timer was added to run data; Plan editing remains unavailable without a callback. The visual guide-close timer does not advance business state.

## Actual visual tracks

- Palette: white main surfaces; shell background `#f8f8f8`; primary text `#171717`, normal nav `#404040`, secondary `#737373`, faint `#a3a3a3`; structural border `#ebebeb`. Update-card blue `#4469fc`; summary progress `#536dff`; expanded guide progress `#2f6bff`. No new brand palette introduced.
- Icons: sidebar/search/workspace/project glyphs use the previously observed rendered SVG paths, with 1.9-unit strokes and 16px nav dimensions; run breadcrumb icon is 15px, clock 14px. The shell's 42px document placeholder and 11px radius match the source. Agent plan spinner, tool execution ring, completion checks and approval icons remain separate tracks, not a single rotating container.
- Light/shadow: no colored exterior glow exists on either shell. News cards use the 1px `#ebebeb` outline and `0 2px 6px rgba(0,0,0,.04)` shadow. Expanded guide uses `0 8px 24px -10px rgba(0,0,0,.14)` behind its border. Agent Run's existing text shimmer and pale tool/approval containers are retained; the header dot's missing opacity cycle is repaired.
- Text: sidebar labels fade with the sidebar. Menus retain 220ms entry and 4px vertical offset. Guide opening uses 6px text translation / 360ms opacity; closing now retains and fades the outgoing content before introducing the summary. News text switches immediately. Run header status word changes follow caller status; its dot continues through Running→Needs input without remounting.
- Layout: sidebar 272px, adjustable 220–380px. Flat header 48px, main starts at `(272,48)`; Inset surface `(272,8,1160,884)`, 12px radius. Run header 52px, reading column max 680px, right details 360px. Sidebar transition remains 420ms `cubic-bezier(.22,1,.36,1)`; mobile drawer and scrim remain independent. Main surface occludes receding sidebar. Desktop run details toggle remains immediate, as observed.

## Evidence and verification

Baseline source: `evidence/affectui-review/shells/before/src/`. Baseline screenshots and DOM/color readbacks: each component's `before/initial.png`, `rendered.json`. Complete historical original run lifecycle and local baseline are preserved in the canonical baseline backup during promotion; original 3-page lifecycle contact sheets were inspected across run stages, tools, approval/diff, Done, restart, Stop and denial. Previous Flat source opening/news contact sheets were also inspected before editing.

Live current observations: `evidence/affectui-review/shells/<component>/reference/initial.png`, `rendered.json`, `live.json`; Inset `reference/motion-probe.json` and `before/motion-probe.json`; Agent Run `reference/header-palette.json` includes public animation keyframes/timing for the whole dot loop and exact state colors. The probes are independent of recording sessions.

Isolated preview: `http://127.0.0.1:4224/scripts/affectui-review/shells/index.html?component=app-shell-flat&capture=1` (substitute component). Server script uses a unique `/tmp/affectui-shells-vite-cache`, React dedupe, `hmr:false`, `watch:null`. Native recording uses Chrome headless sequentially; no extraction or screenshots during successful recording. Recording scripts are under `scripts/affectui-review/shells/`.

Targeted source compilation: `./node_modules/.bin/tsc -p scripts/affectui-review/shells/tsconfig.json` passed. `verification.json`: 15 passing checks across all three component compositions, detecting missing outgoing guide text, premature summary, lost repeat trigger, invented news animations, or delayed reduced-motion close. `controlled-verification.json`: idle/no autoRun, fixed elapsed value, read-only Plan without edit callback, measured status palette/geometry, active dot loop, opaque completed dot and reduced motion passed. No page errors in either check.

## Limits

No 1:1 claim. Clean/light is the audited theme. Timing comparison uses rendered phase starts and native decoded frames; request timestamps are scheduling landmarks, not exact animation onsets. Native recording is 25fps and may contain duplicate frames. Mobile captures are embedded in a fixed 1440×900 recording canvas after resizing the actual viewport to 390×844.

Run time labels depend on the real recording clock and caller demo durations. Caller-owned draft decisions intentionally survive panel close/reopen; the official demo resets them. Inset's default onboarding task click emits a navigation callback and leaves fixed reference progress unchanged; Flat's Study owns local task completion. These are explicit retained caller semantics, not excuses for visual defects. Arbitrary draft splitting, Plan drag trajectories, generic failure text/clipboard timeout, dark variants and backend integration remain outside the newly verified comparison. Existing independent subpart evidence remains available for unmodified tool/diff/approval tracks. Root build/registry/install are parent-owned and not claimed by this report.
