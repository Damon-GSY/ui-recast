import { mkdirSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const out = '/tmp/ui-recast-standalone/heatmap';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

await page.goto('file://' + out + '/index.html');

// mid-entry shot: the 1600ms ease starts very slow; 800ms in ≈ 1/3 opacity
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/shot-entry.png`, fullPage: true });

// settle, then structural checks against measured upstream values
await page.waitForTimeout(2200);
const checks = await page.evaluate(() => {
  const rects = [...document.querySelectorAll('g.cell rect')];
  const r0 = rects[0].getBBox();
  const rowPitch = rects[2].getBBox().y - rects[1].getBBox().y; // col 0 has one cell; [1],[2] are col 1 rows 0,1
  return {
    cellCount: rects.length,
    cellSize: +r0.width.toFixed(4),
    rowPitch: +rowPitch.toFixed(4),
    rx: rects[0].getAttribute('rx'),
    swatches: document.querySelectorAll('.legend .swatch').length,
    svgW: document.getElementById('chart').getAttribute('width'),
    weekdayLabels: [...document.querySelectorAll('.t-weekday')].map(t => t.textContent).join(''),
    quarterLabels: [...document.querySelectorAll('.t-quarter')].map(t => t.textContent).join(','),
  };
});
console.log('CHECKS:', JSON.stringify(checks));

const card = await page.locator('#card').boundingBox();
await page.screenshot({ path: `${out}/shot.png`, clip: card });

// hover a mid cell (col 30, row 3 → index 213; no ghosts before the last column)
const target = await page.evaluate(() => {
  const b = document.querySelectorAll('g.cell rect')[213].getBoundingClientRect();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
});
await page.mouse.move(target.x, target.y);
await page.waitForTimeout(450);
const hoverChecks = await page.evaluate(() => {
  const gs = [...document.querySelectorAll('g.cell')];
  const hovered = gs.find(g => g.classList.contains('highlight'));
  const other = gs.find(g => !g.classList.contains('highlight'));
  return {
    hoveredOpacity: getComputedStyle(hovered).opacity,
    hoveredTransform: getComputedStyle(hovered).transform,
    otherOpacity: getComputedStyle(other).opacity,
    otherTransform: getComputedStyle(other).transform,
    tooltipShown: document.getElementById('tooltip').classList.contains('show'),
    tooltipText: document.getElementById('tooltip').textContent.replace(/\s+/g, ' ').trim(),
  };
});
console.log('HOVER:', JSON.stringify(hoverChecks));
await page.screenshot({ path: `${out}/hover.png`, clip: card });

console.log('CONSOLE_ERRORS:', errors.length, errors.slice(0, 5));
await browser.close();
const ok = errors.length === 0
  && checks.cellCount === 365
  && checks.swatches === 5
  && hoverChecks.tooltipShown
  && hoverChecks.otherOpacity === '0.8'
  && hoverChecks.otherTransform.includes('0.94');
console.log(ok ? 'VERIFY_OK' : 'VERIFY_FAIL');
if (!ok) process.exit(1);
