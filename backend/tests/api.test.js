const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/climate_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Health check', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('Climate API', () => {
  it('GET /api/climate/latest should return 200', async () => {
    const res = await request(app).get('/api/climate/latest');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/climate with valid data should return 201', async () => {
    const payload = {
      sensorId: 'TEST-001',
      location: { name: 'Test Station', city: 'Test City', country: 'IN' },
      temperature: { celsius: 28.5 },
      humidity: 65,
      pressure: 1013,
      windSpeed: 12,
    };
    const res = await request(app).post('/api/climate').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/climate with invalid data should return 400', async () => {
    const res = await request(app).post('/api/climate').send({ sensorId: '' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Alert API', () => {
  it('GET /api/alerts should return 200', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/alerts/summary should return severity counts', async () => {
    const res = await request(app).get('/api/alerts/summary');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('critical');
    expect(res.body.data).toHaveProperty('warning');
  });
});

describe('Sensor API', () => {
  it('GET /api/sensors should return 200', async () => {
    const res = await request(app).get('/api/sensors');
    expect(res.statusCode).toBe(200);
  });
});
