import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalShareUrl, findSharedCity, findSharedZone } from '../src/share-links.js';
const cities=[{name:'Tokyo',zone:'Asia/Tokyo'},{name:'San Francisco',zone:'America/Los_Angeles'},{name:'Kathmandu',zone:'Asia/Kathmandu'}];
test('featured city opens dedicated crawlable route',()=>{
  assert.equal(canonicalShareUrl(cities[0]),'https://worldtime.othrys.be/time/tokyo/');
});
test('other known cities use a clean allowlisted query route',()=>{
  assert.equal(canonicalShareUrl(cities[1],undefined,cities),'https://worldtime.othrys.be/?city=San+Francisco');
});
test('arbitrary map zones retain the IANA zone without exposing a coordinate',()=>{
  const u=canonicalShareUrl({name:'Anchorage',zone:'America/Anchorage',lat:61.218,lon:-149.9},undefined,cities);
  assert.equal(u,'https://worldtime.othrys.be/?zone=America%2FAnchorage');
  assert.equal(findSharedZone(new URL(u).search),'America/Anchorage');
  assert.ok(!u.includes('61.218')&&!u.includes('-149.9'));
});
test('sharing a featured city never exposes GPS coordinates',()=>{
  const u=canonicalShareUrl({name:'Kathmandu',zone:'Asia/Kathmandu',lat:27.717,lon:85.324});
  assert.equal(u,'https://worldtime.othrys.be/time/kathmandu/');
});
test('incoming city resolves against trusted allowlist',()=>{
  assert.equal(findSharedCity('?city=San+Francisco&utm_source=other',cities),cities[1]);
  assert.equal(findSharedCity('?city=Unknown',cities),null);
});
test('incoming zones must be real IANA values',()=>{
  assert.equal(findSharedZone('?zone=Invalid%2FPlace'),null);
  assert.equal(findSharedZone('?zone=Europe%2FBrussels'),'Europe/Brussels');
});
test('invalid or oversized names degrade to canonical homepage',()=>{
  assert.equal(findSharedCity('?city='+'x'.repeat(500),cities),null);
  assert.equal(canonicalShareUrl({name:'x'.repeat(500)}),'https://worldtime.othrys.be/');
});
