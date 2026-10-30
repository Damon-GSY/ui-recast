# Tool Call Card source and adaptations

The visual CSS, SVGs, code highlighting, disclosure layout, and code-block cap mechanism are adapted from affectUI's public **Tool Call Card Clean**. `tool-call-card.tsx` is the local caller-owned state adapter; it is not a verbatim upstream API.

- Official component: https://www.affectui.com/components/tool-call-card
- Public clean source: https://www.affectui.com/r/tool-call-card-clean.json
- Public classic source, preserved for context: https://www.affectui.com/r/tool-call-card.json
- License: MIT, copyright (c) 2026 Florian Höller (adfects). Full notice in `LICENSE`.
- License source: https://raw.githubusercontent.com/flohoeller/affectui/main/LICENSE
- Version: the official registries contain **no release/version field**. This is the **2026-10-29 UTC snapshot**, not a claimed tagged release. Exact retrieval timestamps and original registry/file bodies are preserved at `evidence/integration-supplement/tool-tabs/upstream/` in the study workspace.

Local changes: external execution status with explicit unknown state, independent discriminated result availability, arbitrary ToolContent children, authoritative duration only, no stopwatch, no Retry protocol, caller-owned group status/label, explicit copy callback and failure feedback, external CSS. The only internally owned state is disclosure and code/copy UI. No jobs, SSE, files API, deadline or backend integration is implied.

## API

`ToolCallCard`: `name`, `summary`, `icon`, `status` (default `unknown`), `args`, `result`, `error`, authoritative `duration` in milliseconds, `open/defaultOpen/onOpenChange`, `onCopy(text, section)`, `maxCodeHeight`, `children`, `className`.

`result` is one of `{state:'not-captured', reason?}`, `{state:'pending', label?}`, `{state:'empty', label?}`, `{state:'captured', value}`. Missing result defaults to not captured even when an explicit success status exists. Captured null, false, zero and empty strings are displayed distinctly. A custom child replaces the default result display; it does not determine execution status.

`ToolContent`: arbitrary `children`, optional `title` and `className`.

`ToolCallGroup`: caller-provided `children`, `label`, `status`, authoritative `duration`, `open/defaultOpen/onOpenChange`, `className`. It never inspects child props or adds inferred timing.

Runtime: React 19. No new package dependency. For distribution include this notice, LICENSE, `pieces.tsx`, `tool-call-card.tsx`, and `tool-call-card.css`.
