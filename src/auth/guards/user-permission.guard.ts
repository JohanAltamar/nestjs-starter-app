import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

// Entities
import { UserResponse } from '../../users/interfaces/user-response.interface';

import { META_PERMISSIONS } from '../decorators/permission-protected.decorator';

@Injectable()
export class UserPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions =
      this.reflector.get<string[]>(META_PERMISSIONS, context.getHandler()) ??
      [];

    if (!requiredPermissions.length) return true;

    const request = context.switchToHttp().getRequest();
    const user: UserResponse = request.user;

    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    for (const permission of user.permissions) {
      if (requiredPermissions.includes(permission)) return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid permission: ${requiredPermissions}`,
    );
  }
}
