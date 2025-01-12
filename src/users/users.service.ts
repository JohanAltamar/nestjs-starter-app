import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { RolesService } from 'src/roles/roles.service';
import { compareSync, hashSync } from 'bcrypt';
import { getUserRolesAndPermissions } from './helpers/get-user-roles-and-permissions';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from 'src/auth/dto';
import { validate as isUUID } from 'uuid';
import { PaginatedSearchByNameDto } from './dto/paginated-search-by-name.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// TODO: order imports
@Injectable()
export class UsersService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
    private readonly authService: AuthService,
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

  async findAll(paginationDto: PaginatedSearchByNameDto) {
    const { limit = 20, offset = 0, name } = paginationDto;

    return await this.userRepository.find({
      where: { fullName: Like(`%${name.toLowerCase()}%`) },
      skip: offset,
      take: limit,
      order: { fullName: 'asc' },
    });
  }

  async findOne(term: string) {
    let user: User;
    if (isUUID(term)) {
      user = await this.userRepository.findOne({
        where: { id: term },
        select: {
          email: true,
          id: true,
          fullName: true,
          isActive: true,
          refreshToken: true,
        },
      });
    } else {
      user = await this.userRepository.findOne({
        where: { fullName: term },
        select: {
          email: true,
          id: true,
          fullName: true,
          isActive: true,
          refreshToken: true,
        },
      });
    }

    if (!user) throw new NotFoundException(`User with id ${term} not found`);

    return { ...user, ...getUserRolesAndPermissions(user) };
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        password: true,
        email: true,
        id: true,
        fullName: true,
        isActive: true,
      },
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

    try {
      await this.userRepository.save(userToUpdate);

      return await this.findOne(userToUpdate.id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async activate(id: string) {
    return await this.update(id, { isActive: true });
  }

  async deactivate(id: string) {
    return await this.update(id, { isActive: false });
  }

  async createUser(createUserDto: CreateUserDto, fromProvider: boolean) {
    const newUser = await this.create(createUserDto, fromProvider);
    const tokens = this.authService.generateTokens(newUser);

    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return tokens;
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.findOneByEmail(email);

    if (!user) throw new UnauthorizedException('Credentials not valid (email)');

    if (!user.isActive)
      throw new UnauthorizedException(
        'User is inactive, contact the app admin',
      );

    if (!compareSync(password, user.password))
      throw new UnauthorizedException('Credentials not valid (password)');

    delete user.password;

    const tokens = this.authService.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async oAuthLogin(user) {
    if (!user) {
      throw new InternalServerErrorException('Google user not found!!!');
    }

    if (!user.id) {
      const newUser = await this.createUser(user, true);
      user = { ...user, ...newUser };
    }

    if (!user.isActive)
      throw new UnauthorizedException(
        'User is inactive, contact the app admin',
      );

    delete user.isActive;
    delete user.token;

    const tokens = this.authService.generateTokens({ id: user.id, ...user });

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    return await this.update(userId, { refreshToken: null });
  }

  async recoverPassword(recoverPasswordDto: RecoverPasswordDto) {
    const { email } = recoverPasswordDto;

    const user = await this.findOneByEmail(email);

    if (!user.isActive)
      throw new UnauthorizedException(
        'User is inactive, contact the app admin',
      );

    delete user.isActive;

    return this.authService.generatePasswordRecoveryToken(user.email);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { password, token } = resetPasswordDto;

    const { email, ok } = this.authService.decodePasswordRecoveryToken(token);

    if (!ok) {
      throw new UnauthorizedException('Token expired, get a new one');
    }

    const user = await this.findOneByEmail(email);

    if (!user.isActive)
      throw new UnauthorizedException(
        'User is inactive, contact the app admin',
      );

    await this.update(user.id, {
      ...user,
      password: hashSync(password, 10),
      refreshToken: null,
    });

    return { message: 'Password reset successfully' };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = hashSync(refreshToken, 10);

    await this.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.findOne(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = compareSync(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = this.authService.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private handleDBExceptions = (error) => {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  };
}
