import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Decorators
import { PermissionProtected, RoleProtected } from '../decorators';

// Guards
import { UserPermissionGuard, UserRoleGuard } from '../guards';

// Types
import { ValidPermissions, ValidRoles } from '../interfaces';

export const Auth = (
  protectedBy?: 'role' | 'permission',
  ...features: ValidRoles[] | ValidPermissions[]
) => {
  if (protectedBy === 'permission') {
    return applyDecorators(
      PermissionProtected(...(features as ValidPermissions[])),
      UseGuards(AuthGuard(), UserPermissionGuard, UserRoleGuard),
    );
  }

  if (protectedBy === 'role') {
    return applyDecorators(
      RoleProtected(...(features as ValidRoles[])),
      UseGuards(AuthGuard(), UserPermissionGuard, UserRoleGuard),
    );
  }

  return applyDecorators(UseGuards(AuthGuard()));
};
