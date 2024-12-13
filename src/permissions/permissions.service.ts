import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// DTOs
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

// Entities
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger('PermissionService');

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const newPermission =
        this.permissionRepository.create(createPermissionDto);

      await this.permissionRepository.save(newPermission);

      return newPermission;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.permissionRepository.find({ skip: offset, take: limit });
  }

  async findOne(id: string) {
    const permission = await this.permissionRepository.findOneBy({ id });

    if (!permission)
      throw new NotFoundException(`Permission with "${id}" not found`);

    return permission;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  async remove(id: string) {
    const permission = await this.findOne(id);

    await this.permissionRepository.remove(permission);
  }

  private handleDBExceptions = (error) => {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  };
}
