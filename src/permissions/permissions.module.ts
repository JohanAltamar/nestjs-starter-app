import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { PermissionsController } from './permissions.controller';

// DTOs
import { Permission } from './entities/permission.entity';

// Providers
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  imports: [TypeOrmModule.forFeature([Permission])],
})
export class PermissionsModule {}
