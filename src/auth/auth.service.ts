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

  async createUser(createUserDto: CreateUserDto) {
    const { password, roles = ['USER'], ...userDetails } = createUserDto;

    const rolesToAdd = await Promise.all(
      roles.map((role) => this.roleService.findOne(role)),
    );

    try {
      const newUser = this.userRepository.create({
        ...userDetails,
        password: hashSync(password, 10),
        roles: rolesToAdd,
      });

      await this.userRepository.save(newUser);

      delete newUser.password;

      return {
        ...newUser,
        ...getUserRolesAndPermissions(newUser),
        token: this.generateJwt({ id: newUser.id }),
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

    return {
      ...user,
      ...getUserRolesAndPermissions(user),
      token: this.generateJwt({ id: user.id }),
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
