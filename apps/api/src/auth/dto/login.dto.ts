import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NormalizeEmail } from '../../common/decorators/normalize-email.decorator.js';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail da conta',
    example: 'ada@example.com',
  })
  @NormalizeEmail()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha da conta, com no mínimo 6 caracteres',
    example: 'secret123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
