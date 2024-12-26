import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Decorators
import { PermissionProtected, RoleProtected } from '../decorators';

// Guards
import { UserPermissionGuard, UserRoleGuard } from '../guards';

// Types
import { ValidPermissions, ValidRoles } from '../interfaces';

export const Auth = (
  protectedBy?: 'role' | 'permission' | 'refresh-token',
  ...features: ValidRoles[] | ValidPermissions[]
) => {
  if (protectedBy === 'permission') {
    return applyDecorators(
      PermissionProtected(...(features as ValidPermissions[])),
      UseGuards(AuthGuard(), UserPermissionGuard, UserRoleGuard),
    );
  } else if (protectedBy === 'role') {
    return applyDecorators(
      RoleProtected(...(features as ValidRoles[])),
      UseGuards(AuthGuard(), UserPermissionGuard, UserRoleGuard),
    );
  } else if (protectedBy === 'refresh-token') {
    return applyDecorators(UseGuards(AuthGuard('jwt-refresh')));
  }

  return applyDecorators(UseGuards(AuthGuard()));
};
