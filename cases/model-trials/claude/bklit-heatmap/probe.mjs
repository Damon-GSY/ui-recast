import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const out = '/tmp/ui-recast-standalone/heatmap';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));

await page.goto('https://www.bklit.com/charts/heatmap-chart', { waitUntil: 'networkidle', timeout: 45000 });
// The featured "Contributions" demo is the first HeatmapChart surface.
const probe = await page.evaluate(() => {
  const results = { svgs: [] };
  document.querySelectorAll('svg').forEach((svg, si) => {
    const circles = svg.querySelectorAll('circle');
    if (circles.length < 50) return;
    const fills = {};
    circles.forEach(c => { const f = c.getAttribute('fill'); if (f) fills[f] = (fills[f] || 0) + 1; });
    const first = circles[0], second = circles[1];
    const r1 = first.getBoundingClientRect();
    const r2 = second.getBoundingClientRect();
    const texts = [...svg.querySelectorAll('text')].map(t => ({
      text: t.textContent, fill: t.getAttribute('fill'),
      size: getComputedStyle(t).fontSize, family: getComputedStyle(t).fontFamily,
      weight: getComputedStyle(t).fontWeight, anchor: t.getAttribute('text-anchor'),
    }));
    results.svgs.push({
      index: si, circleCount: circles.length, fillCounts: fills,
      radius: first.getAttribute('r'), cx: first.getAttribute('cx'), cy: first.getAttribute('cy'),
      pitchX: +(parseFloat(second.getAttribute('cx')) - parseFloat(first.getAttribute('cx'))).toFixed(2),
      pitchY: +(parseFloat(second.getAttribute('cy')) - parseFloat(first.getAttribute('cy'))).toFixed(2),
      rect: { x: r1.x, y: r1.y, w: r1.width },
      svgWidth: svg.getAttribute('width'), svgHeight: svg.getAttribute('height'),
      sampleTexts: texts.slice(0, 40),
      opacityFirst: getComputedStyle(first).opacity,
      parentOpacity: getComputedStyle(svg.parentElement).opacity,
    });
  });
  // legend: look for "Less"/"More" text near the demo
  const legend = [...document.querySelectorAll('div,span')].filter(el =>
    el.children.length === 0 && /Less|More/.test(el.textContent || '')).map(el => el.textContent.trim()).slice(0, 4);
  results.legendTexts = legend;
  return results;
});
console.log(JSON.stringify(probe, null, 1).slice(0, 6000));

// hover behavior on the first big demo
const demo = page.locator('svg').filter({ has: page.locator('circle') }).nth(0);
await demo.hover({ position: { x: 300, y: 120 } });
await page.waitForTimeout(600);
const hoverProbe = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelectorAll('circle').length >= 50);
  const circles = [...svg.querySelectorAll('circle')];
  const ops = circles.map(c => getComputedStyle(c).opacity);
  const scales = circles.map(c => getComputedStyle(c).transform);
  return {
    distinctOpacities: [...new Set(ops)],
    dimmedCount: ops.filter(o => parseFloat(o) < 0.95).length,
    sampleTransforms: [...new Set(scales)].slice(0, 4),
  };
});
console.log('HOVER:', JSON.stringify(hoverProbe));
await page.screenshot({ path: `${out}/upstream-hover.png`, clip: { x: 370, y: 480, width: 1000, height: 320 } });

// entry animation: reload, sample a mid cell's opacity at ~250ms and 900ms
await page.reload({ waitUntil: 'commit' });
await page.waitForSelector('svg circle', { timeout: 30000 }).catch(() => {});
const t0 = Date.now();
await page.waitForTimeout(250);
const early = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelectorAll('circle').length >= 50);
  if (!svg) return null;
  const circles = [...svg.querySelectorAll('circle')];
  return { count: circles.length, opacities: circles.slice(0, 30).map(c => getComputedStyle(c).opacity) };
});
console.log('ENTRY@250ms:', JSON.stringify(early));
if (errors.length) console.log('PAGE_ERRORS:', errors);
await browser.close();
console.log('PROBE_DONE');
