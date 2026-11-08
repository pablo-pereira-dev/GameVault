import { Controller, Post, Body } from '@nestjs/common';
import { GamesService } from './games.service.js';
import { CreateGameDto } from './dto/create-game.dto.js';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  async create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }
}
