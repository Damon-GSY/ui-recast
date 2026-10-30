# Agents fidelity audit — 2026-10-30

Owned scope: Agent Inbox, Agent Tree, Agent Plan, Tool Call Card (Clean/light). Code is frozen for parent integration. Shared gallery/app CSS/registry/build/package files and Agent Run were not modified.

## Concrete corrections

- **Inbox:** live public computed tokens showed failure `#e5484d` and completion `#22a05a`; local used `#ef444f` and `#23a65b`. Corrected both. Existing 900ms ring, 460ms grid expansion, 100ms detail delay, delayed lane movement, black action buttons and gray surface hierarchy are retained.
- **Tree:** replaced the font-dependent `✦` heading glyph with the public rendered 14px SVG star and satellite circle. Corrected heading spacing (8px), heading accent, running and failed foreground/background alpha, orange needs-you foreground/background and corresponding summary colors. Replaced the undersized clock and angular error triangle with observed geometry. Removed the extra local hover lift after live hover measurement confirmed the original keeps its resting shadow. Controlled selection, unknown telemetry and folding API remain.
- **Plan:** restored black title and exact pending-text role; added the missing 1600ms white text sweep on the existing externally derived active summary, its 320ms fade/3px arrival and 13px status typography. The supplied summary wording remains unchanged. Completion removes the sweep; reduced motion hides it. No execution/edit/retry controls or automatic progress were added.
- **Tool Call:** restored the missing group icon stack via explicit caller-supplied `icons`, running label's 1800ms sweep and 360ms status-title arrival. Duration-present running/success cards show the compact duration like the reference; screen-reader status and unknown/error/cancelled labels remain explicit. Added a labelled Source fixture study with public visible sample data to expose running/success/error, external retry/completion, group disclosure, copy, long-code expansion and repeat. The production components do not infer aggregate execution state from children or advance records.

## Verification

`node node_modules/typescript/bin/tsc -p scripts/affectui-review/agents/tsconfig.json` passed. `scripts/affectui-review/agents/verify.mjs` passed 25 browser checks with zero page errors: observed palette and SVG, folding reversal, missing-telemetry semantics, Plan read-only/non-autonomous behavior, shimmer removal/reduced motion, explicit Tool group marks, compact duration, disclosure, preserved null and unknown, no automatic completion. Final CSS-only header/footer calibration followed; final media inspects those values.

Isolated preview: `http://127.0.0.1:4226/scripts/affectui-review/agents/index.html?component=agent-inbox` (replace component with the other three names). HMR and watching disabled, unique cacheDir under Agent Tree evidence, `resolve.dedupe=['react','react-dom']`. Main server was not restarted. No dependency additions or root build.

## Evidence and remaining differences

Per component: `evidence/batch/<name>/fidelity-review/` contains `before/` (source, Study, baseline browser captures, preserved prior native media), `reference/` (current live screenshots, visible DOM/computed style/animation evidence, whole prior-recording contact sheets), and `replica/` (final native media and actions after code freeze).

The existing complete Inbox and Tree original recordings were inspected across their lifecycle and current live previews checked. Tool Call's previous recording clips expanded content; a new framed reference capture replaces that comparison evidence. Plan reference covers execution/failure/retry/completion/retrigger; its editable-only UI is not the local read-only contract.

Remaining limits: Tree source-fixture intermediate cost and orchestration timing are fitted; selection is an explicit controlled product behavior. Plan lacks source descriptions/tool chips/runtime because these are absent from the supplied TodoWrite contract; row heights and workflow differ, while its comparable visual tracks are calibrated. Tool comparison fixture currently has two tools and externally selected retry/completion rather than the original three-tool business chain; the production component remains a passive record renderer. Dark/narrow behavior is not claimed source-identical. No universal 1:1 claim; parent owns installation, registry publication, shared gallery and package verification.

## Changed delivery files

- `src/components/agent-inbox.css`
- `src/components/agent-tree.tsx`, `src/components/agent-tree.css`
- `src/components/agent-plan.tsx`, `src/components/agent-plan.css`
- `src/components/tool-call-card.tsx`
- `src/batch/tool-call-card/Study.tsx`, `src/batch/tool-call-card/study.css`, `src/batch/tool-call-card/SourceStudy.tsx`
- `scripts/affectui-review/agents/` (isolated preview, scoped typecheck, probes, verification, recordings and frame extraction)

Final recording review results will be appended below when media inspection completes.
