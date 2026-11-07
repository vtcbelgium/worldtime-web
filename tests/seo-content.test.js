import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CITY_PAGES, BASE_URL, HUB_URL, timeBreadcrumbs } from '../scripts/seo-content.mjs';
test('city pages contain unique slugs and IANA zones',()=> {
  assert.equal(new Set(CITY_PAGES.map(c=>c.slug)).size,CITY_PAGES.length);
  assert.equal(CITY_PAGES.length,8);
  for(const c of CITY_PAGES) assert.doesNotThrow(()=>new Intl.DateTimeFormat('en',{timeZone:c.zone}));
});
test('breadcrumb trails run from home through the hub to the city',()=>{
  assert.deepEqual(timeBreadcrumbs().itemListElement.map(x=>[x.position,x.item]),[[1,BASE_URL+'/'],[2,HUB_URL]]);
  for(const c of CITY_PAGES){
    const trail=timeBreadcrumbs(c);
    assert.equal(trail['@type'],'BreadcrumbList');
    assert.deepEqual(trail.itemListElement.map(x=>[x.position,x.item]),[[1,BASE_URL+'/'],[2,HUB_URL],[3,BASE_URL+'/time/'+c.slug+'/']]);
  }
});
test('the hub is linked from the home footer and listed in the sitemap source',()=>{
  const footer=readFileSync('index.html','utf8').split('<footer')[1];
  assert.ok(footer.includes('<a href="/time/">'));
  assert.ok(readFileSync('public/sitemap.xml','utf8').includes('<loc>'+HUB_URL+'</loc>'));
});
test('every city has useful time-zone facts',()=>{
  for(const c of CITY_PAGES){
    assert.ok(c.offset.includes('UTC'));
    assert.ok(c.detail.length>90);
  }
});
