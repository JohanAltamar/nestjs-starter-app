import { Permission } from 'src/permissions/entities/permission.entity';
import { User } from 'src/common/entities/user.entity';

export const getUserRolesAndPermissions = (user: User) => {
  const permissions: Permission[] = [];

  const userRoles = user.roles?.map((role) => {
    if (role.permissions) {
      permissions.push(...role.permissions);
    }

    return role.name;
  });

  const userPermissions = permissions.map((permission) => permission.name);

  return { roles: userRoles, permissions: userPermissions };
};
