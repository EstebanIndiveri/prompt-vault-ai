import request from 'supertest';
import app from '../src/server';

async function getAuthToken(): Promise<string> {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'ana@example.com', password: 'password123' });
  return res.body.token;
}

describe('GET /users', () => {
  it('should return a list of users', async () => {
    const token = await getAuthToken();
    const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // TODO: este test expone el bug — descomentar y hacer que pase
  // it('should return empty array when there are no users', async () => {
  //   const res = await request(app).get('/users');
  //   expect(res.status).toBe(200);
  //   expect(res.body).toEqual([]);
  // });

  it.todo('should support pagination via ?page=1&pageSize=2');
});

describe('GET /users/:id', () => {
  it('should return 404 for a non-existent user', async () => {
    const token = await getAuthToken();
    const res = await request(app).get('/users/9999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  // TODO: agregar test para usuario existente
  it.todo('should return the user when found');
});

describe('POST /users', () => {
  it('should create a user with valid data', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test User', email: 'testuser@example.com', password: 'pass123' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Test User', email: 'testuser@example.com' });
    expect(res.body.password).toBeUndefined();
  });

  it('should reject a user without name', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'noname@example.com', password: 'pass123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name is required');
  });

  it('should reject a user without email', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No Email', password: 'pass123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('email is required');
  });

  it('should reject a user without password', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No Pass', email: 'nopass@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('password is required');
  });

  it('should reject an invalid email format', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Email', email: 'not-an-email', password: 'pass123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email format');
  });

  it('should reject a duplicate email', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate', email: 'ana@example.com', password: 'pass123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already in use');
  });
});

describe('GET /health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
