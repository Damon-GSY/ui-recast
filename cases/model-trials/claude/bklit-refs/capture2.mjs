const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/gauge-chart', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(3000);
const data = await page.evaluate(() => {
  // find svg with many paths (the gauge: 40 bg + active overlays)
  const svgs = [...document.querySelectorAll('svg')].filter(s => s.querySelectorAll('path').length > 30);
  const svg = svgs[0];
  let gauge = null;
  if (svg) {
    const paths = [...svg.querySelectorAll('path')];
    const styles = paths.map(p => { const cs = getComputedStyle(p); return { fill: cs.fill, opacity: cs.fillOpacity }; });
    const fills = {};
    for (const s of styles) fills[s.fill + ' @' + s.opacity] = (fills[s.fill + ' @' + s.opacity] || 0) + 1;
    gauge = { viewBox: svg.getAttribute('viewBox'), width: svg.getAttribute('width'), pathCount: paths.length, fillHistogram: fills,
      parentWidth: Math.round(svg.parentElement.getBoundingClientRect().width),
      parentHeight: Math.round(svg.parentElement.getBoundingClientRect().height) };
  }
  // center value: walk elements containing '428'
  let center = null;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (walker.currentNode.textContent.includes('428')) {
      let el = walker.currentNode.parentElement;
      while (el && el.textContent.trim().length > 14) el = el.parentElement;
      if (el) {
        const cs = getComputedStyle(el);
        center = { text: el.textContent.trim().slice(0, 30), font: cs.fontSize + '/' + cs.fontWeight, family: cs.fontFamily.slice(0, 60), color: cs.color, letterSpacing: cs.letterSpacing, fontVariantNumeric: cs.fontVariantNumeric };
        const sib = el.nextElementSibling || el.parentElement.querySelector(':scope > *:not(:first-child)');
        break;
      }
    }
  }
  // center label 'ARR run rate'
  let label = null;
  const lab = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /ARR run rate/.test(e.textContent) && e.textContent.trim() === 'ARR run rate');
  if (lab) { const cs = getComputedStyle(lab); label = { font: cs.fontSize + '/' + cs.fontWeight, color: cs.color, marginTop: cs.marginTop }; }
  const card = svg ? svg.closest('[class*="rounded"]') : null;
  const cardCs = card ? getComputedStyle(card) : null;
  return { gauge, center, label, card: cardCs ? { radius: cardCs.borderRadius, border: cardCs.border, bg: cardCs.backgroundColor, w: Math.round(card.getBoundingClientRect().width), h: Math.round(card.getBoundingClientRect().height) } : null };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
