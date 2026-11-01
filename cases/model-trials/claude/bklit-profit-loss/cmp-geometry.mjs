import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto('file:///tmp/ui-recast-standalone/profit-loss/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1300);
const paths = await page.evaluate(() =>
  [...document.querySelectorAll('#chart path[stroke-width="2.5"]')].map(p => p.getAttribute('d')));
const lines = await page.evaluate(() =>
  [...document.querySelectorAll('#chart line')].map(l => l.getAttribute('y1')));
console.log(JSON.stringify({ paths, lines }));
await browser.close();
