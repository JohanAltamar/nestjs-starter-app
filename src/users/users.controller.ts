import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';

// Decorators
import { Auth, GetUser } from 'src/auth/decorators';

// DTOs
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto';

// Entities
import { User } from 'src/common/entities/user.entity';

// Providers
import { UsersService } from './users.service';

// Types
import { ValidPermissions } from 'src/auth/interfaces';
import { GoogleOauthGuard } from 'src/auth/guards';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto, false);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.loginUser(loginUserDto);
  }

  @Get('logout')
  @Auth()
  logout(@GetUser('id', ParseUUIDPipe) id: string) {
    return this.usersService.logout(id);
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      const { accessToken, refreshToken } = await this.usersService.oAuthLogin(
        req.user,
      );
      res.redirect(
        `${this.configService.get('FRONTEND_URL')}/oauth?access=${accessToken}&refresh=${refreshToken}`,
      );
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  }

  @Post()
  @Auth('permission', ValidPermissions.create_users)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, false);
  }

  @Get()
  @Auth('permission', ValidPermissions.view_users)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Auth('permission', ValidPermissions.view_users)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    // TODO: check if the user has the permission or it is the same user
    console.log(user);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    // TODO: check if the user has the permission or it is the same user
    console.log(user);
    return this.usersService.remove(id);
  }
}
