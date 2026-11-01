import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
await mkdir('shots', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file:///tmp/ui-recast-standalone/gauge/index.html');
await page.waitForTimeout(400); // 入场中途：背景已弹大半、激活刚开始（0.3s 后）
await page.screenshot({ path: 'shots/shot-entry.png' });
await page.waitForTimeout(2500); // 弹簧完全稳定
await page.screenshot({ path: 'shots/shot.png' });
const check = await page.evaluate(() => {
  const paths = document.querySelectorAll('#gauge path');
  const fills = {};
  for (const p of paths) {
    const cs = getComputedStyle(p);
    const key = cs.fill.slice(0, 40) + ' @' + cs.fillOpacity;
    fills[key] = (fills[key] || 0) + 1;
  }
  const value = document.querySelector('.gauge-value').textContent;
  const label = document.querySelector('.gauge-label').textContent;
  const fontLoaded = document.fonts.check('24px calSans');
  return { pathCount: paths.length, fills, value, label, fontLoaded };
});
console.log(JSON.stringify(check, null, 1));
console.log('CONSOLE_ERRORS:', JSON.stringify(errors));
await browser.close();
