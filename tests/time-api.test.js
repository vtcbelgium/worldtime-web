import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/time.js';

function call(method) {
  const headers = {};
  const response = {
    statusCode: 200, body: null, ended: false,
    setHeader(key, value) { headers[key.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { this.ended = true; return this; }
  };
  handler({ method }, response);
  return { headers, response };
}
test('GET returns the current UTC epoch without caching', () => {
  const before = Date.now();
  const { headers, response } = call('GET');
  assert.equal(response.statusCode, 200);
  assert.ok(response.body.unixMs >= before && response.body.unixMs <= Date.now());
  assert.match(headers['cache-control'], /no-store/);
  assert.equal(response.body.source, 'server');
});
test('HEAD returns no response body', () => {
  const { response } = call('HEAD');
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, null);
  assert.equal(response.ended, true);
});
test('write methods are rejected', () => {
  const { headers, response } = call('POST');
  assert.equal(response.statusCode, 405);
  assert.equal(headers.allow, 'GET, HEAD');
});
