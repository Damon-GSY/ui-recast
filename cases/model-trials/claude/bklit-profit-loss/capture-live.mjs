// Live capture of the bklit Profit/Loss Line demo: rendered measurements.
import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/profit-loss-line', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);

const probe = await page.evaluate(() => {
  const svg = document.querySelector('main svg, [data-slot="component-preview"] svg, article svg') || document.querySelector('svg');
  const out = { url: location.href, svgFound: !!svg };
  if (!svg) return out;
  const r = svg.getBoundingClientRect();
  out.svgBox = { w: Math.round(r.width), h: Math.round(r.height), ratio: (r.width / r.height).toFixed(3) };
  out.viewBox = svg.getAttribute('viewBox');
  // paths = line segments
  const paths = [...svg.querySelectorAll('path')].map(p => ({
    stroke: p.getAttribute('stroke'), width: p.getAttribute('stroke-width'),
    cap: p.getAttribute('stroke-linecap'), len: Math.round(p.getTotalLength?.() || 0),
    opacity: p.getAttribute('opacity'),
  })).filter(p => p.stroke && p.stroke !== 'none');
  out.paths = paths.slice(0, 6);
  out.pathCount = paths.length;
  // lines = grid
  const lines = [...svg.querySelectorAll('line')].map(l => ({
    stroke: l.getAttribute('stroke'), width: l.getAttribute('stroke-width'),
    dash: l.getAttribute('stroke-dasharray'), opacity: l.getAttribute('stroke-opacity'),
    y1: l.getAttribute('y1'), y2: l.getAttribute('y2'),
  }));
  out.gridLines = lines.slice(0, 8);
  out.lineCount = lines.length;
  // text labels
  const texts = [...svg.querySelectorAll('text')].map(t => {
    const cs = getComputedStyle(t);
    return { txt: t.textContent, fill: cs.fill, fontSize: cs.fontSize, font: cs.fontFamily, weight: cs.fontWeight };
  });
  out.texts = texts.slice(0, 6);
  // clipPath rect
  const clipRect = svg.querySelector('clipPath rect');
  out.clipRect = clipRect ? { x: clipRect.getAttribute('x'), width: clipRect.getAttribute('width'), height: clipRect.getAttribute('height') } : null;
  const clipPath = svg.querySelector('clipPath');
  out.clipId = clipPath ? clipPath.getAttribute('id') : null;
  return out;
});
console.log(JSON.stringify(probe, null, 1));

// Entry animation: reload, sample clip rect width over time
await page.reload({ waitUntil: 'domcontentloaded' });
const widths = [];
for (let i = 0; i < 14; i++) {
  await page.waitForTimeout(120);
  const w = await page.evaluate(() => {
    const rect = document.querySelector('svg clipPath rect');
    return rect ? Number(rect.getAttribute('width')) : null;
  }).catch(() => null);
  widths.push(w);
}
console.log('clipWidth@120ms-steps:', JSON.stringify(widths));
await browser.close();
