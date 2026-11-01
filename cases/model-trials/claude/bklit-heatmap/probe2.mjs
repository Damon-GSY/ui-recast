import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/heatmap-chart', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const svgs = [...document.querySelectorAll('svg')];
  const iframes = document.querySelectorAll('iframe').length;
  const tagCounts = {};
  svgs.forEach(s => s.querySelectorAll('*').forEach(el => { tagCounts[el.tagName] = (tagCounts[el.tagName]||0)+1; }));
  // find the biggest svg by element count
  const biggest = svgs.map((s,i)=>({i, n:s.querySelectorAll('*').length, w:s.getAttribute('width'), h:s.getAttribute('height')})).sort((a,b)=>b.n-a.n).slice(0,4);
  return { svgCount: svgs.length, iframes, tagCounts, biggest };
});
console.log(JSON.stringify(info, null, 1));
// dump shape details of biggest svg
const shapes = await page.evaluate(() => {
  const svgs = [...document.querySelectorAll('svg')].sort((a,b)=>b.querySelectorAll('*').length-a.querySelectorAll('*').length);
  const s = svgs[0]; if (!s) return null;
  const out = [];
  for (const el of s.querySelectorAll('rect,circle,path,ellipse')) {
    out.push({ tag: el.tagName, attrs: Object.fromEntries([...el.attributes].map(a=>[a.name,a.value])) });
    if (out.length >= 6) break;
  }
  return { w: s.getAttribute('width'), h: s.getAttribute('height'), viewBox: s.getAttribute('viewBox'), sample: out };
});
console.log(JSON.stringify(shapes, null, 1).slice(0, 3000));
await browser.close();
