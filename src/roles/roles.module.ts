import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { RolesController } from './roles.controller';

// Entities
import { Role } from './entities/role.entity';

// Modules
import { PermissionsModule } from 'src/permissions/permissions.module';

// Providers
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule],
  exports: [RolesService],
})
export class RolesModule {}
