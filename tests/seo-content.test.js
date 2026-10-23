import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CITY_PAGES } from '../scripts/seo-content.mjs';
test('city pages contain unique slugs and IANA zones',()=> {
  assert.equal(new Set(CITY_PAGES.map(c=>c.slug)).size,CITY_PAGES.length);
  assert.equal(CITY_PAGES.length,8);
  for(const c of CITY_PAGES) assert.doesNotThrow(()=>new Intl.DateTimeFormat('en',{timeZone:c.zone}));
});
test('every city has useful time-zone facts',()=>{
  for(const c of CITY_PAGES){
    assert.ok(c.offset.includes('UTC'));
    assert.ok(c.detail.length>90);
  }
});
