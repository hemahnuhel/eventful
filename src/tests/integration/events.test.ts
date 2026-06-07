import request from 'supertest';
import app from '../../app';

describe('GET /api/v1/events', () => {
  it('returns 200 with event list', async () => {
    const res = await request(app).get('/api/v1/events');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /api/v1/events', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/events').send({});
    expect(res.status).toBe(401);
  });
});
