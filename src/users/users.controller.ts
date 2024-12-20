import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';

// Decorators
import { Auth, GetUser } from 'src/auth/decorators';

// DTOs
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Entities
import { User } from './entities/user.entity';

// Providers
import { UsersService } from './users.service';

// Types
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
