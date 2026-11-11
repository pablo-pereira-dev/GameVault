import { IsNotEmpty, IsNumber, IsPositive, IsString, IsInt, Min } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  @IsNotEmpty()
  imageUrl!: string;
}
