const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { createApp } = require('../src/app');
const { ExpenseStore } = require('../src/store');


const TEST_DATA_FILE = path.join(__dirname, 'test-data.json');

let app;
let store;

beforeEach(() => {
  if (fs.existsSync(TEST_DATA_FILE)) fs.unlinkSync(TEST_DATA_FILE);
  store = new ExpenseStore(TEST_DATA_FILE);
  app = createApp(store);
});

afterAll(() => {
  if (fs.existsSync(TEST_DATA_FILE)) fs.unlinkSync(TEST_DATA_FILE);
});

const sampleExpense = {
  title: 'Groceries',
  amount: 45.5,
  category: 'Food',
  date: '2026-07-01',
};

describe('GET /', () => {
  it('returns welcome message and API index', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.endpoints).toBeDefined();
  });
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/expenses', () => {
  it('creates an expense and returns 201 with an id', async () => {
    const res = await request(app).post('/api/expenses').send(sampleExpense);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(sampleExpense);
    expect(res.body.id).toBeDefined();
  });

  it('rejects missing title', async () => {
    const { title, ...rest } = sampleExpense;
    const res = await request(app).post('/api/expenses').send(rest);
    expect(res.status).toBe(400);
    expect(res.body.errors.join(' ')).toMatch(/title/);
  });

  it('rejects non-positive amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ ...sampleExpense, amount: -5 });
    expect(res.status).toBe(400);
    expect(res.body.errors.join(' ')).toMatch(/amount/);
  });

  it('rejects invalid date format', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ ...sampleExpense, date: '07/01/2026' });
    expect(res.status).toBe(400);
    expect(res.body.errors.join(' ')).toMatch(/date/);
  });

  it('rejects malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Content-Type', 'application/json')
      .send('{not valid json');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/expenses', () => {
  it('returns an empty list initially', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body.expenses).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it('returns all created expenses', async () => {
    await request(app).post('/api/expenses').send(sampleExpense);
    await request(app)
      .post('/api/expenses')
      .send({ ...sampleExpense, title: 'Bus ticket', category: 'Transport', amount: 20 });

    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  it('filters by category (case-insensitive)', async () => {
    await request(app).post('/api/expenses').send(sampleExpense);
    await request(app)
      .post('/api/expenses')
      .send({ ...sampleExpense, title: 'Bus ticket', category: 'Transport', amount: 20 });

    const res = await request(app).get('/api/expenses').query({ category: 'food' });
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.expenses[0].title).toBe('Groceries');
  });
});

describe('GET /api/expenses/:id', () => {
  it('returns a single expense by id', async () => {
    const created = await request(app).post('/api/expenses').send(sampleExpense);
    const res = await request(app).get(`/api/expenses/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/expenses/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/expenses/total', () => {
  it('computes the overall total and per-category breakdown', async () => {
    await request(app).post('/api/expenses').send(sampleExpense); // Food 45.5
    await request(app)
      .post('/api/expenses')
      .send({ ...sampleExpense, title: 'Snacks', category: 'Food', amount: 10 });
    await request(app)
      .post('/api/expenses')
      .send({ ...sampleExpense, title: 'Bus ticket', category: 'Transport', amount: 20 });

    const res = await request(app).get('/api/expenses/total');
    expect(res.status).toBe(200);
    expect(res.body.overallTotal).toBeCloseTo(75.5);
    expect(res.body.totalsByCategory.Food).toBeCloseTo(55.5);
    expect(res.body.totalsByCategory.Transport).toBeCloseTo(20);
  });

  it('computes the total for a single category', async () => {
    await request(app).post('/api/expenses').send(sampleExpense);
    await request(app)
      .post('/api/expenses')
      .send({ ...sampleExpense, title: 'Bus ticket', category: 'Transport', amount: 20 });

    const res = await request(app).get('/api/expenses/total').query({ category: 'Food' });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeCloseTo(45.5);
  });
});

describe('DELETE /api/expenses/:id', () => {
  it('deletes an existing expense and returns 204', async () => {
    const created = await request(app).post('/api/expenses').send(sampleExpense);
    const res = await request(app).delete(`/api/expenses/${created.body.id}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/api/expenses/${created.body.id}`);
    expect(getRes.status).toBe(404);
  });

  it('returns 404 when deleting an unknown id', async () => {
    const res = await request(app).delete('/api/expenses/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('GET /unknown-route', () => {
  it('returns 404 for unregistered routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
  });
});
