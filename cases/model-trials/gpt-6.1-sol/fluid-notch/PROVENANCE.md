# Evidence and asset provenance

- Requested reference: https://ui.aceternity.com/interactions/fluid-notch
- Actual full-screen preview, reached through its visible Open in full screen link: https://ui.aceternity.com/live-preview/fluid-notch
- All reference captures are fresh, independent Chrome output for this trial, dated 2026-10-30. Light default is 960x720, DPR 1; main-page study-control captures and narrow/dark checks record their own conditions.
- `public/assets/avatar-{1,2,3,4,6,7}.webp`: original visible public image assets from `https://assets.aceternity.com/avatars/{1,2,3,4,6,7}.webp`. The corresponding image URLs and names were read from the rendered avatar DOM. No other avatars were fetched.
- `public/assets/inter-variable.woff2`: displayed font asset `https://ui.aceternity.com/assets/InterVariable-DiVDrmQJ.woff2`, discovered through the browser's loaded font resource entry. Observed CSS family was the site's local-font alias; asset filename identifies Inter Variable.
- `public/assets/grain.svg`: visible 160x160 inline SVG background image from the rendered shell style (fractalNoise .9, 3 octaves, white alpha matrix).
- `public/assets/background-grain.svg`: visible 180x180 inline SVG background image from the rendered optional backdrop style (fractalNoise .85, 3 octaves, desaturate).
- The SVG progress/check geometry was independently expressed from the visible SVG output. The implementation itself was independently authored. Visible example copy is retained for direct comparison.
- Original artwork, font, example copy and marks retain their respective ownership; this trial does not claim them as newly authored assets.
- Paid/Pro qualification: `evidence/reference/initial.png` visibly shows the padlock on the Code tab and Get All-Access purchase buttons (header and sidebar). `full-preview.png` also shows the Pro badge beside the component name. The public rendered page states Included with All-Access and explains that preview controls are public while code, CLI/MCP install and prompt require purchase. The implementation/code install is All-Access restricted. Code/Copy prompt/registry/source endpoints were not opened or fetched. No licensing or access restriction was bypassed.

The only external project files read were the explicitly requested UI Recast skill and its three references. Runtime tooling, Playwright and Motion's official public documentation were used as permitted. All trial writes are contained in this trial directory. No shared documentation, commit or push was made.
