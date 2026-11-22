import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { AuthModule } from './auth.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

const registerDto: RegisterDto = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'secret123',
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = { user: { create: vi.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'auth-service-unit-test-secret' })],
      providers: [AuthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should persist the password only as a bcrypt hash (CA1)', async () => {
    prisma.user.create.mockResolvedValue({
      id: '1',
      name: registerDto.name,
      email: registerDto.email,
      role: 'USER',
      createdAt: new Date(),
    });

    await service.register(registerDto);

    const { data } = prisma.user.create.mock.calls[0][0];

    expect(data.passwordHash).toBeDefined();
    expect(data.passwordHash).not.toBe(registerDto.password);
    expect(data.passwordHash).not.toContain(registerDto.password);
    expect(bcrypt.getRounds(data.passwordHash)).toBe(10);
    expect(await bcrypt.compare(registerDto.password, data.passwordHash)).toBe(true);
    expect(data).not.toHaveProperty('password');
  });

  it('should assign the default USER role (CA1)', async () => {
    prisma.user.create.mockResolvedValue({
      id: '1',
      name: registerDto.name,
      email: registerDto.email,
      role: 'USER',
      createdAt: new Date(),
    });

    const user = await service.register(registerDto);

    expect(prisma.user.create.mock.calls[0][0].data.role).toBe('USER');
    expect(user.role).toBe('USER');
  });

  it('should throw ConflictException (409) when the email is already registered (CA2)', async () => {
    prisma.user.create.mockRejectedValue({ code: 'P2002', meta: { target: ['email'] } });

    const error = await service.register(registerDto).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getStatus()).toBe(409);
    expect((error as ConflictException).message).toMatch(/e-mail/i);
  });

  it('should rethrow errors that are not unique-constraint violations (CA2)', async () => {
    prisma.user.create.mockRejectedValue(new Error('database is down'));

    await expect(service.register(registerDto)).rejects.toThrow('database is down');
  });
});

describe('AuthService (Integration)', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const email = 'auth-service-integration@example.com';
  const mixedCaseEmail = 'Auth-Service-Integration@Example.com';

  // Mirrors the global ValidationPipe, so the DTO normalization applied to a
  // real request is part of what this integration test exercises.
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
  const toDto = (payload: object) =>
    pipe.transform(payload, { type: 'body', metatype: RegisterDto });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ secret: 'auth-service-unit-test-secret' }),
      ],
      providers: [AuthService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [email, mixedCaseEmail] } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('should create the account with role USER and a bcrypt hash, never the plain password (CA1)', async () => {
    const user = await service.register({
      name: 'Integration User',
      email,
      password: 'secret123',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.role).toBe('USER');
    expect(user).not.toHaveProperty('passwordHash');
    expect(user).not.toHaveProperty('password');

    const stored = await prisma.user.findUnique({ where: { email } });

    expect(stored).not.toBeNull();
    expect(stored!.passwordHash).not.toBe('secret123');
    expect(await bcrypt.compare('secret123', stored!.passwordHash)).toBe(true);
  });

  it('should refuse a duplicated email with 409 and keep a single record (CA2)', async () => {
    await service.register({ name: 'Integration User', email, password: 'secret123' });

    const error = await service
      .register({ name: 'Another User', email, password: 'another123' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getStatus()).toBe(409);
    expect(await prisma.user.count({ where: { email } })).toBe(1);
  });

  it('should store the normalized email and refuse the same address typed in another case with 409 (CA2)', async () => {
    const first = await service.register(
      await toDto({ name: 'Integration User', email: mixedCaseEmail, password: 'secret123' }),
    );

    expect(first.email).toBe(email);

    const error = await service
      .register(await toDto({ name: 'Another User', email, password: 'another123' }))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getStatus()).toBe(409);
    expect(await prisma.user.count({ where: { email } })).toBe(1);
  });

  it('should persist the name without surrounding whitespace (ID7)', async () => {
    const user = await service.register(
      await toDto({ name: '  Integration User  ', email, password: 'secret123' }),
    );

    expect(user.name).toBe('Integration User');
    expect((await prisma.user.findUnique({ where: { email } }))!.name).toBe('Integration User');
  });
});

