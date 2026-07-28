import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminHomeBannersService } from './admin-home-banners.service';
import { CONTENT_READ_ROLES, CONTENT_WRITE_ROLES } from './admin-permissions';
import {
  CreateHomeBannerDto,
  UpdateHomeBannerDto,
} from './dto/home-banner.dto';

@ApiTags('admin')
@Controller('admin/home-banners')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
export class AdminHomeBannersController {
  constructor(private readonly bannersService: AdminHomeBannersService) {}

  @Get()
  @Roles(...CONTENT_READ_ROLES)
  list() {
    return this.bannersService.list();
  }

  @Get(':id')
  @Roles(...CONTENT_READ_ROLES)
  getOne(@Param('id') id: string) {
    return this.bannersService.getOne(id);
  }

  @Post()
  @Roles(...CONTENT_WRITE_ROLES)
  create(@Body() body: CreateHomeBannerDto) {
    return this.bannersService.create(body);
  }

  @Patch(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  update(@Param('id') id: string, @Body() body: UpdateHomeBannerDto) {
    return this.bannersService.update(id, body);
  }

  @Delete(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
