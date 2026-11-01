import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/profit-loss-line', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2200);
// The chart overlay listens for pointermove; sweep horizontally across the plot at line height
const box = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('clipPath'));
  const r = svg.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
for (const fx of [0.2, 0.35, 0.45, 0.55]) {
  await page.mouse.move(box.x + box.w * fx, box.y + box.h * 0.55, { steps: 8 });
  await page.waitForTimeout(250);
}
await page.waitForTimeout(500);
const found = await page.evaluate(() => {
  const all = [...document.querySelectorAll('div')];
  const panel = all.find(d => {
    const cs = getComputedStyle(d);
    return cs.borderRadius.includes('px') && parseFloat(cs.borderRadius) >= 10 && d.textContent && /\d{3,}/.test(d.textContent) && d.offsetWidth >= 100 && d.offsetWidth <= 300 && d.offsetHeight >= 50 && cs.position !== 'static';
  });
  if (!panel) return { found: false };
  const cs = getComputedStyle(panel);
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('clipPath'));
  const circles = [...svg.querySelectorAll('circle')].map(c => ({ r: c.getAttribute('r'), fill: c.getAttribute('fill'), stroke: c.getAttribute('stroke'), opacity: c.getAttribute('opacity') }));
  const vl = [...svg.querySelectorAll('line')].filter(l => l.getAttribute('y1') !== l.getAttribute('y2') || (l.getAttribute('x1') === l.getAttribute('x2'))).map(l => ({ stroke: l.getAttribute('stroke'), dash: l.getAttribute('stroke-dasharray'), x1: l.getAttribute('x1') }));
  const rect = panel.getBoundingClientRect();
  return {
    found: true, text: panel.textContent.slice(0, 120),
    bg: cs.backgroundColor, radius: cs.borderRadius, border: cs.border.slice(0, 60), shadow: cs.boxShadow.slice(0, 100),
    minw: cs.minWidth, pos: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
    circles, verticalLines: vl.slice(0, 3),
  };
});
console.log(JSON.stringify(found, null, 1));
await browser.close();
