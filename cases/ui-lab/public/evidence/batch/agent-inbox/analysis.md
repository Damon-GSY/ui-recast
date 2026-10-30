# Agent Inbox — public-preview reconstruction

Source: https://www.affectui.com/components/agent-inbox, observed 2026-10-29. Clean style, light theme, Inter, desktop viewport 1440×1800, component width 718px. No Pro TSX, JS bundle, registry response body, or React internals were inspected. Rendered DOM/SVG, computed styles, CSS/WAAPI animation measurements, public interface prose and actual recordings supplied the evidence.

## Source access and recording

The installation section explicitly says “Agent Inbox is a Pro component.” Usage and examples are also gated. No registry address was visible in the inspected public links, so no guessed HEAD request was sent. See `reference/source-gate.json`, `reference/public-docs.txt`, and `reference/rendered-icons.json`.

`reference/public-preview-full-lifecycle.webm` preserves the unmodified public documentation page. Its fixed 720px stage clips the bottom of a long list. For the main comparison recording only the surrounding documentation stage was enlarged to 1140px, aligned at the top, with 80px top padding and auto-height demo wrappers. The actual component remained 718px wide with its own styles, data and timings untouched. This prevents clipping and keeps the component at x=485,y=429 throughout the capture. The full framed source is `reference/full-lifecycle.webm`; `reference/lifecycle.webm` is its crop with 8px breathing room. The replica preserves the same action chain and component width. Both cropped videos are 734×948. Both full videos retain page context.

Recording uses isolated headless Chrome, no personal profile and no screenshots during video capture. Playwright's actual 25fps stream is preserved; no frame interpolation. A visible corner marker and the recorded reset event place reset near 0.18s in each crop. This establishes a repeatable starting point, but transition comparisons use actual rendered transition starts and layout trajectories, not timestamps alone. Separate requestAnimationFrame measurements sampled roughly 60fps. Some public-video frames repeat; the source expansion opacity in particular is less continuous in the recording than in the measured renderer. Do not infer a new timing curve from repeated video frames.

## Observed structure and behavior

The public default is **Board**, with columns Needs you (waiting + failed), Running, and Done. The List radio rearranges the same groups vertically. Despite the marketing description's “filter tabs,” no status filter controls are present in this public preview. No invented filter UI was added.

Five original fixtures are preserved: Migrate users table, Clean up CRM contacts, Review PR #482, Release notes v2.4, Weekly metrics digest. Cards show a status-colored spark, title, two-line description, status/timer, source and tool counts. Opening a card reveals the agent, last four steps and appropriate actions. Only one card opens at a time. Open has no visible in-component navigation in the source demo. Empty groups say “Nothing here.”

The public preview automatically opens Migrate at about 0.7s, approves at 3.3s, closes details at 4.7s, completes at 7.5s and resets at 11.7s. Pointer/keyboard interaction takes over. The same schedule exists only in Study. Manual approve/retry fixture completion also lives in Study, after 4.2s. Reusable AgentInbox never advances or mutates a job status.

## Four visual tracks

**Icons.** Spark is a filled asymmetric four-point star plus a small circle; its color transitions over 300ms. The running indicator is a pale 12px ring and bright quarter arc rotating as a whole, linear, once every 900ms. Waiting uses a filled triangle; failure a red circle with a white exclamation; done a small green disc. Status-icon arrival scales 0.6→1 and fades 0→1 over 360ms, cubic-bezier(.32,.72,.24,1). Source/tool and Board/List geometry was transcribed from public rendered SVG, with provenance in `reference/rendered-icons.json`. See `frames/spinner`, `spinner-contact-sheet.png`, `rendered-animations.json` and `dense-expand.json` on each side.

**Light/shadow.** This Clean/light variant has no animated glow, bloom, sweep, spotlight, or separate lighting layer. Cards have a one-pixel gray shadow-border and low resting shadow. Hover/open changes the shadow in 200ms; buttons change background in 160ms; view radios transition background, text color and shadow in 180ms. These are the observed light-related effects, not an omitted decorative glow.

