import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { SETTINGS_ROLES } from './admin-permissions';
import { AdminUsersService } from './admin-users.service';

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
@Roles(...SETTINGS_ROLES)
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  list() {
    return this.usersService.listStaff();
  }
}