describe('AuthService (login)', () => {
  const email = 'ada@example.com';
  const password = 'secret123';
  const storedUser = {
    id: 'user-1',
    name: 'Ada Lovelace',
    email,
    role: 'USER',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  let service: AuthService;
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn> } };
  let jwt: JwtService;

  const userWithHash = async () => ({ ...storedUser, passwordHash: await bcrypt.hash(password, 10) });

  beforeEach(async () => {
    prisma = { user: { findUnique: vi.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'auth-service-unit-test-secret' })],
      providers: [AuthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should issue a signed, verifiable JWT carrying the user id, email and role (CA3)', async () => {
    prisma.user.findUnique.mockResolvedValue(await userWithHash());

    const result = await service.login({ email, password });

    expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.any(Object));
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('password');

    const payload = jwt.verify(result.accessToken) as Record<string, unknown>;
    expect(payload).toMatchObject({ sub: storedUser.id, email, role: 'USER' });
  });

  it('should sign with the injected secret rather than a value hard-coded in the service (ID17)', async () => {
    prisma.user.findUnique.mockResolvedValue(await userWithHash());

    const { accessToken } = await service.login({ email, password });

    expect(jwt.verify(accessToken)).toBeDefined();
    expect(() => new JwtService({ secret: 'a-completely-different-secret' }).verify(accessToken)).toThrow();
  });

  it('should answer 401 "Credenciais inválidas" when the email does not exist (CA4)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const error = await service.login({ email, password }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getStatus()).toBe(401);
    expect((error as UnauthorizedException).message).toBe('Credenciais inválidas');
  });

  it('should answer 401 "Credenciais inválidas" when the password is wrong (CA4)', async () => {
    prisma.user.findUnique.mockResolvedValue(await userWithHash());

    const error = await service
      .login({ email, password: 'wrong-password' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect((error as UnauthorizedException).getStatus()).toBe(401);
    expect((error as UnauthorizedException).message).toBe('Credenciais inválidas');
  });

  it('should expose an indistinguishable 401 for unknown email and wrong password (CA4)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const unknownEmailError = (await service
      .login({ email, password })
      .catch((e: unknown) => e)) as UnauthorizedException;

    prisma.user.findUnique.mockResolvedValue(await userWithHash());
    const wrongPasswordError = (await service
      .login({ email, password: 'wrong-password' })
      .catch((e: unknown) => e)) as UnauthorizedException;

    expect(unknownEmailError.getResponse()).toEqual(wrongPasswordError.getResponse());
    expect(unknownEmailError.getStatus()).toBe(wrongPasswordError.getStatus());
  });

  it('should run bcrypt.compare on both failure paths so timing cannot reveal whether the email exists (CA4)', async () => {
    const compareSpy = vi.spyOn(bcrypt, 'compare');

    try {
      prisma.user.findUnique.mockResolvedValue(null);
      const unknownEmailError = (await service
        .login({ email, password })
        .catch((e: unknown) => e)) as UnauthorizedException;

      expect(compareSpy).toHaveBeenCalledTimes(1);
      expect(compareSpy.mock.calls[0][1]).toEqual(expect.any(String));

      compareSpy.mockClear();

      prisma.user.findUnique.mockResolvedValue(await userWithHash());
      const wrongPasswordError = (await service
        .login({ email, password: 'wrong-password' })
        .catch((e: unknown) => e)) as UnauthorizedException;

      expect(compareSpy).toHaveBeenCalledTimes(1);
      expect(unknownEmailError.getResponse()).toEqual(wrongPasswordError.getResponse());
      expect(unknownEmailError.getStatus()).toBe(wrongPasswordError.getStatus());
    } finally {
      compareSpy.mockRestore();
    }
  });
});

describe('AuthService (login, integration)', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const email = 'auth-login-integration@example.com';
  const mixedCaseEmail = 'Auth-Login-Integration@Example.com';
  const password = 'secret123';

  // Mirrors the global ValidationPipe, so the DTO normalization applied to a
  // real request is part of what this integration test exercises.
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
  const toDto = (payload: object) =>
    pipe.transform(payload, { type: 'body', metatype: LoginDto });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [email, mixedCaseEmail] } } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('should register a real user and then issue a verifiable JWT on login (CA3)', async () => {
    const created = await service.register({ name: 'Integration User', email, password });

    const { accessToken } = await service.login(await toDto({ email, password }));
    const payload = jwt.verify(accessToken) as Record<string, unknown>;

    expect(payload).toMatchObject({ sub: created.id, email, role: 'USER' });
  });

  it('should emit a JWT with an exp claim so tokens are not eternal (CA3)', async () => {
    await service.register({ name: 'Integration User', email, password });

    const { accessToken } = await service.login(await toDto({ email, password }));
    const payload = jwt.verify(accessToken) as Record<string, unknown>;

    expect(payload.exp).toEqual(expect.any(Number));
    expect((payload.exp as number) > (payload.iat as number)).toBe(true);
  });

  it('should log in with an email typed in another case, as the DTO normalizes it (CA4)', async () => {
    const created = await service.register({ name: 'Integration User', email, password });

    const { accessToken } = await service.login(await toDto({ email: mixedCaseEmail, password }));

    expect((jwt.verify(accessToken) as Record<string, unknown>).sub).toBe(created.id);
  });

  it('should give the same generic 401 for an unknown email and for a wrong password (CA4)', async () => {
    await service.register({ name: 'Integration User', email, password });

    const unknownEmailError = await service
      .login(await toDto({ email: 'nobody@example.com', password }))
      .catch((e: unknown) => e);
    const wrongPasswordError = await service
      .login(await toDto({ email, password: 'wrong-password' }))
      .catch((e: unknown) => e);

    expect(unknownEmailError).toBeInstanceOf(UnauthorizedException);
    expect((unknownEmailError as UnauthorizedException).getStatus()).toBe(401);
    expect((unknownEmailError as UnauthorizedException).message).toBe('Credenciais inválidas');
    expect(wrongPasswordError).toBeInstanceOf(UnauthorizedException);
    expect((wrongPasswordError as UnauthorizedException).getStatus()).toBe(401);
    expect((wrongPasswordError as UnauthorizedException).getResponse()).toEqual(
      (unknownEmailError as UnauthorizedException).getResponse(),
    );
  });
});
