import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(4)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
