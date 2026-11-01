const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch();
const page = await browser.newPage();
const urls = [];
page.on('response', r => { if (/font|woff/i.test(r.url())) urls.push(r.url()); });
await page.goto('https://www.bklit.com/charts/gauge-chart', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2000);
console.log(JSON.stringify([...new Set(urls)].slice(0, 8), null, 1));
await browser.close();
