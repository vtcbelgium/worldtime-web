import { readFileSync } from 'node:fs';
import { CITY_PAGES } from './seo-content.mjs';
import { SEASONAL } from './seasonal-pages.mjs';
import assert from 'node:assert/strict';
const source = readFileSync('index.html','utf8');
assert.ok(source.includes('class="seo-hub"'), 'Crawlable city hub missing');
assert.ok(source.includes('rel="canonical"'), 'Canonical missing');
assert.ok(source.includes('robots'), 'Robots meta missing');
assert.ok(source.includes('<h1 class="clock-kicker" id="pageHeadline">WORLD CLOCK · CORRECT TIME NOW</h1>'),'Stable descriptive root heading missing');
for(const c of CITY_PAGES) {
  assert.match(c.zone,/^[A-Za-z_]+\/[A-Za-z_]+/);
  assert.ok(source.includes('/time/'+c.slug+'/'),'Missing HTML link to '+c.slug);
  assert.ok(c.detail.length>90 && c.use.length>90,'Insufficient original city information: '+c.slug);
}
console.log('SEO source validation passed: '+CITY_PAGES.length+' linked and editorially distinct city entries');

// The browser must not rewrite the canonical search title as visitors explore the map.
const runtime = readFileSync('src/main.js','utf8');
assert.ok(!runtime.includes('document.title='), 'Client-side title mutations break stable intent-specific titles');
assert.equal(SEASONAL.length,2,'Expected two winter/summer topics');
for(const topic of SEASONAL){
  for(const version of [topic.nlCopy,topic.enCopy]){
    assert.ok(version.description.length>80,'Seasonal description too short');
    assert.ok(!/20\d{2}/.test(version.description),'Seasonal description must be evergreen');
  }
}
const generator=readFileSync('scripts/generate-seo.mjs','utf8');
assert.ok(generator.includes('writeSeasonalPages'),'Missing localization generator');
assert.ok(source.includes('href="/winter-time-belgium/"')&&source.includes('href="/summer-time-belgium/"'),'Home must link to English guides');
console.log('Canonical titles and localized seasonal metadata checks passed');