**Text.** Fonts are Inter 13px/20px body, 14px/20px medium titles, 12.5px statuses/actions/timeline, 11px uppercase tracked group labels. Timers and metadata are tabular numerals. Timers tick once each second; counts update directly rather than rolling. Expanded detail opacity has a 100ms delay, then a 320ms ease transition; closing opacity takes 240ms. The body description unclamps on expansion. Stable text does not independently blur or translate.

**Layout.** Desktop grid gap 8px; lane padding 4px/radius 14px; card gap 6px/radius 10px. Card main padding 12px 14px 12px 12px. At 718px, board lanes are 234px and cards 226px; list cards 710px. Expansion uses 0fr→1fr over 460ms with cubic-bezier(.32,.72,.24,1). A new authoritative status is rendered in place immediately, then visual lane membership updates after 900ms and cards translate to their new positions over 560ms on the same curve. The replica implements these measured effects with CSS and WAAPI. At a container below 620px, the selected Board/List preference remains intact while layout is forced to one column and the radios disappear; a Board preference retains compact status text and unindented body text. Reduced motion switches instantly.

## Comparison and corrections

Before implementation the original full lifecycle was recorded and extracted frames were viewed. Initial source evidence included default, expanded waiting, approval-in-place, cross-column intermediate frames, running, completion, List, failed details, Retry, Reject, Done/Open, Running/Open, reverse collapse, hover and reset/retrigger.

Replica recordings and actual extracted frames were then viewed, including expansion, moving cards and complete loading cycles. Comparison led to concrete corrections: added the empty-lane message, implemented Board/List FLIP, used tabular metadata digits, preserved trailing status-text spacing, fixed an automatic demo reset that briefly retained the previous lane, and corrected narrow layout semantics. The corrected reset now returns Migrate directly to Needs you in both timelines at approximately 11.9s. Static board/list dimensions coincide (328px closed board; 593px waiting-detail board; 867px waiting-detail list).

`reference/dense-expand.json` and `replica/dense-expand.json` record transitionrun/start/end plus 108–109 actual samples over 1.8s. On the measured 246px fold, the trajectories after first visible growth agree at approximately 20.58, 133.59, 207.4, 230.1, 241.8, 245.59 and 246px at 0/80/160/240/320/400/480ms. Opacity delays and end events follow the same observed CSS timings. This is renderer evidence for the expansion, not a claim that every encoded video frame is identical.

## Verification and limits

`verification.json` records 12 passing browser checks and no page errors in that verification run. They exercise external authority for approve/reject/retry, both Open callbacks, keyboard Enter, Escape focus restoration, inert closed content, controlled view, delayed external regroup, interrupted status updates, absence of automatic job progression, 316px container layout, reduced motion and the integrated batch route. Targeted strict TypeScript compilation passed for the component, Study and contract fixture. No shared production build, package install, registry regeneration, commit, or other component edit was performed.

The selected scope is Clean/light Board and List plus their narrow layout. Dark CSS is provided but was not visually calibrated against a dark reference. Classic and gated example variants were not observed. Live clocks and spinner phase are not synchronized across browser processes; a one-second timer boundary or arc angle may differ in paired stills. Native video is 25fps and includes repeated frames; it cannot prove sub-frame identity. Reset-aligned contact sheets retain a few frames of cross-browser phase offset, especially during cross-column movement. The source documentation's original clipping is preserved in the unmodified recording, while main comparison media uses the explicitly enlarged surrounding stage. The full observed light interaction chain has been reconstructed and checked; no universal 1:1 claim is made.

Earlier capture attempts encountered ambiguous hidden Open buttons and one Vite HMR page reload during concurrent integration. The final script scopes Open to its task and disables only the replica dev-server WebSocket for recording, leaving component behavior unchanged. These were capture tooling issues; final recorded page-error arrays are empty.
