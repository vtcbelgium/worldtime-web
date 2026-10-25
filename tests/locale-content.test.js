import test from 'node:test';
import assert from 'node:assert/strict';
import {SEASONAL} from '../scripts/seasonal-pages.mjs';
test('two distinct, complete Belgian clock-change topics have bilingual variants',()=>{
 assert.equal(SEASONAL.length,2);
 const routes=SEASONAL.flatMap(x=>[x.en,x.nl]);
 assert.equal(routes.length,new Set(routes).size);
 for(const t of SEASONAL)assert.ok(t.enCopy&&t.nlCopy&&t.source.startsWith('https://'));
});
test('English variants use English titles and meaningful copy',()=>{
 for(const t of SEASONAL){
  assert.ok(/Belgium/.test(t.enCopy.title));
  assert.ok(!/wanneer|zomertijd:|wintertijd:/i.test(t.enCopy.title));
  assert.ok(t.enCopy.intro.length>110);
 }
});
test('Dutch variants retain Dutch search intent and content',()=>{
 for(const t of SEASONAL){
  assert.ok(/wanneer gaat de klok/i.test(t.nlCopy.title));
  assert.ok(t.nlCopy.intro.length>130);
 }
});
test('all seasonal snippets remain year-independent',()=>{
 for(const t of SEASONAL)for(const variant of [t.enCopy,t.nlCopy]){
  assert.ok(variant.description.length>80);
  assert.ok(!/\b20\d{2}\b/.test(variant.description));
  assert.ok(!/\b20\d{2}\b/.test(variant.facts));
 }
});
