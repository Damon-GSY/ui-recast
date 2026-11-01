import { chromium } from '/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('https://www.bklit.com/charts/heatmap-chart', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
  const out = {};
  const q = [...document.querySelectorAll('*')].filter(el => el.children.length === 0 && /^Q[1-4]$/.test(el.textContent?.trim() || ''));
  if (q[0]) { const cs = getComputedStyle(q[0]); out.quarter = { color: cs.color, size: cs.fontSize, weight: cs.fontWeight, family: cs.fontFamily.slice(0,80), tag: q[0].tagName }; }
  const months = [...document.querySelectorAll('*')].filter(el => el.children.length === 0 && ['Nov','Dec','Jan'].includes(el.textContent?.trim() || ''));
  if (months[0]) { const cs = getComputedStyle(months[0]); out.month = { color: cs.color, size: cs.fontSize, weight: cs.fontWeight, tag: months[0].tagName }; }
  const wd = [...document.querySelectorAll('*')].filter(el => el.children.length === 0 && ['S','M','T','W','F'].includes(el.textContent?.trim() || '') && parseFloat(getComputedStyle(el).fontSize) < 14);
  if (wd[0]) { const cs = getComputedStyle(wd[0]); out.weekday = { color: cs.color, size: cs.fontSize, tag: wd[0].tagName }; }
  const less = [...document.querySelectorAll('*')].find(el => el.children.length === 0 && el.textContent?.trim() === 'Less');
  if (less) { const cs = getComputedStyle(less); out.legend = { color: cs.color, size: cs.fontSize };
    const parent = less.closest('div:not(:has(div))') || less.parentElement;
    out.legendHTML = (parent.parentElement || parent).outerHTML.slice(0, 900); }
  return out;
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
