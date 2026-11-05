import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from './app.js';

let server;
let baseUrl;
before(async () => {
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));

describe('Appointment API request validation', () => {
  it('returns a healthy API response', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  it('rejects an appointment without a customer name', async () => {
    const response = await fetch(`${baseUrl}/api/appointments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ service: 'Review', date: '2026-11-03', time: '14:00', status: 'Pending' }) });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /customer name is required/i);
  });

  it('rejects an appointment without a service', async () => {
    const response = await fetch(`${baseUrl}/api/appointments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customerName: 'Alex Morgan', date: '2026-11-03', time: '14:00', status: 'Pending' }) });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /service is required/i);
  });

  it('rejects an unsupported status before accessing the database', async () => {
    const response = await fetch(`${baseUrl}/api/appointments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customerName: 'Alex Morgan', service: 'Consultation', date: '2026-11-02', time: '10:00', status: 'Arrived' }) });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /status must be/i);
  });

  it('returns a clear error for a malformed appointment ID', async () => {
    const response = await fetch(`${baseUrl}/api/appointments/not-an-id/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'Confirmed' }) });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /invalid appointment id/i);
  });

  it('rejects an unsupported status filter', async () => {
    const response = await fetch(`${baseUrl}/api/appointments?status=Arrived`);
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /status must be/i);
  });
});
