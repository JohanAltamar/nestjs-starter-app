import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Controllers
import { AuthController } from './auth.controller';

// Modules
import { CommonModule } from 'src/common/common.module';

// Providers
import { AuthService } from './auth.service';
import {
  GoogleStrategy,
  AccessTokenStrategy,
  RefreshTokenStrategy,
} from './strategies';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    GoogleStrategy,
    RefreshTokenStrategy,
  ],
  imports: [
    ConfigModule,
    CommonModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     // secret: process.env.JWT_SECRET,
    //     secret: configService.get('JWT_ACCESS_SECRET'),
    //     signOptions: {
    //       expiresIn: '1d',
    //     },
    //   }),
    // }),
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '1d',
    //   },
    // }),
  ],
  exports: [
    AuthService,
    GoogleStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
