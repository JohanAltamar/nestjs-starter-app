import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { RolesController } from './roles.controller';

// Entities
import { Role } from './entities/role.entity';

// Modules
import { AuthModule } from 'src/auth/auth.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

// Providers
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule, AuthModule],
  exports: [RolesService],
})
export class RolesModule {}
