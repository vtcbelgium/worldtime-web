import {readFileSync} from 'node:fs';
import {CITY_PAGES} from './seo-content.mjs';
import assert from 'node:assert/strict';
const source=readFileSync('index.html','utf8');
assert.ok(source.includes('class="seo-hub"'),'City list not crawlable');
assert.ok(source.includes('<a href="/time/">'),'Footer link to city hub missing');
assert.ok(source.includes('rel="canonical"'),'Canonical missing');
assert.ok(source.includes('robots'),'Robots meta missing');
assert.ok(source.includes('<h1 class="clock-kicker" id="pageHeadline">WORLD CLOCK · CORRECT TIME NOW</h1>'),'Generic homepage H1 missing');
assert.ok(!/seo-seasonal|href="\/(?:wintertijd|zomertijd|winter-time-belgium|summer-time-belgium)\//.test(source),'Seasonal link/section not removed');
for(const city of CITY_PAGES) {
  assert.match(city.zone,/^[A-Za-z_]+\/[A-Za-z_]+/);
  assert.ok(source.includes('/time/'+city.slug+'/'),'Missing city link '+city.slug);
  assert.ok(city.detail.length>90&&city.use.length>90,'Missing useful city content '+city.slug);
}
const runtime=readFileSync('src/main.js','utf8');
assert.ok(!runtime.includes('document.title='),'Keep stable page titles');
assert.ok(runtime.includes("dom.headline.textContent='CORRECT TIME IN '"),'Selected-city dynamic headline is missing');
assert.ok(runtime.includes('staticCity.hidden='),'Stale city details must be hidden when another clock is selected');
const gen=readFileSync('scripts/generate-seo.mjs','utf8');
assert.ok(!gen.includes('writeSeasonalPages'),'Seasonal pages must not be generated');
console.log('World-clock-only source checks passed: selected location drives heading; seasonal content absent.');
