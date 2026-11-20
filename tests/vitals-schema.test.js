import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
const schemas = blocks.map(b => JSON.parse(b));
const types = schemas.map(s => s['@type']);

test('index.html has WebSite, WebApplication and FAQPage JSON-LD', () => {
  for (const t of ['WebSite', 'WebApplication', 'FAQPage']) assert.ok(types.includes(t), t);
});

test('FAQPage has 3 well-formed Q&As', () => {
  const faq = schemas.find(s => s['@type'] === 'FAQPage');
  assert.equal(faq['@context'], 'https://schema.org');
  assert.equal(faq.mainEntity.length, 3);
  for (const q of faq.mainEntity) {
    assert.equal(q['@type'], 'Question');
    assert.ok(q.name.length > 0);
    assert.equal(q.acceptedAnswer['@type'], 'Answer');
    assert.ok(q.acceptedAnswer.text.length > 0);
  }
});

test('JSON-LD has no Person types, fake ratings or anti-ad claims', () => {
  const all = blocks.join('\n');
  assert.doesNotMatch(all, /"@type"\s*:\s*"Person"/);
  assert.doesNotMatch(all, /aggregateRating|"Review"|"author"/);
  assert.doesNotMatch(all, /zero ads|never ads|no ads/i);
});
