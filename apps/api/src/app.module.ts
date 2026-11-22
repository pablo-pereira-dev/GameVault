import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { GamesModule } from './games/games.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GamesModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
