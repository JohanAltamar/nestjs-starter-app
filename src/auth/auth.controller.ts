import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

// Decorators
import { Auth, GetUser, PermissionProtected, RawHeaders } from './decorators';

// DTOs
import { CreateUserDto } from 'src/users/dto';
import { LoginUserDto } from './dto';

// Entities
import { User } from 'src/users/entities/user.entity';

// Guards
import { GoogleOauthGuard, UserPermissionGuard } from './guards';

// Providers
import { AuthService } from './auth.service';

// Types
import type { Response } from 'express';
import { ValidPermissions } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto, false);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoutes(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'Hello from private',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  // @SetMetadata('permissions', ['CREATE_USER', 'UPDATE_USER'])
  @PermissionProtected(ValidPermissions.create_appointment)
  @UseGuards(AuthGuard(), UserPermissionGuard)
  testPrivate2Route(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hello from private 2',
      user,
    };
  }

  @Get('private3')
  @Auth('permission', ValidPermissions.create_user)
  testPrivate3Route(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hello from private 3',
      user,
    };
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      const { access, refresh } = await this.authService.oAuthLogin(req.user);
      res.redirect(
        `${this.configService.get('FRONTEND_URL')}/oauth?access=${access}&refresh=${refresh}`,
      );
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  }
}
