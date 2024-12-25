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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

// Providers
import { PermissionsService } from './permissions.service';

// Types
import { ValidPermissions } from 'src/auth/interfaces';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Auth('permission', ValidPermissions.create_permissions)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Auth('permission', ValidPermissions.view_permissions)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionsService.findAll(paginationDto);
  }

  @Get(':term')
  @Auth('permission', ValidPermissions.view_permissions)
  findOne(@Param('term') term: string) {
    return this.permissionsService.findOne(term);
  }

  @Patch(':id')
  @Auth('permission', ValidPermissions.update_permissions)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Auth('permission', ValidPermissions.delete_permissions)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.remove(id);
  }
}
