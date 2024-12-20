import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { UsersController } from './users.controller';

// Entities
import { User } from './entities/user.entity';

// Modules
import { RolesModule } from 'src/roles/roles.module';

// Providers
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [ConfigModule, TypeOrmModule.forFeature([User]), RolesModule],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
