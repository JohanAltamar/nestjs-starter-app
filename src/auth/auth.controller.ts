import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Decorators
import { Auth, GetUser, PermissionProtected, RawHeaders } from './decorators';

// Entities
import { User } from 'src/common/entities/user.entity';

// Guards
import { UserPermissionGuard } from './guards';

// Types
import { ValidPermissions } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor() {}

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
  @PermissionProtected(ValidPermissions.view_permissions)
  @UseGuards(AuthGuard(), UserPermissionGuard)
  testPrivate2Route(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hello from private 2',
      user,
    };
  }

  @Get('private3')
  @Auth('permission', ValidPermissions.view_permissions)
  testPrivate3Route(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hello from private 3',
      user,
    };
  }
}
