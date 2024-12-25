import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { PermissionsController } from './permissions.controller';

// DTOs
import { Permission } from './entities/permission.entity';

//Modules
import { AuthModule } from 'src/auth/auth.module';

// Providers
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  imports: [TypeOrmModule.forFeature([Permission]), AuthModule],
  exports: [PermissionsService, TypeOrmModule],
})
export class PermissionsModule {}
