import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppModule } from './app.module.js';
import { GamesModule } from './games/games.module.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should import GamesModule in AppModule', async () => {
      const app: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      expect(app.get(GamesModule)).toBeDefined();
    });
  });
});
