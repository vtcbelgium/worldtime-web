#!/usr/bin/env node
// Optional real-browser locale acceptance suite. Run against built Vite preview, NOT in normal CI.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { CITY_PAGES } from './seo-content.mjs';
import { SEASONAL } from './seasonal-pages.mjs';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright')}catch{throw Error('Playwright is needed for this optional local browser suite. Install locally without changing production dependencies.')}
const base=(process.env.WORLDTIME_TEST_BASE||'http://127.0.0.1:4173').replace(/\/$/,'');
const executable=process.env.WORLDTIME_CHROME_PATH ||
  ['C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
   'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
   'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(f=>fs.existsSync(f));
const chromium=playwright.chromium;
const browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
const routes=[{route:'/',lang:'en',type:'clock'},
  ...CITY_PAGES.map(c=>({route:'/time/'+c.slug+'/',lang:'en',type:'clock',name:c.name})),
  ...SEASONAL.flatMap(c=>[{route:'/'+c.nl+'/',lang:'nl-BE',type:'guide',topic:c},
                          {route:'/'+c.en+'/',lang:'en',type:'guide',topic:c}])];
const viewportCases=[{name:'desktop',width:1365,height:820},{name:'mobile',width:390,height:844}];
const reports=[];
try{
 for(const device of viewportCases){
  const context=await browser.newContext({viewport:{width:device.width,height:device.height},locale:device.name==='mobile'?'nl-BE':'en-US'});
  for(const item of routes){
   const page=await context.newPage();
   const failures=[],jsErrors=[];
   page.on('pageerror',error=>jsErrors.push(String(error.message).slice(0,180)));
   const url=base+item.route;
   try{
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    if(response?.status()!==200)failures.push('HTTP status '+response?.status());
    if(await page.locator('html').getAttribute('lang')!==item.lang)failures.push('Incorrect HTML language');
    const count=await page.locator('h1').count();
    if(count!==1)failures.push('H1 count='+count);
    if(item.type==='clock'){
     await page.waitForFunction(()=>document.querySelector('#timeMain')?.textContent?.trim()!=='--:--',{timeout:15000}).catch(()=>failures.push('Clock did not update'));
     const section=await page.locator('.seo-seasonal').innerText().catch(()=>'');
     if(!section.includes('When do the clocks change in Belgium?'))failures.push('English section label absent');
     if(/Wintertijd:|Zomertijd:|Gaat de klok/.test(section))failures.push('Dutch content inside English clock page');
     const hrefs=await page.locator('.seo-seasonal a').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
     if(JSON.stringify(hrefs)!==JSON.stringify(['/winter-time-belgium/','/summer-time-belgium/']))failures.push('English seasonal links wrong');
     if(item.name && !(await page.locator('#cityName').innerText()).includes(item.name))failures.push('City mismatch');
    }else{
     await page.waitForFunction(()=>document.querySelector('#countdown')?.textContent?.includes(' · '),{timeout:10000}).catch(()=>failures.push('Countdown did not initialize'));
     const text=await page.locator('main').innerText();
     if(item.lang==='en'){
      if(!text.includes('Do clocks go forward or back?')||!text.includes('How can I check the correct time?'))failures.push('English sections missing');
      if(/Volgende omschakeling|Hoe weet ik|Gaat de klok| dagen · /.test(text))failures.push('Untranslated Dutch visible on English page');
      if(!text.includes(' days · '))failures.push('English countdown units missing');
     }else{
      if(!text.includes('Gaat de klok vooruit of achteruit?')||!text.includes('Hoe weet ik zeker dat mijn klok juist staat?'))failures.push('Dutch sections missing');
      if(/Next clock change in Belgium|How can I check the correct time| days · /.test(text))failures.push('Untranslated English visible on Dutch page');
      if(!text.includes(' dagen · '))failures.push('Dutch countdown units missing');
     }
     const hreflangs=await page.locator('head link[rel="alternate"]').evaluateAll(n=>Object.fromEntries(n.map(x=>[x.hreflang,x.href])));
     if(!hreflangs['en']?.endsWith('/'+item.topic.en+'/')||!hreflangs['nl-BE']?.endsWith('/'+item.topic.nl+'/'))
      failures.push('Incomplete alternate language link pair');
     const nextLang=item.lang==='en'?'nl-BE':'en';
     const switchHref=await page.locator('header a[hreflang="'+nextLang+'"]').getAttribute('href').catch(()=>null);
     if(switchHref!=='/'+(nextLang==='en'?item.topic.en:item.topic.nl)+'/')failures.push('Language switch points to wrong counterpart');
    }
    const dimensions=await page.evaluate(()=>({screen:window.innerWidth,doc:document.documentElement.scrollWidth}));
    if(dimensions.doc>dimensions.screen+3)failures.push('Horizontal overflow '+JSON.stringify(dimensions));
    failures.push(...jsErrors.map(x=>'JS error: '+x));
   }catch(e){failures.push('Browser exception: '+String(e.message).slice(0,160))}
   reports.push({device:device.name,route:item.route,language:item.lang,passed:failures.length===0,failures});
   process.stdout.write((failures.length?'FAIL':'PASS')+' '+device.name+' '+item.lang+' '+item.route+(failures.length?' '+failures.join('; '):'')+'\n');
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close()}
const failed=reports.filter(x=>!x.passed);
const summary={routes:routes.length,viewports:viewportCases.length,cases:reports.length,passed:reports.length-failed.length,failed:failed.length,results:reports};
if(process.env.WORLDTIME_LOCALE_REPORT){
 const filepath=path.resolve(process.env.WORLDTIME_LOCALE_REPORT);
 await mkdir(path.dirname(filepath),{recursive:true});
 await writeFile(filepath,JSON.stringify(summary,null,2)+'\n');
}
console.log('Locale browser QA: '+summary.passed+'/'+summary.cases+' pass across '+routes.length+' pages and two viewports.');
if(failed.length)process.exitCode=2;
