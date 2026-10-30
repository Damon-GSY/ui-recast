# Fluid Notch

> **Tested model:** `gpt-6.1-sol` (GPT-6.1 Sol), reasoning effort `high`. Primary evaluation: light theme, 340px, full three-question lifecycle. Dark mode has representative state comparisons, not a complete dark-lifecycle acceptance.

Standalone React/TypeScript/CSS reconstruction of the paid Aceternity Pro Fluid Notch from its public rendered preview. The visible Code gate and purchase controls are documented in [PROVENANCE.md](PROVENANCE.md). No restricted implementation was accessed.

```sh
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4231/ for the example and controls. Use http://127.0.0.1:4231/?capture for the default 340px light evaluation view, and http://127.0.0.1:4231/comparison.html for actual reference/local recordings and frame comparisons. `npm run preview` serves the built component on the same dedicated port. Run only one server at a time.

The Vite cache is trial-local, React is deduplicated, and watching/HMR are intentionally disabled. Restart the development server after editing source; otherwise Vite can retain old transformed CSS. Final local lifecycle evidence was recorded from a fresh production preview of the frozen source.

The reusable implementation is in `src/component/FluidNotch.tsx` and `fluid-notch.css`. `src/example/fixtures.ts` supplies sample content; `App.tsx` owns open state, decisions, question progression and reset. To integrate, supply `card`, `people`, `reviewed`, `total`, `open`, `onOpenChange`, `onAction` and `onDismiss`; callbacks let the caller choose whether a dismissal consumes a question. The supplied example reproduces the observed consuming-Escape behavior. Avatars/font/noise assets are local with documented provenance.

[ANALYSIS.md](ANALYSIS.md) records observations and implementation choices. [VERIFICATION.md](VERIFICATION.md) records actual checks and remaining differences. [FILES.txt](FILES.txt) lists every delivered source, documentation, script and evidence file, excluding generated dependencies/cache/build output.

All nine lifecycle checks pass on both outputs; default card sizes and wrapping match. Remaining differences include fitted intermediate shell/content timing, independently randomized dust, short icon/focus timing and initial page-load reveal. No 1:1 fidelity claim is made.
