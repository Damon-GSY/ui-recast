import assert from "node:assert/strict";
import { chromium } from "/Users/damon/.codex/worktrees/future-machine-standalone/node_modules/playwright/index.mjs";

const browser = await chromium.launch();
const errors = [];
const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("file:///tmp/ui-recast-standalone/stat-card/index.html");
await page.waitForTimeout(1400); // enter animations settle (900ms + margin)

// --- settled state ---
const settled = await page.evaluate(() => ({
  areaValue: document.getElementById("area-value").textContent,
  areaLabel: document.getElementById("area-label").textContent,
  areaBadge: document.getElementById("area-badge").textContent.trim(),
  lineValue: document.getElementById("line-value").textContent,
  lineLabel: document.getElementById("line-label").textContent,
  lineBadge: document.getElementById("line-badge").textContent.trim(),
  chartHeights: [...document.querySelectorAll(".chart-bleed svg")].map(s => s.getAttribute("height")),
  paths: [...document.querySelectorAll(".card")].map(c => c.querySelectorAll(".spark path").length),
  ariaArea: document.querySelectorAll("svg[role=img]")[0].getAttribute("aria-label"),
}));
assert.equal(settled.areaValue, "$6,525");
assert.equal(settled.areaLabel, "Avg");
assert.equal(settled.areaBadge, "+12.4%");
assert.equal(settled.lineValue, "1,344");
assert.equal(settled.lineLabel, "Avg");
assert.equal(settled.lineBadge, "+8.2%");
assert.deepEqual(settled.chartHeights, ["190", "190"]);
assert.deepEqual(settled.paths, [2, 1]); // area card: area+line; line card: line only
assert.equal(settled.ariaArea, "12 points, from 5.2K to 8.8K, up 69%");

// --- hover the area sparkline near the last point (Dec, $8,800, +15.8% vs Nov) ---
const areaSvg = page.locator("#area-chart svg");
const box = await areaSvg.boundingBox();
await page.mouse.move(box.x + box.width * 0.985, box.y + box.height / 2);
await page.waitForTimeout(700); // spring settle + counter finish
const hoverArea = await page.evaluate(() => ({
  value: document.getElementById("area-value").textContent,
  label: document.getElementById("area-label").textContent,
  badge: document.getElementById("area-badge").textContent.trim(),
  dim: getComputedStyle(document.querySelector("#area-chart g")).opacity,
}));
assert.equal(hoverArea.label, "Dec");
assert.equal(hoverArea.value, "$8,800");
assert.equal(hoverArea.badge, "+15.8%");
assert.equal(hoverArea.dim, "0.5", "base series dims to inactiveOpacity 0.5 while hovering");
await page.screenshot({ path: "/tmp/ui-recast-standalone/stat-card/hover.png" });

// --- hover the line sparkline mid-way (Thu 1580: -11.2% vs Wed? check: 1580 vs 1120 = +41.1%) ---
await page.mouse.move(box.x, box.y - 200); // leave first
await page.waitForTimeout(600);
const lineSvg = page.locator("#line-chart svg");
const lbox = await lineSvg.boundingBox();
await page.mouse.move(lbox.x + lbox.width * 0.5, lbox.y + lbox.height / 2);
await page.waitForTimeout(700);
const hoverLine = await page.evaluate(() => ({
  value: document.getElementById("line-value").textContent,
  label: document.getElementById("line-label").textContent,
  badge: document.getElementById("line-badge").textContent.trim(),
  negative: document.getElementById("line-badge").classList.contains("negative"),
  dim: getComputedStyle(document.querySelector("#line-chart g")).opacity,
}));
// index 3 of 7 (0..6): value 1580, weekday 2024-06-06 = Thursday, trend vs 1120 = +41.07%→+41.1%
assert.equal(hoverLine.value, "1,580");
assert.equal(hoverLine.label, "Thursday");
assert.equal(hoverLine.badge, "+41.1%");
assert.equal(hoverLine.dim, "0.4", "line variant uses inactiveOpacity 0.4");

// --- leave: stats restore to Avg + overall trend ---
await page.mouse.move(10, 10);
await page.waitForTimeout(600);
const left = await page.evaluate(() => ({
  v: document.getElementById("area-value").textContent,
  l: document.getElementById("area-label").textContent,
  dim: getComputedStyle(document.querySelector("#area-chart g")).opacity,
}));
assert.equal(left.v, "$6,525");
assert.equal(left.l, "Avg");
assert.equal(left.dim, "1");

// --- negative badge: hover sessions index 1 (1380 vs 920 = +50%)? need a down step: index 4 (1240 vs 1580 = -21.5%) ---
await page.mouse.move(lbox.x + lbox.width * (4 / 6), lbox.y + lbox.height / 2);
await page.waitForTimeout(700);
const negBadge = await page.evaluate(() => ({
  text: document.getElementById("line-badge").textContent.trim(),
  negative: document.getElementById("line-badge").classList.contains("negative"),
}));
assert.equal(negBadge.text, "-21.5%");
assert.equal(negBadge.negative, true);

// --- settled screenshot (no hover) ---
await page.mouse.move(10, 10);
await page.waitForTimeout(700);
await page.screenshot({ path: "/tmp/ui-recast-standalone/stat-card/shot.png" });

// --- reduced motion: instant enter, no animations ---
const rmContext = await browser.newContext({ viewport: { width: 900, height: 1400 }, reducedMotion: "reduce" });
const rmPage = await rmContext.newPage();
rmPage.on("pageerror", e => errors.push("rm:" + e.message));
await rmPage.goto("file:///tmp/ui-recast-standalone/stat-card/index.html");
await rmPage.waitForTimeout(300);
const rm = await rmPage.evaluate(() => ({
  areaValue: document.getElementById("area-value").textContent,
  clip: document.querySelector("#area-chart g").style.clipPath || "none",
  dash: document.querySelector("#line-chart path").style.strokeDasharray || "none",
}));
assert.equal(rm.areaValue, "$6,525");
assert.equal(rm.clip, "none", "no wipe clip under reduced motion");
assert.equal(rm.dash, "none", "no draw-in dash under reduced motion");
await rmContext.close();

// --- 390px mobile: cards fit ---
const mobContext = await browser.newContext({ viewport: { width: 390, height: 900 } });
const mobPage = await mobContext.newPage();
mobPage.on("pageerror", e => errors.push("mob:" + e.message));
await mobPage.goto("file:///tmp/ui-recast-standalone/stat-card/index.html");
await mobPage.waitForTimeout(1100);
const overflow = await mobPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
assert.ok(overflow <= 0, `no horizontal overflow, got ${overflow}px`);
await mobPage.screenshot({ path: "/tmp/ui-recast-standalone/stat-card/shot-mobile.png" });
await mobContext.close();

assert.deepEqual(errors, []);
console.log("PASS settled/hover/dim/leave/negative/reduced/390px, zero console errors");
await browser.close();
