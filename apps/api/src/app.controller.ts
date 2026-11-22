import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator.js';
import { AppService } from './app.service.js';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Retorna mensagem de status da API' })
  @ApiResponse({ status: 200, description: 'API online e respondendo' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  getHello(): string {
    return this.appService.getHello();
  }
}
