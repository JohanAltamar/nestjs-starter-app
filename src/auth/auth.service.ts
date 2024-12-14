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

// Types
import { type JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, ...userDetails } = createUserDto;

      const newUser = this.userRepository.create({
        ...userDetails,
        password: hashSync(password, 10),
      });

      await this.userRepository.save(newUser);

      delete newUser.password;

      return { ...newUser, token: this.generateJwt({ email: newUser.email }) };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { password: true, email: true },
    });

    if (!user) throw new UnauthorizedException('Credentials not valid (email)');

    if (!compareSync(password, user.password))
      throw new UnauthorizedException('Credentials not valid (password)');

    return { ...user, token: this.generateJwt({ email: user.email }) };
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
