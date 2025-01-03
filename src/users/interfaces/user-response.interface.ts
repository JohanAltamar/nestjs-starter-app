import { User } from '../../common/entities/user.entity';

export interface UserResponse
  extends Omit<
    Partial<User>,
    'roles' | 'checkFIeldsBeforeInsert' | 'checkFieldsBeforeUpdate'
  > {
  roles: string[];
  permissions: string[];
  refreshToken?: string;
}
