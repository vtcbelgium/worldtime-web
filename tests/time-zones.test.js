import { test } from 'node:test';
import assert from 'node:assert/strict';

function offset(iso, zone) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', timeZone: zone, timeZoneName: 'longOffset'
  }).formatToParts(date).find(p => p.type === 'timeZoneName').value;
}
test('Brussels falls back correctly on 25 October 2026', () => {
  assert.equal(offset('2026-10-25T00:30:00Z', 'Europe/Brussels'), 'GMT+02:00');
  assert.equal(offset('2026-10-25T01:30:00Z', 'Europe/Brussels'), 'GMT+01:00');
});
test('fractional offsets remain exact', () => {
  assert.equal(offset('2026-10-23T10:00:00Z', 'Asia/Kathmandu'), 'GMT+05:45');
  assert.equal(offset('2026-01-15T10:00:00Z', 'Australia/Adelaide'), 'GMT+10:30');
});
