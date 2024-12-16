import { SetMetadata } from '@nestjs/common';
import type { ValidPermissions } from 'src/auth/interfaces';

export const META_PERMISSIONS = 'permissions';

export const PermissionProtected = (...args: ValidPermissions[]) => {
  return SetMetadata(META_PERMISSIONS, args);
};
