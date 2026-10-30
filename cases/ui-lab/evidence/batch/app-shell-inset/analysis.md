# App Shell Inset extraction

Official target: https://www.affectui.com/screens/app-shell and its `/full` preview, Clean/light, observed 2026-10-29. The requested `/screens/app-shell-inset` is a 404; the site's visible **App Shell Inset** link points to `/screens/app-shell`. Only visible page text, rendered DOM/computed styles/SVG and public documentation were inspected. No Pro source, bundles or internal React state were read.

## Implementation and source comparison

`src/components/app-shell-inset.tsx` and `.css` contain the promoted shell implementation. `AppShellUser` is local, so standalone distribution needs only these two files and React. AgentRun imports this public component and can omit it with `shell={false}`. The old helper sources are removed; the pre-extraction implementation remains in `evidence/integration-supplement/run-shell/before`.

The standalone Study supplies the official preview's menu/project labels, public rendered SVG geometry, and placeholder content. Navigation selection and callback output are Study state. At 1440×900, the extracted surface matches the measured source rectangle `(272, 8, 1160, 884)`; border is 1px, radius 12px. The placeholder icon is 42px with 11px radius; title is 14px/20px and supporting text 13px/19px. Source and local screenshots were inspected. The shell was made independent of AgentRun's inherited font rules.

## Evidence and checks

- `reference/standalone.png`, `replica/standalone.png`: new standalone source and extracted implementation.
- `reference/lifecycle.webm`, `replica/lifecycle.webm`: short native recordings of sidebar collapse/reopen and workspace-menu open/close.
- Full existing shell mechanism evidence is inherited from `evidence/batch/agent-run/parts/shell/source-interactions.webm`, `local-interactions.webm`, `collapse-trajectories.json`, `local-expand-render-phase.json` and `README.md`. It covers guide/news, resizing, reversals and mobile drawer/focus; this extraction does not claim these are new standalone recordings.
- New checks exercise actual extracted sidebar resizing, navigation callbacks, reduced motion, mobile drawer focus, and the single-shell AgentRun integration: 35 rendered assertions passed with zero page errors. Detailed assertions and screenshots: `evidence/integration-supplement/run-shell/verification.json` and `local/`.

Both new native recordings were inspected using 2fps original-frame overviews. They include the complete short action sequence but have different initial page/font wait durations; equal absolute video timestamps are not phase-aligned. These overview frames do not establish subsecond timing equality. The existing isolated render trajectories remain the sidebar curve evidence.

The integration Study passes custom navigation/footer/workspaces into the host shell, supplies task header/round/process/file-preview slots, and uses `AgentRun shell={false}`. No missing approvals or drafts are invented. The main content has one scroll owner; an alternate `scrollOwner="host"` removes the inner vertical scrolling. File/round selection and run actions are caller callbacks; the component cannot advance status or elapsed time itself.

## Official requirements and dependencies

The public installation documentation requires a React 19 TypeScript project and `@/*` path alias. It states that styles are embedded in the official components, with no Tailwind or other package required. This is a documentation-level claim, not a retrieved per-item registry dependency list.

Anonymous HEAD requests to `https://www.affectui.com/r/app-shell.json` and `https://www.affectui.com/r/agent-run.json` both returned HTTP 401 on 2026-10-29. No response body was read. The exact official `dependencies` and `registryDependencies` arrays remain unknown. Public Pro installation instructions require a personal access key. Evidence is in `evidence/integration-supplement/run-shell/registry-head.json`, `official-installation-requirements.txt`, and the two `*-public-docs.txt` files.

Our reconstruction differs: AppShellInset uses React + plain CSS; AgentRun also imports Motion through its plan/activity helpers. Existing installed versions checked for this run: React/react-dom 19.3.1, Motion 14.7.1; the Study font is `@fontsource-variable/inter` 5.3.0. No new dependency was added by this group.

## Known limitations

- This is the inset/light extraction and the existing sidebar composition. The official API's flat layout, global header, independently resizable right workspace, custom width limits and dark theme were not implemented in this scope.
- Sidebar news/setup are inherited reference widgets when footer configuration is omitted; production callers should pass their own footer or `null`, navigation and workspace choices. Their fixed reference progress does not represent real onboarding state.
- Existing guide/news animation fits and original AgentRun motion differences remain documented in their original evidence. No new 1:1 claim is made.
- There is no real jobs/SSE/files/deadline integration. The new integration Study uses explicit local records and click-driven state only.
- Registry generation, independent installation and shared gallery integration are owned by main; this group's browser checks run source modules through the existing Vite server.
- Gallery readback found the shared `main.batch-page` enclosing the Study's `main.ar-shell-surface`, creating a second main landmark on both new gallery pages. The independent host fixtures have only one. This shared-wrapper correction is handed to main; `gallery-readback.json` records the actual DOM.
