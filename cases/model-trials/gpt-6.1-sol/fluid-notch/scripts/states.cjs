const {chromium}=require('/Users/damon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const target=process.argv[2]||'reconstruction',isRef=target==='reference';
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:960,height:720}});page.setDefaultTimeout(4000);
 const out=path.join(root,'evidence',target);await fs.mkdir(out,{recursive:true});const results=[];
 await page.goto(isRef?'https://ui.aceternity.com/live-preview/fluid-notch':'http://127.0.0.1:4231/?capture',{waitUntil:'domcontentloaded',timeout:25000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1500);
 const trigger=()=>page.getByRole('button',{name:/^Launch assistant:/});
 const shot=async name=>{await page.screenshot({path:path.join(out,name+'.png')});};
 await shot('idle');
 for(const name of ['question-1','question-2','question-3','completion']){
  await trigger().click();await page.waitForTimeout(850);await shot(name);
  const d=page.getByRole('dialog');results.push({name,rect:await d.boundingBox(),text:await d.innerText(),focus:await page.evaluate(()=>document.activeElement?.textContent)});
  if(name!=='completion'){await d.getByRole('button').first().click();await page.waitForTimeout(650);}
 }
 await page.getByRole('button',{name:'Start over',exact:true}).click();await page.waitForTimeout(650);
 await page.setViewportSize({width:375,height:812});await trigger().click();await page.waitForTimeout(850);await shot('narrow-question-1');
 results.push({name:'narrow',rect:await page.getByRole('dialog').boundingBox()});
 await page.keyboard.press('Escape');await page.waitForTimeout(650);await page.setViewportSize({width:960,height:720});
 if(isRef) await page.locator('button').last().click(); else { await page.goto('http://127.0.0.1:4231/?capture&theme=dark'); await page.waitForTimeout(400); await trigger().click(); await page.waitForTimeout(500); await page.keyboard.press('Escape'); await page.waitForTimeout(650); }
 await page.waitForTimeout(650);await trigger().click();await page.waitForTimeout(850);await shot('dark-question');
 if(isRef){
  await page.goto('https://ui.aceternity.com/interactions/fluid-notch',{waitUntil:'domcontentloaded',timeout:25000});await page.waitForTimeout(1400);
  // Theme is persisted by the public site. Switch back using its visible theme control.
  if(await page.locator('html').evaluate(e=>e.classList.contains('dark'))) await page.getByRole('button',{name:'Toggle theme',exact:true}).click();
  for(const [name,choice] of [['Dust','Off'],['Grain Background','On']]) await page.getByText(name,{exact:true}).locator('..').getByRole('button',{name:choice,exact:true}).click();
  const slider=page.locator('.dialkit-slider').filter({has:page.getByText('Card Width',{exact:true})});
  await slider.scrollIntoViewIfNeeded();let r=await slider.boundingBox();await page.mouse.move(r.x+r.width*.30,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width*.60,r.y+r.height/2,{steps:12});await page.mouse.up();
  results.push({name:'mode-width-value',text:await slider.innerText()});
  const stage=page.locator('div.relative.flex.items-center.justify-center.overflow-hidden.rounded-xl.border').first();await stage.scrollIntoViewIfNeeded();await page.waitForTimeout(750);await trigger().click();await page.waitForTimeout(950);await stage.screenshot({path:path.join(out,'mode-wide-grain-no-dust.png')});
  results.push({name:'mode-wide',rect:await page.getByRole('dialog').boundingBox(),stage:await stage.boundingBox()});
 }else{
  await page.setViewportSize({width:896,height:512});await page.goto('http://127.0.0.1:4231/?capture&width=400&dust=off&background=on');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(650);await trigger().click();await page.waitForTimeout(950);await shot('mode-wide-grain-no-dust');
  const r=await page.getByRole('dialog').boundingBox();results.push({name:'mode-wide',rect:r});
 }
 await fs.writeFile(path.join(out,'states.json'),JSON.stringify(results,null,2));
 await browser.close();console.log({target,results});
})().catch(e=>{console.error(e);process.exit(1)});
