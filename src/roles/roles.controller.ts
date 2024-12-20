import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

// Decorators
import { Auth } from 'src/auth/decorators';

// DTOs
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

// Providers
import { RolesService } from './roles.service';

// Types
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Auth('permission', ValidPermissions.create_roles)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Auth('permission', ValidPermissions.view_roles)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.rolesService.findAll(paginationDto);
  }

  @Get(':term')
  @Auth('permission', ValidPermissions.view_roles)
  findOne(@Param('term') term: string) {
    return this.rolesService.findOne(term);
  }

  @Patch(':id')
  @Auth('permission', ValidPermissions.update_roles)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Auth('permission', ValidPermissions.delete_roles)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
