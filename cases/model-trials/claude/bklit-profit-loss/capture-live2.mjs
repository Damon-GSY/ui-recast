import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/profit-loss-line', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);

const probe = await page.evaluate(() => {
  const svgs = [...document.querySelectorAll('svg')];
  const chartSvg = svgs.find(s => s.querySelector('clipPath'));
  if (!chartSvg) return { error: 'no chart svg', svgCount: svgs.length };
  const r = chartSvg.getBoundingClientRect();
  const out = {
    svgBox: { w: Math.round(r.width), h: Math.round(r.height), ratio: (r.width / r.height).toFixed(3) },
    viewBox: chartSvg.getAttribute('viewBox'),
    preserveAspectRatio: chartSvg.getAttribute('preserveAspectRatio'),
  };
  out.groups = [...chartSvg.querySelectorAll('g')].slice(0, 3).map(g => g.getAttribute('clip-path'));
  out.paths = [...chartSvg.querySelectorAll('path')].map(p => ({
    stroke: p.getAttribute('stroke'), width: p.getAttribute('stroke-width'),
    cap: p.getAttribute('stroke-linecap'), join: p.getAttribute('stroke-linejoin'),
    d0: (p.getAttribute('d') || '').slice(0, 40), opacity: p.getAttribute('opacity'),
  })).filter(p => p.stroke && p.stroke !== 'none' && p.width !== '0').slice(0, 8);
  out.allPaths = chartSvg.querySelectorAll('path').length;
  out.gridLines = [...chartSvg.querySelectorAll('line')].map(l => ({
    stroke: l.getAttribute('stroke'), width: l.getAttribute('stroke-width'),
    dash: l.getAttribute('stroke-dasharray'), opacity: l.getAttribute('stroke-opacity'),
    x1: l.getAttribute('x1'), x2: l.getAttribute('x2'),
  })).slice(0, 8);
  out.texts = [...chartSvg.querySelectorAll('text')].map(t => {
    const cs = getComputedStyle(t);
    return { txt: t.textContent, fill: cs.fill, fontSize: cs.fontSize, family: cs.fontFamily.slice(0, 60), weight: cs.fontWeight, anchor: cs.textAnchor };
  }).slice(0, 8);
  const rect = chartSvg.querySelector('clipPath rect');
  out.clip = { x: rect?.getAttribute('x'), y: rect?.getAttribute('y'), w: rect?.getAttribute('width'), h: rect?.getAttribute('height') };
  out.clipParent = rect?.closest('clipPath')?.getAttribute('id');
  // resolved CSS custom props on the chart container
  const host = chartSvg.closest('div')?.parentElement || document.body;
  const cs = getComputedStyle(host);
  out.tokens = {
    chartPositive: cs.getPropertyValue('--chart-positive').trim(),
    chartNegative: cs.getPropertyValue('--chart-negative').trim(),
    chartGrid: cs.getPropertyValue('--chart-grid').trim(),
    chartLabel: cs.getPropertyValue('--chart-label').trim(),
    foreground: cs.getPropertyValue('--foreground').trim(),
    chartFgMuted: cs.getPropertyValue('--chart-foreground-muted').trim(),
  };
  // legend markers below chart
  const legend = [...document.querySelectorAll('span')].filter(s => /Profit|Loss/.test(s.textContent || '') && s.closest('div')?.querySelector('[class*="rounded-full"]'));
  const marker = document.querySelector('span.rounded-full');
  if (marker) {
    const mr = marker.getBoundingClientRect();
    const mcs = getComputedStyle(marker);
    out.legendMarker = { w: mr.width, h: mr.height, bg: mcs.backgroundColor, radius: mcs.borderRadius };
  }
  const legendLabel = [...document.querySelectorAll('span')].find(s => s.textContent?.trim() === 'Profit');
  if (legendLabel) {
    const lcs = getComputedStyle(legendLabel);
    out.legendLabel = { size: lcs.fontSize, color: lcs.color, family: lcs.fontFamily.slice(0, 60), weight: lcs.fontWeight };
  }
  return out;
});
console.log(JSON.stringify(probe, null, 1));
await browser.close();
