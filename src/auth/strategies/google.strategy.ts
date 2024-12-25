import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { Repository } from 'typeorm';

// Entities
import { User } from 'src/common/entities/user.entity';

// Helpers
import { getUserRolesAndPermissions } from 'src/users/helpers/get-user-roles-and-permissions';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      fullName: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
    };

    const userInfo = await this.userRepository.findOneBy({ email: user.email });

    if (userInfo) {
      if (!userInfo.isActive)
        throw new UnauthorizedException(
          'User is inactive, contact the app admin',
        );

      done(null, {
        ...user,
        ...userInfo,
        ...getUserRolesAndPermissions(userInfo),
      });
    }

    done(null, user);
  }
}
