# App Shell Flat — evidence and independent reconstruction

Source: https://www.affectui.com/screens/app-shell-flat and its rendered full preview https://www.affectui.com/screens/app-shell-flat/full . Chosen style: Clean, light. Desktop viewport 1440×1000 CSS px, DPR 1. Mobile viewport 390×844. Browser: isolated Chrome via Playwright, no personal profile.

## Evidence boundary

The actual public full preview was recorded before implementation. The initial capture is retained in `reference/initial-recording/`; it exposed scheduling/duplicate-frame problems. A second native continuous capture uses tiny colored phase markers at the lower right and preserves `reference/full-lifecycle.webm`. `reference/lifecycle.webm` trims pre-observation time and crops to the full-screen component, which occupies the viewport. Replica uses the same action chain and dimensions. Reset is outside the replica crop. Screenshots and dense measurements were separate from video captures.

Rendered installation text confirms the Pro gate (`reference/source-gate.json`). A public registry URL was not exposed in the inspected rendered page; no address was guessed and no registry body was read. DOM/computed styles, CSS animations through the public Animation API, and rendered SVG geometry are the only implementation measurements. `rendered-icons.json` records SVG provenance; `additional-details.json` includes popup glyphs and animation keyframes. Neither bundled code nor React internals were inspected.

## Structure and layout

Measured default: 272px sidebar; 48px horizontal header; 1px #ebebeb separator; sidebar #f8f8f8; white page. Sidebar padding 12px 10px 10px, workspace 28px head, nav starts at y104, 30px menu rows, 13.5px body labels. Inter font. Account sits at y956 with 34px height. News occupies 122px including a 30px staggered back card; setup summary is 70px high at y878. Content centers a 430×122 empty state in the remaining 1167×952 area.

There is one sidebar and one principal vertical scroll owner (`main`). A drag strip changes the sidebar between the publicly measured 220px and 380px limits. Below 900px the same sidebar becomes a 264px drawer at the viewport/container top with a 28% black scrim. The page retains its full width. Header can be omitted by the caller, as observed when public navigation changes to another screen.

## Four visual tracks

**Icons.** Thin 1.9px paths in 24×24 view boxes displayed at 16px, chevrons/close at 13px, empty-state document at 18px. Static shell glyphs have no spinner or continuous loop. Accordion chevrons rotate on expansion. Setup completion marks have a measured 420ms scale(.5) → 1 / opacity 0 → 1 animation. Rendered SVG assets were retained with provenance; check and plus symbols are simple native SVG equivalents. Evidence: default/workspace/profile/guide PNGs, guide contact sheets, `additional-details.json`.

**Light and surface.** No glow, shimmer, moving light or loading loop appears. Gray row hovers use 140ms background/color transitions, menus use 120ms. The card boundaries use a 1px shadow; expanded guide shadow changes over 200ms from subtle 0 2px 6px to 0 8px 24px -10px. Scrim opacity transitions over 300ms. Source/replica actual hover, popup, guide and mobile frames cover these surfaces.

**Text.** Nav labels remain in a fixed-width sidebar and fade with its opacity. Workspace/account popovers enter over 220ms with opacity 0 → 1 and scale(.96), translateY(-4px/+4px). Setup content uses a measured 360ms opacity fade and translateY(6px) → 0. Group tasks fade/translateY(-4px) over 260/320ms with an 80ms opening delay; completed task labels strike through. The summary changes 13% → 25% after completing one additional task. There is no generated text stream or autonomous text loop.

**Layout.** Shell grid columns animate over 420ms cubic-bezier(.22,1,.36,1), while sidebar opacity takes 260ms and translate changes by -16px. Main white surface occludes the receding sidebar; this was corrected after frame comparison. The open icon becomes available with a delayed fade. Guide grows upward from 70px to approximately 259px over 480ms using the same easing, keeps the account anchor stationary, and changes radius 12 → 14px. Its embedded setup content is measured at CSS zoom .86; nominal 14px group text therefore renders at about 12px. Group panels transition grid rows over 380ms. The progress fill uses a 700ms transform transition. Desktop interruption/reversal, reopening, mobile drawer and resize are captured.

## State ownership and interactions

The reusable component owns only visual sidebar/menu state and width. Its `children`, `sidebarFooter`, `header`, `nav`, `groups`, `projects`, `workspaceMenu`, `profileMenu` and callbacks receive caller state. The demo owns active navigation, setup task completion and update cards. Public Search, Share, More and Full changelog showed no resulting UI panel; demo follows that observation without fake backend results.

The recorded chain includes nav hover, Search, workspace menu and outside dismissal, account menu/Escape, setup guide/group/task/progress/close, update-card dismissal, collapse/expand/reverse, Share/More, reset, workspace/account retrigger, navigation and reset. Supplementary videos cover sidebar resize limits and the mobile drawer chain.

## Comparison and corrections

Default region measurements match the reference: sidebar width/height, nav row positions, account anchor, guide summary, empty-state block and the 48px header. Actual same-state screenshots were viewed rather than relying on computed dimensions alone. Intermediate video contact sheets were viewed for collapse, popup, setup opening/group selection and update-card replacement.

Comparison revealed and corrected a 48px mobile drawer offset caused by absolute grid placement; the drawer now starts at y0. Frame review also revealed that the replica sidebar painted above the expanding main surface; stacking now matches the source occlusion. Mobile video comparison additionally showed that Escape closes both the workspace menu and the drawer; the replica now follows that behavior. Keyboard verification found ArrowDown on an account trigger scrolled the page; it now focuses the first menu item. Targeted strict TypeScript and the browser verification were rerun after these fixes.

## Known limits

No claim of pixel-perfect or 1:1 equivalence. Only Clean/light is assessed. Source navigation opens separate Files/Folder applications; the replica intentionally demonstrates caller content slots, so those data regions visibly differ. Menu business actions are unbound in the demo. Update-card dismissal motion is fitted; exact original removal keyframes were not recovered. Browser video is 25fps (40ms encoded intervals), contains repeated frames under shared-host load, and some phase-marker colors quantize ambiguously. Short motion timing is supported by independent computed animation records and rAF traces; contact sheets must be aligned at visible transition onset. The tiny lower-right marker is recording annotation, not part of either shell.
