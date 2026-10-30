const {chromium}=require('/Users/damon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:960,height:720},reducedMotion:'reduce'});p.setDefaultTimeout(4000);await p.goto('http://127.0.0.1:4231/?capture');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);const results=[];
 await p.keyboard.press('Tab');assert.equal(await p.locator(':focus').getAttribute('aria-label'),'Launch assistant: 3 to review');
 await p.keyboard.press('Enter');await p.waitForTimeout(80);assert.equal(await p.locator(':focus').innerText(),'Move it');
 let rect=await p.getByRole('dialog').boundingBox();assert.equal(rect.height,242);results.push('Keyboard Enter opens and focuses primary action; reduced-motion geometry settles immediately');
 assert.equal(await p.locator('.fn-dust').count(),0);results.push('Reduced motion removes dust');
 await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.tagName),'BODY'); // leaves nonmodal dialog
 await p.getByRole('button',{name:'Move it',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForTimeout(100);
 assert.equal(await p.locator(':focus').getAttribute('aria-label'),'Launch assistant: 2 to review');results.push('Keyboard answer advances caller state and restores trigger focus');
 assert.equal(await p.locator('.fn-dialog-position').getAttribute('inert'),'');results.push('Closed content is inert');
 await p.keyboard.press('Enter');await p.waitForTimeout(100);await p.keyboard.press('Escape');await p.waitForTimeout(100);assert.equal(await p.locator(':focus').getAttribute('aria-label'),'Launch assistant: 1 to review');results.push('Escape advances and restores focus');
 const circles=await p.locator('.fn-header .fn-progress').evaluate(e=>({color:getComputedStyle(e).color,stroke:getComputedStyle(e.querySelectorAll('circle')[1]).stroke,dash:e.querySelectorAll('circle')[1].getAttribute('stroke-dasharray')}));assert.equal(circles.color,'rgb(255, 255, 255)');results.push('Frozen-source SVG ring has white stroke');
 await fs.writeFile(path.resolve('evidence/accessibility.json'),JSON.stringify({results,circles},null,2));console.log(results);await b.close()})().catch(e=>{console.error(e);process.exit(1)});
