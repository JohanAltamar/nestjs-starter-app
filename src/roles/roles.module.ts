import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { RolesController } from './roles.controller';

// Entities
import { Role } from './entities/role.entity';

// Providers
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [TypeOrmModule.forFeature([Role])],
})
export class RolesModule {}
