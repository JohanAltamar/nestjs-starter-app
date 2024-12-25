import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

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

  //TODO: User must be SYS_ADMIN to perform the CRUD operations

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
    const { limit = 20, offset = 0 } = paginationDto;

    return await this.permissionRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'asc' },
    });
  }

  async findOne(term: string) {
    let permission: Permission;

    if (isUUID(term)) {
      permission = await this.permissionRepository.findOne({
        where: { id: term },
        select: { name: true, id: true },
      });
    } else {
      permission = await this.permissionRepository.findOne({
        where: { name: term },
        select: { name: true, id: true },
      });
    }

    if (!permission)
      throw new NotFoundException(`Permission with "${term}" not found`);

    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permissionToUpdate = await this.permissionRepository.preload({
      id,
      ...updatePermissionDto,
    });

    if (!permissionToUpdate)
      throw new NotFoundException(`Permission with id ${id} not found`);

    await this.permissionRepository.save(permissionToUpdate);

    return await this.findOne(id);
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
