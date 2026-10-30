# GPT-6.1 Sol trial: paid Fluid Notch

## Result

The model completed a fresh reconstruction of one paid Pro component, **Aceternity UI Fluid Notch**, from the English UI Recast skill and public preview. The independent project installs and builds; its core three-question lifecycle works. Default open-state geometry, typography, portraits, grain and dust are close to the reference. Motion is fitted, with visible differences in early collapse frames; this is not a 1:1 claim or evidence about every component.

## Setup and access

- Explicit native-agent model selection: `gpt-6.1-sol`, reasoning effort `high`.
- Fresh agent without inherited conversation history. It was instructed not to inspect existing implementations, case screenshots or previous analysis.
- Input: [`ui-recast`](../../skills/ui-recast/SKILL.md) and https://ui.aceternity.com/interactions/fluid-notch.
- Paid condition: the public page locks Code behind Get All-Access; the full-screen preview labels the component Pro. Preview operation is public. No gated code, bundles, registry or React internals were inspected.
- Visible public portraits, font and grain assets were reused with [provenance](../../cases/model-trials/gpt-6.1-sol/fluid-notch/PROVENANCE.md). This is a test without access to implementation source, not a claim that all visual assets were redrawn.

## Inspect and run

[Standalone source and example](../../cases/model-trials/gpt-6.1-sol/fluid-notch/) · [Model analysis](../../cases/model-trials/gpt-6.1-sol/fluid-notch/ANALYSIS.md) · [Paired playback page](../../cases/model-trials/gpt-6.1-sol/fluid-notch/comparison.html)

```sh
cd cases/model-trials/gpt-6.1-sol/fluid-notch
npm ci
npm run build
npm run dev
```

Open `http://127.0.0.1:4231/` for the interactive example, `/?capture` for the clean stage, or `/comparison.html` for paired full recordings. The component is in `src/component/`, caller state and fixtures in `src/example/`.

## Independent parent review

The frozen source, configuration, public assets and lockfile were copied into a separate temporary directory, without installed dependencies, build output or capture evidence. Fresh `npm ci --ignore-scripts` and `npm run build` passed. Source files remained identical to the model's frozen implementation; the parent made **no implementation edits**.

Seven production-runtime checks passed with no page errors or local resource failures:

1. Question one action advances caller state and closes.
2. Question two action advances caller state and closes.
3. Question three action advances caller state and closes.
4. Completion opens and Start over restores three questions.
5. Keyboard operation and Escape restore trigger focus.
6. A 390px viewport has no horizontal overflow.
7. Reduced-motion close works.

The first dialog measured 340×242 and all displayed image assets loaded. [Machine-readable observations](gpt-6.1-sol/independent-verification.json) and [independent capture](gpt-6.1-sol/independent-question-1.png) are included.

The parent viewed actual original/local question-one screenshots and the consecutive closing-frame strip. Surface, avatar images, wrapping, actions and grain are present. The strip shows the same broad shell-to-pill sequence, while content fade and early geometric contraction differ. A still image alone does not prove transient-state fidelity.

## Model scope

The original showcase collection remains attributed to `gpt6-astra`. Only this additional paid Fluid Notch trial was completed with GPT-6.1 Sol. Different prior tasks, adaptations and trial conditions prevent a controlled model ranking. Other models remain untested. Remaining visual differences and media sampling limits are recorded in the model's analysis.

The model's final handoff reports 9/9 lifecycle checks on each side and six keyboard/reduced-motion checks. See [verification details](../../cases/model-trials/gpt-6.1-sol/fluid-notch/VERIFICATION.md) for the observed states, native-frame comparison and remaining startup, dust and timing differences. The parent independently checked the installation/build and seven runtime paths listed above.

## Theme coverage

The primary complete recording and lifecycle evaluation cover **light theme at 340px**. Dark theme, width, background grain and dust controls received representative state comparisons. A dark-mode focus-ring difference is documented in the trial verification because the two captures used different input histories. These checks do not establish full dark-lifecycle fidelity or every theme-switch transition.

The skill now explicitly requires per-theme capture, role palettes, compositing and supported theme-switch analysis. This documentation update does not retroactively expand the trial's verified scope or modify its frozen implementation.
