import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGameDto } from './dto/create-game.dto.js';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGameDto: CreateGameDto) {
    try {
      return await this.prisma.game.create({
        data: createGameDto,
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Já existe um jogo cadastrado com este título.');
      }
      throw error;
    }
  }
}
