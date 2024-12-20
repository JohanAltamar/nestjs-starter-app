import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcrypt';

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
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto, fromProvider: boolean) {
    const newUser = await this.usersService.create(createUserDto, fromProvider);

    const tokens = this.generateTokens(newUser);

    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return tokens;
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new UnauthorizedException('Credentials not valid (email)');

    if (!compareSync(password, user.password))
      throw new UnauthorizedException('Credentials not valid (password)');

    delete user.password;

    const tokens = this.generateTokens(user);

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

    delete user.isActive;
    delete user.token;

    const tokens = this.generateTokens({ id: user.id, ...user });

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    return await this.usersService.update(userId, { refreshToken: null });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = hashSync(refreshToken, 10);

    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
