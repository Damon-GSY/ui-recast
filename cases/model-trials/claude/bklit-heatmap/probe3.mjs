import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const out = '/tmp/ui-recast-standalone/heatmap';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/heatmap-chart', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
  const svgs = [...document.querySelectorAll('svg')].sort((a,b)=>b.querySelectorAll('*').length-a.querySelectorAll('*').length);
  const s = svgs[0];
  const rects = [...s.querySelectorAll('rect')].filter(r => r.getAttribute('pointer-events') !== 'none');
  const fills = {};
  rects.forEach(r => { const f = getComputedStyle(r).fill; fills[f] = (fills[f]||0)+1; });
  const texts = [...s.querySelectorAll('text')].map(t => ({
    t: t.textContent, fill: getComputedStyle(t).fill, size: getComputedStyle(t).fontSize,
    weight: getComputedStyle(t).fontWeight, family: getComputedStyle(t).fontFamily.slice(0,60),
  }));
  // quarter labels live where? month labels in svg texts? dump all texts
  const rootStyle = getComputedStyle(document.documentElement);
  const vars = {};
  for (let i = 0; i <= 6; i++) vars[`--chart-scale-0${i}`] = rootStyle.getPropertyValue(`--chart-scale-0${i}`).trim();
  const card = s.closest('div[class]')?.parentElement;
  const cardEl = s.closest('[class*="rounded"]');
  return {
    cellCount: rects.length,
    distinctFills: fills,
    vars,
    texts: texts.slice(0, 45),
    svgSize: { w: s.getAttribute('width'), h: s.getAttribute('height') },
    container: cardEl ? { bg: getComputedStyle(cardEl).backgroundColor, radius: getComputedStyle(cardEl).borderRadius, border: getComputedStyle(cardEl).border, padding: getComputedStyle(cardEl).padding } : null,
  };
});
console.log(JSON.stringify(data, null, 1).slice(0, 5000));

// hover: move pointer over one cell, sample others
const cellBox = await page.evaluate(() => {
  const s = [...document.querySelectorAll('svg')].sort((a,b)=>b.querySelectorAll('*').length-a.querySelectorAll('*').length)[0];
  const r = s.getBoundingClientRect();
  const rects = [...s.querySelectorAll('rect')].filter(x => x.getAttribute('pointer-events') !== 'none');
  const c = rects[300].getBoundingClientRect();
  return { x: c.x + c.width/2, y: c.y + c.height/2, base: { sx: r.x, sy: r.y } };
});
await page.mouse.move(cellBox.x, cellBox.y);
await page.waitForTimeout(500);
const hover = await page.evaluate(() => {
  const s = [...document.querySelectorAll('svg')].sort((a,b)=>b.querySelectorAll('*').length-a.querySelectorAll('*').length)[0];
  const rects = [...s.querySelectorAll('rect')].filter(x => x.getAttribute('pointer-events') !== 'none');
  const ops = rects.map(r => getComputedStyle(r).opacity);
  const trs = [...new Set(rects.map(r => getComputedStyle(r).transform))];
  return { distinctOps: [...new Set(ops)], dimCount: ops.filter(o => parseFloat(o) < 0.9).length, transforms: trs };
});
console.log('HOVER:', JSON.stringify(hover));
await page.screenshot({ path: `${out}/upstream-hover.png` });
await browser.close();
console.log('DONE');
