// Probe live label geometry: exact x of every text element + first-cell x per column block
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/heatmap-chart', { waitUntil: 'networkidle', timeout: 45000 });
const probe = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelectorAll('rect').length >= 300)
    || [...document.querySelectorAll('svg')].find(s => s.querySelectorAll('g').length >= 300);
  const g = svg.querySelector('g[transform]') || svg.firstElementChild;
  const texts = [...svg.querySelectorAll('text')].map(t => ({
    s: t.textContent, x: t.getAttribute('x'), y: t.getAttribute('y'),
    anchor: t.getAttribute('text-anchor') || getComputedStyle(t).textAnchor,
  }));
  const rects = [...svg.querySelectorAll('rect')];
  const r0 = rects[0];
  const allX = [...new Set(rects.map(r => r.getAttribute('x')))].map(Number).sort((a, b) => a - b);
  // column pitch = min positive diff
  let pitch = 0;
  for (let i = 1; i < allX.length; i++) { const d = allX[i] - allX[i - 1]; if (d > 1 && (!pitch || d < pitch)) pitch = d; }
  // infer column index of each distinct x
  const cols = allX.map(x => +(x / pitch).toFixed(2));
  return {
    transform: g.getAttribute('transform'),
    texts, rectCount: rects.length,
    firstRect: { x: r0.getAttribute('x'), y: r0.getAttribute('y'), w: r0.getAttribute('width') },
    pitch: +pitch.toFixed(4), distinctXCount: allX.length,
    colIndices: cols.filter(c => Number.isInteger(c)).slice(0, 60),
    lastTwoCols: allX.slice(-2).map(x => +(x / pitch).toFixed(2)),
  };
});
console.log(JSON.stringify(probe, null, 1).slice(0, 7000));
await browser.close();
console.log('DONE');
