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

import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles =
      this.reflector.get<string[]>(META_ROLES, context.getHandler()) ?? [];

    if (!requiredRoles.length) return true;

    const request = context.switchToHttp().getRequest();
    const user: UserResponse = request.user;

    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    for (const role of user.roles) {
      if (requiredRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: ${requiredRoles}`,
    );
  }
}
