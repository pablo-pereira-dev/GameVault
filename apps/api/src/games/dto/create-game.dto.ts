import { IsNotEmpty, IsNumber, IsPositive, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({
    description: 'Título único do jogo',
    example: 'The Witcher 3: Wild Hunt',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Descrição detalhada do jogo',
    example: 'RPG de mundo aberto com caçador de monstros Geralt de Rívia.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Preço unitário do jogo em reais',
    example: 199.99,
  })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({
    description: 'Quantidade disponível em estoque',
    example: 10,
  })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({
    description: 'URL da imagem da capa do jogo',
    example: 'https://example.com/witcher3.jpg',
  })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;
}
