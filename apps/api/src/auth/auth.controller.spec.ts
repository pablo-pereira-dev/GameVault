import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthModule } from './auth.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter.js';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor.js';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: { register: ReturnType<typeof vi.fn>; login: ReturnType<typeof vi.fn> };

  const validPayload = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'secret123',
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn().mockImplementation((dto: typeof validPayload) =>
        Promise.resolve({
          id: '1',
          name: dto.name,
          email: dto.email,
          role: 'USER',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ),
      login: vi.fn().mockResolvedValue({ accessToken: 'signed.jwt.token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should register a user and answer 201 (CA1)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validPayload)
      .expect(201);

    expect(response.body.data).toMatchObject({
      name: validPayload.name,
      email: validPayload.email,
      role: 'USER',
    });
    expect(response.body.data).not.toHaveProperty('password');
    expect(response.body.data).not.toHaveProperty('passwordHash');
    expect(authService.register).toHaveBeenCalledWith(validPayload);
  });

  it('should hand the trimmed name and the normalized email to the service (ID7)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validPayload, name: '  Ada Lovelace  ', email: '  Ada@Example.COM  ' })
      .expect(201);

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: validPayload.password,
    });
  });

  it('should answer 400 when the name is made only of whitespace (CA5)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validPayload, name: '   ' })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should answer 400 when a required field is missing (CA5)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: validPayload.email, password: validPayload.password })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should answer 400 when the email is malformed (CA5)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validPayload, email: 'ada-at-example.com' })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should answer 400 when the password is shorter than 6 characters (CA5)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...validPayload, password: '12345' })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should answer 409 when the email is already in use (CA2)', async () => {
    authService.register.mockRejectedValueOnce(new ConflictException('E-mail já está em uso.'));

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validPayload)
      .expect(409);

    expect(response.body).toMatchObject({
      statusCode: 409,
      message: 'E-mail já está em uso.',
    });
  });

  it('should log in and return the access token inside data (CA3)', async () => {
    const loginPayload = { email: validPayload.email, password: validPayload.password };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginPayload)
      .expect(200);

    expect(response.body.data).toEqual({ accessToken: 'signed.jwt.token' });
    expect(authService.login).toHaveBeenCalledWith(loginPayload);
  });

  it('should hand the normalized email to the login service (CA4)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: '  Ada@Example.COM  ', password: validPayload.password })
      .expect(200);

    expect(authService.login).toHaveBeenCalledWith({
      email: validPayload.email,
      password: validPayload.password,
    });
  });

  it('should answer 400 and not call the service when the email is missing (CA5)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ password: validPayload.password })
      .expect(400);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should answer 400 and not call the service when the email is malformed (CA5)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ada-at-example.com', password: validPayload.password })
      .expect(400);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should answer 400 and not call the service when the password is missing (CA5)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validPayload.email })
      .expect(400);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should answer 400 and not call the service when the password is shorter than 6 characters (CA5)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validPayload.email, password: '12345' })
      .expect(400);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should answer a generic 401 when the email is unknown (CA4)', async () => {
    authService.login.mockRejectedValueOnce(new UnauthorizedException('Credenciais inválidas'));

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'unknown@example.com', password: validPayload.password })
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: 'Credenciais inválidas',
      error: 'Unauthorized',
    });
  });

  it('should answer the exact same 401 body when the password is wrong (CA4)', async () => {
    authService.login.mockRejectedValueOnce(new UnauthorizedException('Credenciais inválidas'));
    const unknownEmailResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'unknown@example.com', password: validPayload.password })
      .expect(401);

    authService.login.mockRejectedValueOnce(new UnauthorizedException('Credenciais inválidas'));
    const wrongPasswordResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: validPayload.email, password: 'wrong-password' })
      .expect(401);

    expect(wrongPasswordResponse.body).toEqual(unknownEmailResponse.body);
  });
});

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  const email = 'auth-login-controller-integration@example.com';
  const password = 'secret123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email } }).catch(() => {});
    await app.close();
  });

  it('should register a real user and then log in over HTTP with a verifiable token (CA3)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Integration User', email, password })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect((jwt.verify(response.body.data.accessToken) as Record<string, unknown>).email).toBe(email);
  });

  it('should reject an unknown email and a wrong password with the same HTTP 401 body (CA4)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Integration User', email, password })
      .expect(201);

    const unknownEmailResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password })
      .expect(401);

    const wrongPasswordResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);

    expect(unknownEmailResponse.body).toEqual({
      statusCode: 401,
      message: 'Credenciais inválidas',
      error: 'Unauthorized',
    });
    expect(wrongPasswordResponse.body).toEqual(unknownEmailResponse.body);
  });
});
