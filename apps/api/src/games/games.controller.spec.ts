import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';
import { ValidationPipe } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto.js';

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: {
            create: vi.fn().mockImplementation((dto) => Promise.resolve({ id: '1', ...dto })),
          },
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a game (CA1)', async () => {
    const dto = {
      title: 'Zelda',
      description: 'Adventure game',
      price: 299.99,
      stock: 5,
      imageUrl: 'http://example.com/zelda.jpg',
    };

    const result = await controller.create(dto);
    expect(result).toBeDefined();
    expect(result.title).toBe(dto.title);
    expect(vi.mocked(service.create).mock.calls[0][0]).toEqual(dto);
  });

  it('should fail validation when required fields are missing (CA3)', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
    const invalidDto = {
      description: 'Missing title, price, stock, imageUrl',
    };

    await expect(
      pipe.transform(invalidDto, { metatype: CreateGameDto, type: 'body' }),
    ).rejects.toThrow();
  });
});
