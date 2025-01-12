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
  Query,
} from '@nestjs/common';

// Decorators
import { Auth, GetUser } from 'src/auth/decorators';

// DTOs
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto';
import { PaginatedSearchByNameDto } from './dto/paginated-search-by-name.dto';

// Providers
import { UsersService } from './users.service';

// Types
import { ValidPermissions } from 'src/auth/interfaces';
import { GoogleOauthGuard } from 'src/auth/guards';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  @Post('recover-password')
  recoverPassword(@Body() recoverPasswordDto: RecoverPasswordDto) {
    return this.usersService.recoverPassword(recoverPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @Get('logout')
  @Auth()
  logout(@GetUser('id', ParseUUIDPipe) id: string) {
    return this.usersService.logout(id);
  }

  @Get('refresh')
  @Auth('refresh-token')
  refreshTokens(
    @GetUser('id', ParseUUIDPipe) id: string,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.usersService.refreshTokens(id, refreshToken);
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
  findAll(@Query() paginationDto: PaginatedSearchByNameDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':term')
  @Auth('permission', ValidPermissions.view_users)
  findOne(@Param('term') term: string) {
    return this.usersService.findOne(term);
  }

  @Patch(':id')
  @Auth('permission', ValidPermissions.edit_users)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // To toggle user state use the 2 endpoints
  @Post(':id')
  @Auth('permission', ValidPermissions.edit_users)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.activate(id);
  }
  @Delete(':id')
  @Auth('permission', ValidPermissions.edit_users)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deactivate(id);
  }
}
