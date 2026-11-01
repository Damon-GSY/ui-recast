import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/profit-loss-line', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2200);
const rows = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('clipPath'));
  return [...svg.querySelectorAll('line')].map(l => ({
    y1: l.getAttribute('y1'), stroke: l.getAttribute('stroke'), dash: l.getAttribute('stroke-dasharray'),
  }));
});
console.log(JSON.stringify(rows));
await browser.close();
