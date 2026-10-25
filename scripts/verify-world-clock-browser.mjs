#!/usr/bin/env node
// Explicit Playwright regression suite for the real 9-page World Time product.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {CITY_PAGES} from './seo-content.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const base=(process.env.WORLDTIME_TEST_BASE||'http://127.0.0.1:4173').replace(/\/$/,'');
const binary=process.env.WORLDTIME_CHROME_PATH||
 ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,...(binary?{executablePath:binary}:{})});
const routes=[{path:'/',name:null},...CITY_PAGES.map(c=>({path:'/time/'+c.slug+'/',name:c.name}))];
const layouts=[{name:'desktop',width:1365,height:820},{name:'mobile',width:390,height:844}];
const errors=[];
try {
 for(const viewport of layouts) {
  const context=await browser.newContext({viewport,locale:'en-US'});
  for(const route of routes) {
   const page=await context.newPage(),fail=[];
   const pageErrors=[];
   page.on('pageerror',error=>pageErrors.push(error.message));
   try {
    const response=await page.goto(base+route.path,{waitUntil:'domcontentloaded',timeout:25000});
    if(response?.status()!==200)fail.push('HTTP '+response?.status());
    if((await page.locator('html').getAttribute('lang'))!=='en')fail.push('Incorrect page language');
    if((await page.locator('h1').count())!==1)fail.push('Expected exactly one H1');
    await page.waitForFunction(()=>document.querySelector('#timeMain')?.textContent!=='--:--',{timeout:15000});
    if(!/^\d\d:\d\d$/.test(await page.locator('#timeMain').textContent()))fail.push('Clock invalid');
    const initial=await page.locator('#cityName').innerText();
    const heading=await page.locator('#pageHeadline').innerText();
    if(heading!=='CORRECT TIME IN '+initial.toLocaleUpperCase('en'))fail.push('Initial header/city mismatch: '+heading+' vs '+initial);
    if(route.name && initial!==route.name)fail.push('Incorrect page default: '+initial+' vs '+route.name);
    if((await page.locator('.seo-seasonal').count())!==0)fail.push('Seasonal section remains visible');
    if((await page.locator('a[href*="wintertijd"],a[href*="zomertijd"],a[href*="time-belgium"]').count())!==0)fail.push('Seasonal links remain');
    if((await page.locator('a[href^="/time/"]').count())<8)fail.push('City navigation disappeared');
    if((await page.locator('#worldLayers g').count())===0)fail.push('World map not rendered');
    // Press the same quick city on each route to prove visible copy changes dynamically.
    const choice=route.name==='Tokyo'?'New York':'Tokyo';
    await page.locator('.city-quick[data-city="'+choice+'"]').click();
    if((await page.locator('#cityName').innerText())!==choice)fail.push('Selected city did not update');
    if((await page.locator('#pageHeadline').innerText())!=='CORRECT TIME IN '+choice.toUpperCase())fail.push('Selected heading is stale');
    if(route.name && (await page.locator('#citySeoDetail').isVisible()))fail.push('Old city-specific guide still visible');
    // Search city selection must also keep the headline synchronized.
    await page.locator('#citySearch').fill('Lisbon');
    await page.locator('.result-item').first().click();
    if((await page.locator('#cityName').innerText())!=='Lisbon')fail.push('City search failed');
    if((await page.locator('#pageHeadline').innerText())!=='CORRECT TIME IN LISBON')fail.push('Lisbon selected but heading stale');
    if(route.name && (await page.locator('#citySeoDetail').isVisible()))fail.push('Stale SEO text on Lisbon');
    const dimension=await page.evaluate(()=>({screen:innerWidth,doc:document.documentElement.scrollWidth}));
    if(dimension.doc>dimension.screen+3)fail.push('Horizontal overflow');
    fail.push(...pageErrors.map(e=>'JS: '+e.slice(0,100)));
   }catch(e){fail.push('Browser exception: '+e.message.slice(0,180))}
   const result={viewport:viewport.name,path:route.path,passed:fail.length===0,errors:fail};
   errors.push(result);
   console.log((result.passed?'PASS':'FAIL')+' '+viewport.name+' '+route.path+(fail.length?' '+fail.join('; '):''));
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close()}
const bad=errors.filter(x=>!x.passed);
const report={checked:errors.length,passed:errors.length-bad.length,failed:bad.length,results:errors};
if(process.env.WORLDTIME_CLOCK_REPORT) {
 const target=path.resolve(process.env.WORLDTIME_CLOCK_REPORT);
 await mkdir(path.dirname(target),{recursive:true});
 await writeFile(target,JSON.stringify(report,null,2)+'\n');
}
console.log('World Clock browser QA: '+report.passed+'/'+report.checked+' successful, '+routes.length+' pages × '+layouts.length+' viewports.');
if(bad.length)process.exitCode=2;
