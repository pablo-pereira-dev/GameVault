import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { Role } from './../generated/prisma/enums.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('Auth guards and /auth/me (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwt: JwtService;

  const userEmail = 'auth-guards-user@example.com';
  const adminEmail = 'auth-guards-admin@example.com';
  const password = 'secret123';
  const gameTitle = `E2E Guard Game ${Date.now()}`;
  const gamePayload = {
    title: gameTitle,
    description: 'Jogo usado no teste de autorização',
    price: 99.9,
    stock: 3,
    imageUrl: 'https://example.com/guard-game.jpg',
  };

  let userId: string;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwt = moduleFixture.get<JwtService>(JwtService);
    app = moduleFixture.createNestApplication();
    await app.init();

    await prisma.game.deleteMany({ where: { title: gameTitle } });
    await prisma.user.deleteMany({ where: { email: { in: [userEmail, adminEmail] } } });

    // Register and login are called with no token: they must stay public
    // once the global JwtAuthGuard is in place (ID9).
    const registered = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Common User', email: userEmail, password })
      .expect(201);
    userId = registered.body.data.id;

    const loggedIn = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);
    userToken = loggedIn.body.data.accessToken;

    // Admins are provisioned directly in the database, never via /register (RN07).
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: Role.ADMIN,
      },
    });

    const adminLoggedIn = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    adminToken = adminLoggedIn.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.game.deleteMany({ where: { title: gameTitle } });
    await prisma.user.deleteMany({ where: { email: { in: [userEmail, adminEmail] } } });
    await app.close();
  });

  it('should return 401 for GET /auth/me with no token (CA8)', async () => {
    const response = await request(app.getHttpServer()).get('/auth/me').expect(401);

    expect(response.body).toMatchObject({ statusCode: 401, error: 'Unauthorized' });
  });

  it('should return the authenticated user profile without passwordHash for GET /auth/me (CA8, ID6)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.data).toMatchObject({
      id: userId,
      name: 'Common User',
      email: userEmail,
      role: Role.USER,
    });
    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('should return 401 for GET /auth/me with an expired token (CA8)', async () => {
    const expiredToken = jwt.sign(
      { sub: userId, email: userEmail, role: Role.USER },
      { expiresIn: -1 },
    );

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should return 401 for GET /auth/me with an adulterated token (CA8)', async () => {
    const foreignToken = new JwtService({ secret: 'a-totally-different-secret' }).sign({
      sub: userId,
      email: userEmail,
      role: Role.USER,
    });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${foreignToken}`)
      .expect(401);
  });

  it('should deny a USER with 403 Forbidden on the administrative POST /games route (CA6)', async () => {
    const before = await prisma.game.count({ where: { title: gameTitle } });

    const response = await request(app.getHttpServer())
      .post('/games')
      .set('Authorization', `Bearer ${userToken}`)
      .send(gamePayload)
      .expect(403);

    expect(response.body).toMatchObject({ statusCode: 403, error: 'Forbidden' });
    expect(await prisma.game.count({ where: { title: gameTitle } })).toBe(before);
  });

  it('should allow an ADMIN on the administrative POST /games route (CA6)', async () => {
    await request(app.getHttpServer())
      .post('/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(gamePayload)
      .expect(201);
  });

  it('should keep the healthcheck public under the global guard (ID9)', async () => {
    await request(app.getHttpServer()).get('/').expect(200).expect({ data: 'Hello World!' });
  });
});
