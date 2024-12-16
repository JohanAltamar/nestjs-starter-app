import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Decorators
import { Auth, GetUser, PermissionProtected, RawHeaders } from './decorators';

// DTOs
import { CreateUserDto, LoginUserDto } from './dto';

// Entities
import { User } from './entities/user.entity';

// Guards
import { UserPermissionGuard } from './guards/user-permission.guard';

// Providers
import { AuthService } from './auth.service';

// Types
import { ValidPermissions } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
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
}
