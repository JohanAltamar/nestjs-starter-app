import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, hashSync } from 'bcrypt';
import { Repository } from 'typeorm';

// DTOs
import { CreateUserDto, LoginUserDto } from './dto';

// Entities
import { User } from './entities/user.entity';

// Helpers
import { getUserRolesAndPermissions } from './helpers/get-user-roles-and-permissions';

// Providers
import { RolesService } from 'src/roles/roles.service';

// Types
import { type JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto, fromProvider: boolean) {
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
        access: this.generateJwt({
          ...newUser,
          roles,
          permissions,
        }),
        refresh: this.generateJwt({
          ...newUser,
          roles,
          permissions,
        }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { password: true, email: true, id: true },
    });

    if (!user) throw new UnauthorizedException('Credentials not valid (email)');

    if (!compareSync(password, user.password))
      throw new UnauthorizedException('Credentials not valid (password)');

    delete user.password;

    const { roles, permissions } = getUserRolesAndPermissions(user);

    return {
      ...user,
      ...getUserRolesAndPermissions(user),
      access: this.generateJwt({ ...user, roles, permissions }),
      refresh: this.generateJwt({ ...user, roles, permissions }),
    };
  }

  async oAuthLogin(user) {
    if (!user) {
      throw new InternalServerErrorException('Google user not found!!!');
    }

    if (!user.id) {
      const newUser = await this.createUser(user, true);
      user = { ...user, ...newUser };
    }

    delete user.isActive;
    delete user.token;

    return {
      ...user,
      access: this.generateJwt({ id: user.id, ...user }),
      refresh: this.generateJwt({ id: user.id, ...user }),
    };
  }

  private generateJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDBExceptions = (error) => {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  };
}
