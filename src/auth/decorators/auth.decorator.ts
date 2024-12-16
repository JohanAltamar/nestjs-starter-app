import {
  applyDecorators,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ValidPermissions, ValidRoles } from '../interfaces';
import { AuthGuard } from '@nestjs/passport';
import { PermissionProtected } from './permission-protected.decorator';
import { UserPermissionGuard } from '../guards/user-permission.guard';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';

interface AuthParams {
  roles?: ValidRoles[];
  permissions?: ValidPermissions[];
}
export const Auth = (authParams: AuthParams = {}) => {
  const { roles = [], permissions = [] } = authParams;

  if (roles.length > 0 && permissions.length > 0)
    throw new BadRequestException(
      'Route should be protected by role or permission but both at the same time',
    );

  return applyDecorators(
    PermissionProtected(...permissions),
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserPermissionGuard, UserRoleGuard),
  );
};
