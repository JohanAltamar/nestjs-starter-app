import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// Types
import { type JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  generatePasswordRecoveryToken(email: string) {
    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get<string>('JWT_PASSWORD_RECOVERY_SECRET'),
        expiresIn: '15m',
      },
    );

    return { token };
  }

  decodePasswordRecoveryToken(token: string) {
    try {
      const { email } = this.jwtService.verify<{ email: string }>(token, {
        secret: this.configService.get<string>('JWT_PASSWORD_RECOVERY_SECRET'),
      });

      return { email, ok: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return { ok: false };
    }
  }
}
