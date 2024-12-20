import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';

// DTOs
import { CreateUserDto } from 'src/users/dto';
import { LoginUserDto } from './dto';

// Providers
import { UsersService } from 'src/users/users.service';

// Types
import { type JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto, fromProvider: boolean) {
    const newUser = await this.usersService.create(createUserDto, fromProvider);

    return {
      access: this.generateJwt(newUser),
      refresh: this.generateJwt(newUser),
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new UnauthorizedException('Credentials not valid (email)');

    if (!compareSync(password, user.password))
      throw new UnauthorizedException('Credentials not valid (password)');

    delete user.password;

    return {
      access: this.generateJwt(user),
      refresh: this.generateJwt(user),
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
}
