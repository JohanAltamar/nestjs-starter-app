import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { UsersController } from './users.controller';

// Modules
import { RolesModule } from 'src/roles/roles.module';

// Providers
import { UsersService } from './users.service';
import { AccessTokenStrategy } from 'src/auth/strategies';
import { UserPermissionGuard, UserRoleGuard } from 'src/auth/guards';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AccessTokenStrategy,
    UserPermissionGuard,
    UserRoleGuard,
  ],
  imports: [ConfigModule, CommonModule, RolesModule, AuthModule],
  exports: [UsersService],
})
export class UsersModule {}
