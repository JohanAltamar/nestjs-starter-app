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
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

// Entities
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  private readonly logger = new Logger('RoleService');

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  //TODO: User must be SYS_ADMIN to perform the CRUD operations

  async create(createRoleDto: CreateRoleDto) {
    try {
      const newRole = this.roleRepository.create(createRoleDto);

      await this.roleRepository.save(newRole);

      return newRole;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const roles = await this.roleRepository.find({
      skip: offset,
      take: limit,
      order: { name: 'asc' },
    });

    return roles;
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role) throw new NotFoundException(`Role with "${id}" not found`);

    return role;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  async remove(id: string) {
    const role = await this.findOne(id);

    await this.roleRepository.remove(role);
  }

  private handleDBExceptions = (error) => {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  };
}