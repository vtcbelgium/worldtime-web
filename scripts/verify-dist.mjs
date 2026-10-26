import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {CITY_PAGES, BASE_URL} from './seo-content.mjs';

const dist=path.resolve('dist');
const sitemap=await readFile(path.join(dist,'sitemap.xml'),'utf8');
const routes=[{slug:'',city:null},...CITY_PAGES.map(city=>({slug:'time/'+city.slug,city}))];
const seenTitles=new Set();
const knownRoutes=new Set([...routes.map(x=>'/'+(x.slug?x.slug+'/':'')), '/guides/time-zone-accuracy/']);
for(const {slug,city} of routes) {
  const html=await readFile(path.join(dist,slug,'index.html'),'utf8');
  const url=BASE_URL+'/'+(slug?slug+'/':'');
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(title?.length>30,'Title missing '+slug);
  assert.ok(description?.length>80,'Description missing '+slug);
  assert.equal(canonical,url,'Canonical mismatch '+slug);
  assert.ok(!seenTitles.has(title),'Duplicate title '+slug);seenTitles.add(title);
  assert.match(html,/<html lang="en"/,'English language missing '+slug);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,'Wrong H1 count '+slug);
  assert.ok(sitemap.includes('<loc>'+url+'</loc>'),'Sitemap URL missing '+slug);
  assert.ok(html.includes('id="pageHeadline"'),'Dynamic heading missing '+slug);
  assert.ok(!html.includes('class="seo-seasonal"'),'Seasonal section must be removed '+slug);
  assert.ok(!/href="\/(?:wintertijd|zomertijd|winter-time-belgium|summer-time-belgium)\//.test(html),'Obsolete guide link '+slug);
  if(city) {
    assert.ok(html.includes('data-seo-city="'+city.name+'"'),'Initial city mismatch '+slug);
    assert.ok(html.includes('CORRECT TIME IN '+city.name.toUpperCase()),'Static city H1 '+slug);
    assert.ok(html.includes('id="cityName">'+city.name+'</div>'),'City label '+slug);
    assert.ok(html.includes(city.zone),'City zone data missing '+slug);
    assert.ok(html.includes('class="city-seo-detail" id="citySeoDetail"'),'Hidden-able city-specific SEO detail missing '+slug);
  }else {
    assert.ok(html.includes('WORLD CLOCK · CORRECT TIME NOW'),'Homepage H1 missing');
    assert.ok(html.includes('id="shareTime"'),'Share control missing');
  }
  for(const [,route] of html.matchAll(/<a\b[^>]*href="(\/[^"]+)"/g))
    assert.ok(knownRoutes.has(route),'Broken internal route '+route+' on '+slug);
}
assert.equal((sitemap.match(/<url>/g)||[]).length,10,'Sitemap should contain 9 clocks and 1 guide');
const guide=await readFile(path.join(dist,'guides/time-zone-accuracy/index.html'),'utf8');
assert.match(guide,/<h1>Time zone accuracy:/);
assert.match(guide,/<html lang="en">/);
assert.ok(guide.includes('<link rel="canonical" href="'+BASE_URL+'/guides/time-zone-accuracy/"'));
assert.ok(sitemap.includes('<loc>'+BASE_URL+'/guides/time-zone-accuracy/</loc>'));
for(const route of ['/','/time/brussels/','/time/mumbai/','/time/kathmandu/']) assert.ok(guide.includes('href="'+route+'"'), 'Missing internal reference link '+route);
assert.equal(routes.length,9,'Unexpected page count');
for(const old of ['wintertijd','zomertijd','winter-time-belgium','summer-time-belgium']) {
  assert.ok(!sitemap.includes('/'+old+'/'),'Removed guide still in sitemap: '+old);
  await assert.rejects(readFile(path.join(dist,old,'index.html'),'utf8'),{code:'ENOENT'});
}
console.log('World Time output verification passed: 9 English clock pages, 1 accuracy guide, links and no seasonal guides.');
