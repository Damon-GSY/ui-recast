const { chromium } = require('/Users/damon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
(async () => {
 const target = process.argv[2] || 'reconstruction';
 const url = target === 'reference' ? 'https://ui.aceternity.com/live-preview/fluid-notch' : 'http://127.0.0.1:4231/?capture';
 const directory = path.join(root, 'evidence', target);
 await fs.mkdir(directory, { recursive: true });
 const browser = await chromium.launch({ channel: 'chrome', headless: true });
 const context = await browser.newContext({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1, recordVideo: { dir: directory, size: { width: 960, height: 720 } } });
 const page = await context.newPage(); page.setDefaultTimeout(4000);
 const epoch = Date.now(), actions = [], errors = [], checks = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
 await page.evaluate(() => document.fonts.ready);
 await page.waitForTimeout(1600);
 const trigger = () => page.getByRole('button', { name: /^Launch assistant:/ });
 const dialog = () => page.getByRole('dialog', { includeHidden: true });
 async function action(name, fn, wait = 1100) {
  const requestMs = Date.now() - epoch; await fn();
  actions.push({ name, requestMs, returnMs: Date.now() - epoch }); await page.waitForTimeout(wait);
 }
 async function state(name, label, hidden) {
  const actualLabel = await trigger().getAttribute('aria-label');
  const actualHidden = await dialog().getAttribute('aria-hidden');
  checks.push({ name, actualLabel, actualHidden, atMs: Date.now() - epoch, pass: actualLabel === label && actualHidden === String(hidden) });
 }
 await page.waitForTimeout(900);
 await action('open question 1; hold through dust completion', () => trigger().click(), 3000);
 await state('question 1 visible', 'Launch assistant: 3 to review', false);
 await action('Escape consumes question 1 and closes', () => page.keyboard.press('Escape'));
 await state('Escape advances', 'Launch assistant: 2 to review', true);
 await action('retrigger question 2', () => trigger().click());
 await action('Add Priya', () => page.getByRole('button', { name: 'Add Priya', exact: true }).click());
 await state('positive answer advances', 'Launch assistant: 1 to review', true);
 await action('open question 3', () => trigger().click());
 await action('Turn on; complete', () => page.getByRole('button', { name: 'Turn on', exact: true }).click(), 1600);
 await state('complete', 'Launch assistant: all caught up', true);
 await action('open all caught up', () => trigger().click());
 await action('Start over', () => page.getByRole('button', { name: 'Start over', exact: true }).click());
 await state('restart restores 3', 'Launch assistant: 3 to review', true);
 await action('open then interrupt', () => trigger().click(), 100);
 await action('Escape during expansion', () => page.keyboard.press('Escape'), 110);
 await action('early center click while pill is still displaced', () => page.mouse.click(480, 360), 700);
 await state('early center click ignored', 'Launch assistant: 2 to review', true);
 await action('retrigger after settling', () => trigger().click());
 await action('outside click (no dismissal)', () => page.mouse.click(760, 360), 700);
 await state('outside click preserves question', 'Launch assistant: 2 to review', false);
 await action('Escape starts collapse', () => page.keyboard.press('Escape'), 240);
 await action('reopen during settling collapse', () => page.mouse.click(480, 360), 1500);
 await state('late interruption reopens next question', 'Launch assistant: 1 to review', false);
 if (await dialog().getAttribute('aria-hidden') === 'true') await action('recover open if late click missed', () => trigger().click());
 await action('Turn on after reversal', () => page.getByRole('button', { name: 'Turn on', exact: true }).click(), 1500);
 await action('open completion again', () => trigger().click());
 await action('restart again', () => page.getByRole('button', { name: 'Start over', exact: true }).click(), 1300);
 await state('final reset', 'Launch assistant: 3 to review', true);
 const video = page.video(); await context.close();
 const videoPath = path.join(directory, 'lifecycle.webm'); await video.saveAs(videoPath);
 const temporary = await video.path(); if (temporary !== videoPath) await fs.unlink(temporary);
 await fs.writeFile(path.join(directory, 'actions.json'), JSON.stringify({ target, url, viewport: { width: 960, height: 720 }, epoch, timing: 'Wall ms from page creation. Visible video changes determine phase onset; no time stretching.', actions, checks, errors }, null, 2));
 await browser.close();
 console.log(JSON.stringify({ target, videoPath, checks, errors }, null, 2));
 if (target !== 'reference') { assert.equal(errors.length, 0, 'local browser errors'); assert.ok(checks.every(c => c.pass), 'lifecycle state mismatch'); }
})().catch(error => { console.error(error); process.exit(1); });
