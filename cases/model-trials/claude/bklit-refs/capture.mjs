const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/gauge-chart', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  const vars = {};
  for (const name of ['--chart-1','--chart-5','--border','--foreground','--chart-label','--background','--card','--font-sans','--font-mono']) {
    vars[name] = root.getPropertyValue(name).trim();
  }
  const svg = document.querySelector('main svg, article svg') || document.querySelectorAll('svg')[document.querySelectorAll('svg').length - 1];
  let svgInfo = null;
  if (svg) {
    const paths = [...svg.querySelectorAll('path')];
    const first = paths[0];
    const active = paths.find(p => getComputedStyle(p).fillOpacity === '1' && getComputedStyle(p).fill !== getComputedStyle(paths[0]).fill);
    svgInfo = {
      viewBox: svg.getAttribute('viewBox'),
      pathCount: paths.length,
      firstFill: getComputedStyle(paths[0]).fill,
      firstOpacity: getComputedStyle(paths[0]).fillOpacity,
      lastFill: getComputedStyle(paths[paths.length-1]).fill,
      sampleActiveFill: active ? getComputedStyle(active).fill : null,
    };
  }
  const spans = [...document.querySelectorAll('span')].filter(s => /428/.test(s.textContent || ''));
  const center = spans[0];
  let centerInfo = null;
  if (center) {
    const cs = getComputedStyle(center);
    const label = center.nextElementSibling;
    centerInfo = {
      valueText: center.textContent.trim().slice(0, 12),
      font: cs.fontSize + ' ' + cs.fontWeight + ' ' + cs.fontFamily.slice(0, 60),
      color: cs.color, letterSpacing: cs.letterSpacing,
      label: label ? { text: label.textContent.trim(), font: getComputedStyle(label).fontSize + ' ' + getComputedStyle(label).fontWeight + ' ' + getComputedStyle(label).color } : null,
    };
  }
  const bodyFont = getComputedStyle(document.body).fontFamily.slice(0, 120);
  return { vars, svgInfo, centerInfo, bodyFont };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
