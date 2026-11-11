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
