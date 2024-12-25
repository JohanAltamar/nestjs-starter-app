import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

// Entities
import { User } from 'src/common/entities/user.entity';

// Helpers
import { getUserRolesAndPermissions } from 'src/users/helpers/get-user-roles-and-permissions';

// Types
import type { JwtPayload, UserResponse } from '../interfaces';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<UserResponse> {
    const { id } = payload;

    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new UnauthorizedException('Token not valid');

    if (!user.isActive)
      throw new UnauthorizedException(
        'User is inactive, contact the app admin',
      );

    return { ...user, ...getUserRolesAndPermissions(user), refreshToken };
  }
}
