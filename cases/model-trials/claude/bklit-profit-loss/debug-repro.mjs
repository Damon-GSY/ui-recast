import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto('file:///tmp/ui-recast-standalone/profit-loss/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1300);
const out = await page.evaluate(() => {
  const lines = [...document.querySelectorAll('#chart line')].map(l => ({
    y1: l.getAttribute('y1'), stroke: l.getAttribute('stroke'), dash: l.getAttribute('stroke-dasharray'),
  }));
  const paths = [...document.querySelectorAll('#chart path[stroke-width="2.5"]')].map(p => p.getAttribute('d'));
  return { lines, paths };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
