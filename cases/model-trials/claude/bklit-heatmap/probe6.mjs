// Probe HTML label positions relative to the svg grid origin
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/heatmap-chart', { waitUntil: 'networkidle', timeout: 45000 });
const probe = await page.evaluate(() => {
  const svgs = [...document.querySelectorAll('svg')];
  const svg = svgs.find(s => s.querySelectorAll('rect').length >= 300);
  const sr = svg.getBoundingClientRect();
  const pitch = 14.87558962264151, originX = sr.x + 44, originY = sr.y + 28;
  const want = new Set(['Q4','Q1','Q2','Q3','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Less','More']);
  const hits = [];
  for (const el of document.querySelectorAll('span,div,abbr')) {
    const t = (el.childNodes.length === 1 && el.textContent.trim()) || '';
    if (!want.has(t) || hits.some(h => h.el === el)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    hits.push({ el, t, x: r.x, y: r.y, w: r.width, h: r.height });
    if (hits.length > 40) break;
  }
  // weekday letters: single-char elements left of the grid
  const wd = [];
  for (const el of document.querySelectorAll('span,div,abbr')) {
    const t = el.textContent.trim();
    if (t.length !== 1 || !'SMTWF'.includes(t) || el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || r.x > sr.x || r.y < sr.y - 40 || r.y > sr.y + sr.height + 40) continue;
    wd.push({ t, x: +(r.x - originX).toFixed(1), y: +(r.y + r.height / 2 - originY).toFixed(1), right: +(r.right - originX).toFixed(1) });
  }
  const map = hits.map(h => ({
    t: h.t,
    relX: +(h.x - originX).toFixed(1),
    col: +((h.x - originX) / pitch).toFixed(2),
    relY: +(h.y - originY).toFixed(1),
    centerCol: +((h.x + h.w / 2 - originX) / pitch).toFixed(2),
  }));
  return { svgRect: { x: sr.x, y: sr.y, w: sr.width, h: sr.height }, labels: map, weekdays: wd };
});
console.log(JSON.stringify(probe, null, 1));
await browser.close();
console.log('DONE');
