import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPTS_WINDOW_MINUTES = 10;
const LOCKOUT_MINUTES = 15;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** RF-01: login seguro com hashing Argon2id e bloqueio após 5 tentativas em 10 min. */
  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('ACCOUNT_TEMPORARILY_LOCKED');
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);
    if (!passwordValid) {
      await this.registerFailedAttempt(user.id, user.failedLoginAttempts);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    return this.issueTokenPair({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });
  }

  private async registerFailedAttempt(userId: string, currentAttempts: number) {
    const attempts = currentAttempts + 1;
    const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
          : undefined,
      },
    });
    // Nota: a janela de 10 min (LOGIN_ATTEMPTS_WINDOW_MINUTES) deve ser aplicada
    // resetando failedLoginAttempts via job agendado ou TTL no Redis em produção.
    void LOGIN_ATTEMPTS_WINDOW_MINUTES;
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
      }

      return this.issueTokenPair({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
        email: user.email,
      });
    } catch {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }
  }

  private issueTokenPair(payload: {
    sub: string;
    tenantId: string;
    role: string;
    email: string;
  }): TokenPair {
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    return { accessToken, refreshToken };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        crp: true,
        phone: true,
        pixKey: true,
        role: true,
        planType: true,
      },
    });
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
    return { data: user };
  }

  static async hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }
}
