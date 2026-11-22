import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'Ada Lovelace',
  })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'E-mail único do usuário',
    example: 'ada@example.com',
  })
  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha em texto puro, com no mínimo 6 caracteres',
    example: 'secret123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
