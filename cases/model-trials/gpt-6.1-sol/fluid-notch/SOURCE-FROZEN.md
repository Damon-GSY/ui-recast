Source frozen for independent review: 2026-10-30 (Asia/Shanghai).

Implementation: src/component/FluidNotch.tsx and fluid-notch.css.
Caller state and fixtures: src/example/App.tsx and fixtures.ts.
Run: npm ci && npm run build; npm run dev (dedicated port 4231).
Capture view: http://127.0.0.1:4231/?capture

First browser pass: no page errors; 340 x 242 question-one dialog, matching the observed reference geometry; actual idle and open screenshots saved. Production build and TypeScript pass. Vite emits dependency use-client directive warnings (static client app).

Implementation, public assets, dependencies, and Vite configuration are frozen. Remaining trial work is lifecycle/runtime verification, recordings, comparisons, and documentation. Any required implementation change would be explicitly announced.

Final handoff: source stayed unchanged. Final recordings use the built preview; local lifecycle checks 9/9, local keyboard/reduced-motion checks pass. Parent reported fresh independent install/build and seven production runtime checks passing. Media/browser capture is finished.
