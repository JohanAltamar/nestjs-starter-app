import { Controller, Get, Post, Body } from '@nestjs/common';

// DTOs
import { CreateUserDto, LoginUserDto } from './dto';

// Providers
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }
}
