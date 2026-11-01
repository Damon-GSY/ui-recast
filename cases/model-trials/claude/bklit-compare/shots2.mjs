import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const out = '/tmp/ui-compare/img';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto('http://localhost:5173/?mode=demo&version=rea-shadcn', { waitUntil: 'networkidle' });
await page.locator('.rhs-statement').waitFor();
await page.waitForTimeout(1200);
try {
  await page.getByRole('button', { name: '统计', exact: true }).click();
  const card = page.locator('.rhs-chart-card');
  await card.waitFor();
  await card.scrollIntoViewIfNeeded();
  await page.getByRole('tab', { name: '每日结余' }).click();
  await page.waitForTimeout(1600);
  await card.screenshot({ path: `${out}/integration-profitloss.png` });
  console.log('integration-profitloss: OK');
} catch (e) { console.log('integration-profitloss: ERR', String(e.message).split('\n')[0]); }
try {
  await page.getByRole('button', { name: '资产', exact: true }).click();
  const row = page.locator('.eh-account-item').first();
  await row.waitFor();
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await row.hover();
  await page.waitForTimeout(600);
  await page.locator('.eh-account-group').first().screenshot({ path: `${out}/integration-statcard.png` });
  console.log('integration-statcard: OK');
} catch (e) { console.log('integration-statcard: ERR', String(e.message).split('\n')[0]); }
await browser.close();
console.log('SHOTS2_DONE');
