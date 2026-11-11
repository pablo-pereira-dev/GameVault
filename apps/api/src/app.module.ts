import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { GamesModule } from './games/games.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GamesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
