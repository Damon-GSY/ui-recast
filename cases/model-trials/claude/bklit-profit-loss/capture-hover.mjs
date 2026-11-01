import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/profit-loss-line', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2200);

// find chart svg bounding box, hover mid-chart
const box = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('clipPath'));
  const r = svg.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
await page.mouse.move(box.x + box.w * 0.45, box.y + box.h * 0.5);
await page.waitForTimeout(600);
const tooltip = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('div')].filter(d => {
    const cs = getComputedStyle(d);
    return cs.position === 'absolute' && d.offsetWidth > 40 && d.offsetWidth < 260 && d.offsetHeight > 24 && d.offsetHeight < 90 && d.textContent && /Profit|Loss|pnl|[-−]?\d/.test(d.textContent);
  });
  const t = nodes.at(-1);
  if (!t) return null;
  const cs = getComputedStyle(t);
  return { text: t.textContent, bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius, border: cs.border, shadow: cs.boxShadow.slice(0, 80), font: cs.fontSize, padding: cs.padding, pos: { x: Math.round(t.getBoundingClientRect().x), y: Math.round(t.getBoundingClientRect().y) } };
});
console.log('TOOLTIP:', JSON.stringify(tooltip, null, 1));
// crosshair/dot indicator inside svg during hover
const hoverProbe = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('clipPath'));
  const circles = [...svg.querySelectorAll('circle')].map(c => ({ r: c.getAttribute('r'), fill: c.getAttribute('fill'), stroke: c.getAttribute('stroke'), sw: c.getAttribute('stroke-width') }));
  const extraPaths = [...svg.querySelectorAll('path')].length;
  const lines = [...svg.querySelectorAll('line')].length;
  const rects = [...svg.querySelectorAll('rect')].map(r2 => ({ fill: r2.getAttribute('fill'), w: r2.getAttribute('width') })).slice(0, 4);
  return { circles, pathCount: extraPaths, lineCount: lines, rects };
});
console.log('HOVER-STATE:', JSON.stringify(hoverProbe, null, 1));
await page.screenshot({ path: '/tmp/ui-recast-standalone/profit-loss/upstream-tooltip.png', clip: { x: box.x - 20, y: box.y - 20, width: box.w + 40, height: box.h + 80 } });

// legend hover → dim opposite segment
const lossLabel = page.locator('span', { hasText: /^Loss$/ }).last();
await lossLabel.hover();
await page.waitForTimeout(400);
const dimProbe = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('clipPath'));
  return [...svg.querySelectorAll('path')].filter(p => p.getAttribute('stroke-width') === '2.5')
    .map(p => ({ stroke: p.getAttribute('stroke'), opacity: p.getAttribute('opacity'), styleOpacity: p.style.opacity, transition: p.closest('g')?.style.transition }));
});
console.log('LEGEND-HOVER:', JSON.stringify(dimProbe, null, 1));
await page.screenshot({ path: '/tmp/ui-recast-standalone/profit-loss/upstream-legend-hover.png', clip: { x: box.x - 20, y: box.y - 20, width: box.w + 40, height: box.h + 80 } });
await browser.close();
