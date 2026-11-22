import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { Role } from '../../generated/prisma/enums.js';

const SALT_ROUNDS = 10;
const INVALID_CREDENTIALS_MESSAGE = 'Credenciais inválidas';
// Fixed bcrypt hash (cost 10) of a random password belonging to no account.
// Comparing against it when the e-mail is missing keeps both failure paths
// equally expensive, so response time cannot reveal account existence (CA4).
const DUMMY_PASSWORD_HASH = '$2b$10$Oul2jvwGqBU0iBBdR8PQ7eoacowGilKKRd7gFBJrxhOKNV4SHVYqm';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always run a bcrypt comparison: on the missing-user path we compare
    // against a dummy hash so the latency matches the wrong-password path.
    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    // The same exception is thrown on both paths so the response cannot reveal
    // whether the e-mail is registered (CA4).
    if (!user || !passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }
}
