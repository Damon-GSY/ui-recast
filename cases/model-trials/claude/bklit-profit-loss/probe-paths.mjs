import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/profit-loss-line', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2200);
const out = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('svg')].find(s => s.querySelector('clipPath'));
  const g = svg.querySelector('g[clip-path]');
  const paths = [...g.querySelectorAll('path')].map(p => p.getAttribute('d'));
  const inner = g.getAttribute('transform');
  return { inner, paths };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
