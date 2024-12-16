export interface JwtPayload {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}
