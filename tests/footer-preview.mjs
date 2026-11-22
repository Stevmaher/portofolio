import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const server = spawn('python3',['-m','http.server','8124','--directory',new URL('..',import.meta.url).pathname]);
const browser = await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
try {
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:8124',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 const results=[];
 for (const width of [320,375,390,430,768,1024,1440,1920]) {
  await page.setViewportSize({width,height:width<700?900:800});
  await page.locator('footer').scrollIntoViewIfNeeded();
  const result=await page.locator('footer').evaluate(f=>({width:innerWidth,height:f.offsetHeight,overflow:[...f.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1||e.getBoundingClientRect().left<0).map(e=>e.className)}));
  assert.equal(result.overflow.length,0);
  assert.equal(await page.locator('.pf-footer-wordmark').count(),0);
  results.push(result);
  if([390,1440].includes(width)) await page.locator('footer').screenshot({path:`.artifacts/footer-${width}.png`});
 }
 const axe = await new AxeBuilder({page}).include('footer').analyze();
 assert.equal(axe.violations.length,0);
 await page.setViewportSize({width:390,height:1450});
 await page.evaluate(()=>{const root=document.querySelector('.pf');const section=document.querySelector('#contact');root.scrollTop+=section.getBoundingClientRect().top-130;});
 await page.screenshot({path:'.artifacts/contact-390.png'});
 await page.locator('.pf-footer-bottom a').click();
 await page.waitForFunction(()=>document.querySelector('.pf').scrollTop<5);
 assert.equal(new URL(page.url()).hash,'#top');
 fs.writeFileSync('.artifacts/footer-results.json',JSON.stringify({results,axe:axe.violations,backToTop:true},null,2));
 console.log(JSON.stringify({results,axe:axe.violations,backToTop:true},null,2));
} finally {await browser.close();server.kill();}
