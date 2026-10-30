# Questionnaire — official live capture and controlled implementation

Reference: [Animate UI — Base UI Questionnaire](https://animate-ui.com/docs/primitives/base-ui/questionnaire). Captured 2026-10-29 in fresh-profile, headless Chrome. **The final reference recording is the real public website, not an isolated source replay.** Earlier load/hydration failures remain in local evidence; the successful capture waited for the public rendered primitive to become ready and completed the entire interaction chain.

## Sources and exact runtime versions

| Item | Version / identity | Primary source |
|---|---|---|
| Animated primitive | `@animate-ui/react@2.4.1`, `v2.4.1` | [Official questionnaire source](https://github.com/imskyleen/animate-ui/blob/v2.4.1/packages/react/src/primitives/questionnaire/index.tsx) |
| Headless primitive | `@shadcn/react@0.3.1`, `@shadcn/react@0.3.1` tag | [Official source](https://github.com/shadcn-ui/ui/tree/%40shadcn%2Freact%400.3.1/packages/react/src/questionnaire) |
| Original entry / style composition | Animate UI `v2.4.1` | [Original public demo](https://github.com/imskyleen/animate-ui/blob/v2.4.1/apps/v2/demos/base-ui/questionnaire.tsx) |
| API cross-check | Official docs, retrieved 2026-10-29 | [Headless API](https://ui.shadcn.com/docs/react/questionnaire), [styled component](https://ui.shadcn.com/docs/components/base/questionnaire) |

The original tagged source, entry, global/button styles, published npm JS/types/package files and full licenses are retained under `evidence/integration-supplement/questionnaire/upstream/`. Detailed API/adaptation ledger: `notes/questionnaire/source-api-ledger.md`.

**Animate UI is MIT + Commons Clause, not plain MIT.** shadcn/react is MIT. Local distribution contains the adapted wrapper, scoped CSS and license notice with exact npm dependencies. Original upstream code remains local evidence and is not copied into the public registry. Outfit is a Study-only font under SIL OFL; production inherits the host font. No additional runtime icon/UI package is required.

## Files and capture conditions

- Production: `src/components/questionnaire.tsx`, `src/components/questionnaire.css`, `src/components/questionnaire/UPSTREAM-LICENSE.md`.
- Study/host adapter example: `src/batch/questionnaire/Study.tsx`, `study.css`, `assets/Outfit.ttf` and `OFL.txt`.
- Both native full-page recordings: `{reference,replica}/native.webm` at 1440 × 1000, nominal 25 fps.
- Comparison recordings: `{reference,replica}/lifecycle.webm`, 496 × 500, unchanged playback speed. They retain the initial idle, validation, selection and all later actions. Reference trim begins at native 37.50s; replica trim at 0.94s.
- Initial questionnaire dimensions match: **448 × 381.5 px**. Source and Study use Outfit in the reference comparison.
- The first step transition is visually aligned around reference native 40.80s / replica native 4.24s (about 3.30s in each comparison clip). `actions.json` retains original request/completion wall-clock times; these are not presented as video PTS.
- `storyboard-native.png` covers the full interaction at one-second samples. `step-frames/transition.png` shows sixteen consecutive native frames at roughly 40ms spacing, without interpolation. Earlier source screenshots and visible DOM/computed styles are in `reference/initial.png` and `reference/visible-dom.json`.

Native recording, later frame extraction and sequential encoding were separate stages. No React internals, Pro source or protected bundles were inspected.

## Recorded workflow

Both: initial → required-answer error → single selection → next question → two checked choices → previous question → freeform answer → return to multiple choice → explicit Skip → final fixed answer → explicit submit.

The live reference then navigates backwards twice, changes the first answer and advances again. The replica instead shows the requested host integration lifecycle: pending → explicit error response → acknowledge error → explicit retry → accepted response → reset. Those host states are purpose-built Study fixtures, not claimed public-reference states.

The original untrimmed reference contains the site's submission notification; the comparison crop follows the questionnaire region, so the site's separate toast is outside that crop.

## Four visual tracks

| Track | Observed evidence and implementation |
|---|---|
| Icons | Native radio/checkbox indicators preserve the 16px outline, 8px radio dot and check geometry. The reference checkbox first fills, then draws its check; the replica uses the same versioned primitive and visible SVG path. Selection is visible in both full storyboards. |
| Light / color | No glow or light sweep appears in this target. The relevant track is the indicator fill/border color, selected-row tint and focus ring. The published primitive uses a 200ms color transition. Local dark-token inheritance was corrected after screenshot inspection; refreshed dark/mobile screenshots show readable text and subdued borders. |
| Text | Outgoing question content fades/slides with blur; incoming content follows after the exit. The progress digit changes separately. Original `v2.4.1` tokens specify 24px step shift, 5px panel blur, 150ms exit, 300ms entry; the consecutive reference frames show the outgoing → nearly empty → incoming progression. These numbers are source-verified parameters, not claimed live curve-fit measurements. |
| Layout | Title/progress anchors remain stable while fieldset height and actions move. Published height timing is 450ms. Both clips show reverse navigation and the taller three-choice/free-input question changing to the shorter multi-choice question. The same official primitive owns interruption, height, count and indicator animation in the replica. |

Static initial geometry and wrapping were directly inspected side by side. Native frame strips support the sequence and relative rhythm; no dense live-browser curve fitting was run during recording, and no pixel-perfect or sub-frame equivalence claim is made.

## API and application boundaries

The actual upstream namespace provides `Root`, `Progress`, `Item`, `Title`, `Description`, `Choices`, `Choice`, `ChoiceInput`, `ChoiceLabel`, `ChoiceShortcut`, `Input`, `Error`, `Previous`, `Skip`, `Next`, `Submit`. `Root` is a native form; step control is `item/onItemChange`. Answer control is on `Choice.checked/onChange` and `Input.value/onChange`. There is no invented upstream `answers` or `onComplete` API.

The separately named local `SequentialQuestionnaire` adapter requires external `answers`, `activeQuestion` and change callbacks. Draft restoration means the host supplies those controlled values again. It adds an explicit final confirmation boundary: choosing never advances; Enter in an answer advances or focuses the final confirmation; final Skip records intent without submitting. Submission passes both structured answers and native FormData, with repeated fields for multiple answers and no field for intentional skips.

The host owns expiry, draft persistence, submission responses and error acknowledgement. Pending/expired states preserve the answers. Error acknowledgement alone never retries. The Study implements only in-memory fixtures and manual host responses; no real backend, jobs, SSE, files, storage service or deadline contract is asserted.

## Verification

`evidence/integration-supplement/questionnaire/verification.json` records 14 passing real-Chrome behavior checks: required validation; letter shortcuts; multiple checked values; final-answer Enter; explicit keyboard submission; repeated FormData values; pending/error handling; explicit acknowledgement/retry; remounted draft restoration including Skip; expiry preservation; freeform/single replacement; last-question Skip; 390px layout; reduced motion; and no page errors (some checks combine related assertions).

The initial, dark and 390px screenshots were inspected. `theme-verification.json` confirms dark text/background/border after the CSS inheritance correction. TypeScript passed. Main integration separately reported exact-version registry installation, file-body comparison, independent consumer build and seven grouped consumer behavior checks; those main-owned results are not relabeled as worker tests here.

## Known limitations / intentional differences

- This is a faithful source-based composition with an explicit controlled host adapter, not a claim of complete 1:1 parity. Small shortcut-key font and focus/error decoration differences remain; in particular, the freeform input's invalid border is less emphatic than the reference's red input ring.
- When switching from typed freeform to a fixed single choice, the adapter clears the inactive freeform text. The upstream uncontrolled demo can retain that text visually while submitting only the selected answer. This is an explicit controlled-answer policy.
- Pending, expiry, acknowledgement and accepted states are local host-integration examples. Their behavior was tested, but they have no original-page counterpart for visual parity.
- Mobile and dark local behavior were checked; only the light desktop workflow has a full matching public-reference recording. Nominal 25fps recordings cannot establish sub-frame timing.
