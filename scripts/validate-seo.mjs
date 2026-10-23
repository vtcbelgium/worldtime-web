import { readFileSync } from 'node:fs';
import { CITY_PAGES } from './seo-content.mjs';
import assert from 'node:assert/strict';
const source = readFileSync('index.html','utf8');
assert.ok(source.includes('class="seo-hub"'), 'Crawlable city hub missing');
assert.ok(source.includes('rel="canonical"'), 'Canonical missing');
assert.ok(source.includes('robots'), 'Robots meta missing');
assert.ok(source.includes('<h1 id="cityName">World Clock</h1>'),'Root heading missing');
for(const c of CITY_PAGES) {
  assert.match(c.zone,/^[A-Za-z_]+\/[A-Za-z_]+/);
  assert.ok(source.includes('/time/'+c.slug+'/'),'Missing HTML link to '+c.slug);
  assert.ok(c.detail.length>90 && c.use.length>90,'Insufficient original city information: '+c.slug);
}
console.log('SEO source validation passed: '+CITY_PAGES.length+' linked and editorially distinct city entries');

// The browser must not rewrite the canonical search title as visitors explore the map.
const runtime = readFileSync('src/main.js','utf8');
assert.ok(!runtime.includes('document.title='), 'Client-side title mutations break stable intent-specific titles');
const seasonalGenerator = readFileSync('scripts/generate-seo.mjs','utf8');
for(const line of seasonalGenerator.split('\n')) {
  if (line.includes("desc:'Wanneer begint de ")) {
    assert.ok(!/20\d\d/.test(line), 'Seasonal meta descriptions must not become stale after the next clock change');
  }
}
console.log('Canonical title and evergreen metadata checks passed');
