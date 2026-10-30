# UI Recast

**Rebuild UI from visual evidence.**

A self-contained coding-agent skill that turns screenshots, videos, and live URLs into editable UI components—with complete interaction capture and comparison of color, icons, light effects, and subtle transitions.

[Install](#install) · [Use the skill](#use-the-skill) · [Case showcase](#case-showcase) · [All cases](cases/README.md) · [Workflow](skills/ui-recast/SKILL.md) · [简体中文](README.zh-CN.md)

![A real reconstruction case: Bento cards with neutral gradients, scoped styles, and interactive content](assets/readme/bento-grid.png)

## From reference to reusable source

1. **Capture the whole interaction.** Include entrance, loops, phase changes, completion, exit, and retrigger.
2. **Separate the visual tracks.** Inspect icons, light, text, and layout; extract the reference's actual color roles.
3. **Rebuild and compare.** Align rendered phase starts, inspect real intermediate frames, and fix concrete omissions.
4. **Deliver the evidence.** Provide source, an interactive example, recordings, verified scope, and remaining differences.

Light and dark themes are analyzed separately: role palettes, icon visibility, composited light/texture, and supported theme changes. See the [theme comparison guidance](skills/ui-recast/references/verification-delivery.md#dark-mode-and-theme-changes).

The skill preserves caller-owned business state and user-requested product adaptations. Choose CSS, Motion, GSAP, or existing project controls according to the reference and stack.

## Case showcase

> **Model used:** The original showcased collection was produced with `gpt6-astra`. An additional independent `gpt-6.1-sol` trial has completed for the paid Fluid Notch component; see the [single-case result](docs/model-trials/gpt-6.1-sol.md). Other models remain untested.

Reference on the left; reconstruction on the right. Each pair is **one automatically looping GIF**, so both sides play together. These are cropped, phase-aligned excerpts at original speed; full recordings remain linked below. The Fluid Notch excerpt joins opening and closing windows with short reading holds.

### Thinking Loader

Stationary rays, text sweep, phase handoffs, completion check.

![thinking loader — reference and reconstruction playing together](assets/readme/showcase/thinking-loader.gif)

[Full reference recording](cases/ui-lab/public/evidence/thinking-loader/motion-study/reference/clean/lifecycle.webm) · [Full reconstruction recording](cases/ui-lab/public/evidence/thinking-loader/motion-study/replica/clean/lifecycle.webm)

[Source](cases/ui-lab/src/components/thinking-loader.tsx) · [Review](docs/affectui-review/loaders.md)

### Agent Graph

Staggered nodes, breathing rings, status sweeps, call pulses.

![agent graph — reference and reconstruction playing together](assets/readme/showcase/agent-graph.gif)

[Full reference recording](cases/ui-lab/public/evidence/agent-graph/motion/reference/lifecycle.webm) · [Full reconstruction recording](cases/ui-lab/public/evidence/agent-graph/motion/replica/lifecycle.webm)

[Source](cases/ui-lab/src/components/agent-graph.tsx) · [Review](docs/affectui-review/loaders.md)

### Fluid Notch

Shell morphing, icon handoffs, texture, expansion and collapse.

![fluid notch — reference and reconstruction playing together](assets/readme/showcase/fluid-notch.gif)

[Full reference recording](cases/ui-lab/public/evidence/batch/fluid-notch/reference/lifecycle.webm) · [Full reconstruction recording](cases/ui-lab/public/evidence/batch/fluid-notch/replica/lifecycle.webm)

[Source](cases/ui-lab/src/components/fluid-notch.tsx) · [Review](docs/menufold-review/fluid.md)

### Stacked Empty State

Layered cards, light/shadow, hover, a single primary action.

The reconstruction is the MenuFold adaptation with native icons and one primary action.

![stacked empty state — reference and reconstruction playing together](assets/readme/showcase/stacked-empty-state.gif)

[Full reference recording](cases/ui-lab/public/evidence/batch/stacked-empty-state/reference/lifecycle.webm) · [Full reconstruction recording](cases/ui-lab/public/evidence/batch/stacked-empty-state/replica/lifecycle.webm)

[Source](cases/ui-lab/src/components/stacked-empty-state.tsx) · [Review](docs/menufold-color/stack.md)

### Combobox

Independent chip expansion/pop, focus ring, armed deletion.

![combobox — reference and reconstruction playing together](assets/readme/showcase/combobox.gif)

[Full reference recording](cases/ui-lab/public/evidence/batch/combobox/reference/lifecycle.webm) · [Full reconstruction recording](cases/ui-lab/public/evidence/batch/combobox/replica/lifecycle.webm)

[Source](cases/ui-lab/src/components/combobox.tsx) · [Review](docs/affectui-review/forms.md)

### Agent Run

Application shell, tool execution, status pulse, reading pane.

![agent run — reference and reconstruction playing together](assets/readme/showcase/agent-run.gif)

[Full reference recording](cases/ui-lab/public/evidence/batch/agent-run/reference/lifecycle.webm) · [Full reconstruction recording](cases/ui-lab/public/evidence/batch/agent-run/replica/lifecycle.webm)

[Source](cases/ui-lab/src/components/agent-run.tsx) · [Review](docs/affectui-review/shells.md)

[The case catalog](cases/README.md) contains **44 component entries and 2 composition examples**, including **15 MenuFold components**. Cases include independent visual reconstructions and attributed public-source adaptations. Detailed review notes currently retain their original language.

## GPT-6.1 Sol: paid Pro component trial

A fresh agent using `gpt-6.1-sol` (`high` reasoning) reconstructed **Aceternity UI Fluid Notch**, whose Code access requires All-Access. It received the English skill and public URL, with no prior implementation or case analysis. Source, full recordings, intermediate-frame comparisons, and remaining differences are included in the [trial](cases/model-trials/gpt-6.1-sol/fluid-notch/).

![gpt 6.1 fluid notch — reference and reconstruction playing together](assets/readme/showcase/gpt-6.1-fluid-notch.gif)

[Full reference recording](cases/model-trials/gpt-6.1-sol/fluid-notch/evidence/reference/lifecycle.webm) · [Full reconstruction recording](cases/model-trials/gpt-6.1-sol/fluid-notch/evidence/reconstruction/lifecycle.webm)

Fresh standalone installation/build and seven parent runtime checks passed. Static geometry and core interaction are close; motion remains fitted with visible intermediate-frame differences. This single trial is **not** a full-suite rerun or a controlled ranking against Astra. [Review and run instructions](docs/model-trials/gpt-6.1-sol.md).

## Install

This repository is private; clone it using an account with access:

```sh
gh repo clone Damon-GSY/ui-recast
cd ui-recast
mkdir -p ~/.codex/skills
cp -R skills/ui-recast ~/.codex/skills/
```

The skill lives in [`skills/ui-recast/`](skills/ui-recast/SKILL.md). Its instructions and references are in English and require no other skill.

## Use the skill

```text
Use $ui-recast to rebuild this component: <reference URL>
Capture the complete interaction first. Compare colors, icons, light effects,
and subtle transitions, then deliver runnable source and reference comparisons.
Preserve my specified business state and interaction semantics.
```

Screenshots and videos are valid inputs too. With a single frame, timing and hidden interactions remain unverified rather than being presented as observed behavior.

## Run the case lab

Requires Node.js 22.12+ or a newer version supported by the included Vite release.

```sh
cd cases/ui-lab
npm ci
npm run dev -- --port 4187
```

Open `http://127.0.0.1:4187/batch`. Switch between live examples and paired recordings. The MenuFold collection is at `/batch?collection=menufold`; earlier examples include `/thinking-loader` and `/agent-graph`.

```sh
npm run build
npm run preview -- --port 4192
```

Reusable source is in `cases/ui-lab/src/components/`. Fixtures and example state live in `src/batch/` or `src/studies/`. Business actions remain the caller's responsibility.

## Reuse a component

Copy its TSX, CSS, and required relative dependencies. The included registry files list actual source bodies and dependencies. While the lab is running:

```sh
npx shadcn@4.23.0 add http://127.0.0.1:4187/r/fluid-notch.json
```

See the [integration notes](docs/menufold/source-delivery.md) for caller responsibilities. `DetailAccordion` also requires `auto-height.tsx` and `auto-height.css`.

## Evidence and limits

- [MenuFold motion review](docs/menufold-review/README.md) and [color review](docs/menufold-color/README.md) record fixes, installation checks, and verified behaviors.
- [AffectUI review](docs/affectui-review/README.md) retains delivered group findings; final acceptance of the entire additional batch remains unfinished.
- The exported lab passed an independent build and rendering checks for 46 routes, with no page errors or local resource 404s. See [the recorded result](docs/verification/standalone.json).
- Native recordings are 25fps. They do not establish millisecond or pixel-perfect equivalence. Product adaptations and remaining font, icon, and curve differences are documented per case.
- Reference previews, brands, and public-source assets retain their respective rights. Provenance is recorded in case analyses. No repository-wide open-source license has been assigned.
