import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service.js';
import { CreateGameDto } from './dto/create-game.dto.js';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo jogo no catálogo' })
  @ApiResponse({ status: 201, description: 'Jogo cadastrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Já existe um jogo cadastrado com este título' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }
}
