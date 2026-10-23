import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalShareUrl, findSharedCity } from '../src/share-links.js';
const cities=[{name:'Tokyo',zone:'Asia/Tokyo'},{name:'San Francisco',zone:'America/Los_Angeles'},{name:'Kathmandu',zone:'Asia/Kathmandu'}];
test('featured city opens dedicated crawlable route',()=>{
  assert.equal(canonicalShareUrl(cities[0]),'https://worldtime.othrys.be/time/tokyo/');
});
test('other named cities use a clean query route',()=>{
  assert.equal(canonicalShareUrl(cities[1]),'https://worldtime.othrys.be/?city=San+Francisco');
});
test('sharing never exposes GPS coordinates',()=>{
  const u=canonicalShareUrl({name:'Kathmandu',lat:27.717,lon:85.324});
  assert.equal(u,'https://worldtime.othrys.be/time/kathmandu/');
  assert.ok(!u.includes('27.717')&&!u.includes('85.324'));
});
test('incoming named city is resolved against a trusted allowlist',()=>{
  assert.equal(findSharedCity('?city=San+Francisco&utm_source=other',cities),cities[1]);
  assert.equal(findSharedCity('?city=Unknown',cities),null);
  assert.equal(findSharedCity('?city=Tokyo',cities),cities[0]);
});
test('overlong incoming city and name are ignored',()=>{
  assert.equal(findSharedCity('?city='+'x'.repeat(500),cities),null);
  assert.equal(canonicalShareUrl({name:'x'.repeat(500)}),'https://worldtime.othrys.be/');
});
