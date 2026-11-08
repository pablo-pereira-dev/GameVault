import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('GamesService', () => {
  let service: GamesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: PrismaService,
          useValue: {
            game: {
              create: vi.fn().mockResolvedValue({
                id: '1',
                title: 'Test Game',
                description: 'Test Description',
                price: 99.99,
                stock: 10,
                imageUrl: 'http://example.com/image.jpg',
                createdAt: new Date(),
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a game successfully (CA1)', async () => {
    const dto = {
      title: 'Test Game',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
      imageUrl: 'http://example.com/image.jpg',
    };

    const result = await service.create(dto);
    expect(result).toBeDefined();
    expect(result.title).toBe(dto.title);
    expect(vi.mocked(prisma.game.create).mock.calls[0][0]).toEqual({ data: dto });
  });
});
