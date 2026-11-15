import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna mensagem de status da API' })
  @ApiResponse({ status: 200, description: 'API online e respondendo' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  getHello(): string {
    return this.appService.getHello();
  }
}
