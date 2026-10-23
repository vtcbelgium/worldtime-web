import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clockSample, calibratedNow, nextSecondDelay } from '../src/clock-core.js';

test('fast sample corrects by half round-trip', () => {
  const s = clockSample(1_700_000_000_000, 100, 180);
  assert.deepEqual(s, { utcMs: 1_700_000_000_040, monoMs: 180, rtt: 80 });
  assert.equal(calibratedNow(s, 1180, 0), 1_700_000_001_040);
});
test('invalid, reversed and very slow samples are not trusted', () => {
  assert.equal(clockSample(Infinity, 0, 20), null);
  assert.equal(clockSample(1000, 20, 0), null);
  assert.equal(clockSample(1000, 0, 2501), null);
});
test('device clock fallback is explicit when no valid sample', () => {
  assert.equal(calibratedNow(null, 100, 12345), 12345);
});
test('next-second scheduler avoids busy-polling', () => {
  assert.equal(nextSecondDelay(1500), 512);
  assert.equal(nextSecondDelay(1999), 20);
  assert.equal(nextSecondDelay(Number.NaN), 1000);
});
