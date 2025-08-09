import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './energyTrend.js';

function createRes() {
  return {
    statusCode: 0,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
    }
  };
}

const originalFetch = global.fetch;

test('returns 400 when parameters are missing', async () => {
  const req = { method: 'GET', query: { plantId: '1', type: 'day', date: '2023-01-01' } };
  const res = createRes();

  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Missing required parameters' });
});

test('handles non-ok fetch with 500 error', async () => {
  const req = { method: 'GET', query: { plantId: '1', type: 'day', date: '2023-01-01', token: 'abc' } };
  const res = createRes();

  global.fetch = async () => ({ ok: false, status: 500 });

  await handler(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, 'Failed to fetch energy trend');
});

test('returns 200 and success true with valid fetch', async () => {
  const mockData = { foo: 'bar' };
  const req = { method: 'GET', query: { plantId: '1', type: 'day', date: '2023-01-01', token: 'abc' } };
  const res = createRes();

  global.fetch = async () => ({ ok: true, json: async () => mockData });

  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, data: mockData });
});

test.after(() => {
  global.fetch = originalFetch;
});
