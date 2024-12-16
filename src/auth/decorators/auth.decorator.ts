import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidPermissions, ValidRoles } from '../interfaces';
import { AuthGuard } from '@nestjs/passport';
import { PermissionProtected } from './permission-protected.decorator';
import { UserPermissionGuard } from '../guards/user-permission.guard';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';

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
