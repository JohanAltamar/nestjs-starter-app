import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RolesService } from 'src/roles/roles.service';
import { hashSync } from 'bcrypt';
import { getUserRolesAndPermissions } from './helpers/get-user-roles-and-permissions';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto, fromProvider: boolean) {
    const { password, roles = ['USER'], ...userDetails } = createUserDto;

    const rolesToAdd = await Promise.all(
      roles.map((role) => this.roleService.findOne(role)),
    );

    if (!fromProvider && !password)
      throw new BadRequestException('Password is required');

    try {
      const newUser = this.userRepository.create({
        ...userDetails,
        password: !password ? null : hashSync(password, 10),
        roles: rolesToAdd,
      });

      if (fromProvider) delete newUser.password;

      await this.userRepository.save(newUser);

      delete newUser.password;
      delete newUser.isActive;

      const { roles, permissions } = getUserRolesAndPermissions(newUser);

      return {
        ...newUser,
        roles,
        permissions,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        email: true,
        id: true,
        fullName: true,
        isActive: true,
        refreshToken: true,
      },
    });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return { ...user, ...getUserRolesAndPermissions(user) };
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { password: true, email: true, id: true, fullName: true },
    });

    if (!user)
      throw new NotFoundException(`user with email ${email} not found`);

    return { ...user, ...getUserRolesAndPermissions(user) };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { roles, ...userDetails } = updateUserDto;

    const userToUpdate = await this.userRepository.preload({
      id,
      ...userDetails,
    });

    if (!userToUpdate)
      throw new NotFoundException(`User with id ${id} not found`);

    if (roles?.length > 0) {
      const newRoles = await Promise.all(
        roles.map((roleName) => this.roleService.findOne(roleName)),
      );
      userToUpdate.roles = newRoles;
    }

    await this.userRepository.save(userToUpdate);

    return await this.findOne(userToUpdate.id);
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  private handleDBExceptions = (error) => {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  };
}
