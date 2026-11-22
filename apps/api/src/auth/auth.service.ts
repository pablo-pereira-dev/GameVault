import { ConflictException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { Role } from '../../generated/prisma/enums.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      return await this.prisma.user.create({
        data: { name, email, passwordHash, role: Role.USER },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('E-mail já está em uso.');
      }
      throw error;
    }
  }
}
