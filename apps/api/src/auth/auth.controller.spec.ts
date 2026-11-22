import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter.js';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor.js';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: { register: ReturnType<typeof vi.fn> };

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
});
