import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// DTOs
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

  async create(createRoleDto: CreateRoleDto) {
    try {
      const newRole = this.roleRepository.create(createRoleDto);

      await this.roleRepository.save(newRole);

      return newRole;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }

  private handleDBExceptions = (error) => {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  };
}
