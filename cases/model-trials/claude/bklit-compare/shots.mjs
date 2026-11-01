// Capture 4 in-app integration screenshots for the comparison page.
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const out = '/tmp/ui-compare/img';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const base = 'http://localhost:5173/?mode=demo&version=rea-shadcn';
const step = async (name, fn) => { try { await fn(); console.log(`${name}: OK`); } catch (e) { console.log(`${name}: ERR ${String(e.message).split('\n')[0]}`); } };

await page.goto(base, { waitUntil: 'networkidle' });
await page.locator('.rhs-statement').waitFor();
await page.waitForTimeout(1500);

await step('integration-heatmap', async () => {
  const card = page.locator('.rhs-heatmap-card');
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000); // heatmap staggered entry
  await card.screenshot({ path: `${out}/integration-heatmap.png` });
});

await step('integration-profitloss', async () => {
  const card = page.locator('.rhs-chart-card');
  await card.scrollIntoViewIfNeeded();
  await page.getByRole('tab', { name: '每日结余' }).click();
  await page.waitForTimeout(1600); // 950ms wipe + margin
  await card.screenshot({ path: `${out}/integration-profitloss.png` });
});

await step('integration-gauge', async () => {
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await page.getByRole('button', { name: '预算分析', exact: true }).click();
  const overview = page.locator('.budget-overview');
  await overview.waitFor();
  await page.waitForTimeout(1800); // gauge spring entry
  await overview.scrollIntoViewIfNeeded();
  await overview.screenshot({ path: `${out}/integration-gauge.png` });
});

await step('integration-statcard', async () => {
  await page.getByRole('button', { name: '资产', exact: true }).click();
  const row = page.locator('.eh-account-item .eh-item-button').first();
  await row.waitFor();
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await row.hover();
  await page.waitForTimeout(600); // overlay fade-in
  await page.locator('.eh-account-group').first().screenshot({ path: `${out}/integration-statcard.png` });
});

await browser.close();
console.log('SHOTS_DONE');
