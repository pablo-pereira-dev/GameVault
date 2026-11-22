import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service.js';
import { ConfigModule } from '@nestjs/config';

describe('PrismaService Game model (Integration)', () => {
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.game.deleteMany({}).catch(() => {});
    await prisma.$disconnect();
  });

  it('should create a game and enforce unique title', async () => {
    const gameData = {
      title: 'The Witcher 3',
      description: 'RPG masterpiece',
      price: 199.99,
      stock: 10,
      imageUrl: 'https://example.com/witcher3.jpg',
    };

    const game = await prisma.game.create({ data: gameData });
    expect(game).toBeDefined();
    expect(game.title).toBe(gameData.title);

    await expect(
      prisma.game.create({ data: gameData }),
    ).rejects.toThrow();
  });
});

describe('PrismaService User model (Integration)', () => {
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({}).catch(() => {});
    await prisma.$disconnect();
  });

  it('should persist a user with default role USER and enforce unique email', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed_password_example',
    };

    const user = await prisma.user.create({ data: userData });
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.passwordHash).toBe(userData.passwordHash);
    expect(user.role).toBe('USER');
    expect(user.createdAt).toBeInstanceOf(Date);

    await expect(
      prisma.user.create({
        data: {
          name: 'Another User',
          email: 'test@example.com',
          passwordHash: 'another_hash',
        },
      }),
    ).rejects.toThrow();
  });

  it('should allow creating an admin user with role ADMIN', async () => {
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'admin_hash',
      role: 'ADMIN' as const,
    };

    const admin = await prisma.user.create({ data: adminData });
    expect(admin).toBeDefined();
    expect(admin.role).toBe('ADMIN');
  });
});
