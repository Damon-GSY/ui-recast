// Self-verify the reproduction: console errors, geometry probes, 3 screenshots.
import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';

const DIR = '/tmp/ui-recast-standalone/profit-loss';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

// Pass 1: entry-frame screenshot (~330ms into the 1100ms reveal)
await page.goto(`file://${DIR}/index.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(330);
const entryProbe = await page.evaluate(() => {
  const rect = document.querySelector('#chart clipPath rect');
  return { clipW: rect ? Number(rect.getAttribute('width')) : null };
});
await page.screenshot({ path: `${DIR}/shot-entry.png`, clip: { x: 84, y: 60, width: 1032, height: 420 } });

// Pass 2: settled state + interaction probes
await page.goto(`file://${DIR}/index.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
const settled = await page.evaluate(() => {
  const rect = document.querySelector('#chart clipPath rect');
  const paths = [...document.querySelectorAll('#chart path[stroke-width="2.5"]')];
  const grid = [...document.querySelectorAll('#chart line[stroke-dasharray]')];
  const zero = [...document.querySelectorAll('#chart line[stroke-opacity="0.35"]')];
  const ticks = [...document.querySelectorAll('.xtick')].map(t => t.textContent);
  // defect check: any exact zero in demo data?
  const zeroVals = [];
  const segs = paths.map(p => ({ stroke: p.getAttribute('stroke'), d0: p.getAttribute('d').slice(0, 60) }));
  return {
    clipW: rect ? Number(rect.getAttribute('width')) : null,
    segmentCount: paths.length, segments: segs,
    gridCount: grid.length, zeroLineCount: zero.length,
    xTicks: ticks,
  };
});
await page.screenshot({ path: `${DIR}/shot.png`, clip: { x: 84, y: 60, width: 1032, height: 420 } });

// tooltip interaction: sweep across the plot
const svgBox = await page.locator('#chart').boundingBox();
await page.mouse.move(svgBox.x + svgBox.width * 0.45, svgBox.y + svgBox.height * 0.5, { steps: 6 });
await page.waitForTimeout(350);
const tooltipProbe = await page.evaluate(() => {
  const tip = document.getElementById('tooltip');
  const cs = getComputedStyle(tip);
  return {
    visible: !tip.classList.contains('hidden'),
    text: tip.textContent.replace(/\s+/g, ' ').trim(),
    bg: cs.backgroundColor, radius: cs.borderRadius, border: cs.borderTopColor,
    minw: cs.minWidth, w: tip.offsetWidth, h: tip.offsetHeight,
    dotVisible: [...document.querySelectorAll('#chart circle')].every(c => c.getAttribute('visibility') === 'visible'),
  };
});
await page.screenshot({ path: `${DIR}/shot-tooltip.png`, clip: { x: 84, y: 60, width: 1032, height: 420 } });
await page.mouse.move(10, 10);

// legend hover: dim opposite segments
await page.locator('.legend-item[data-index="1"]').hover();
await page.waitForTimeout(400);
const legendProbe = await page.evaluate(() => ({
  fadedItem: document.querySelector('.legend-item.faded')?.textContent?.trim() ?? null,
  groupOpacities: [...document.querySelectorAll('#chart g[opacity]')].map(g => g.getAttribute('opacity')),
}));
await page.screenshot({ path: `${DIR}/legend-hover.png`, clip: { x: 84, y: 60, width: 1032, height: 420 } });

console.log(JSON.stringify({
  consoleErrors, entryProbe, settled, tooltipProbe, legendProbe,
}, null, 1));
await browser.close();
