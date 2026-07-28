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
import { CONTENT_READ_ROLES, CONTENT_WRITE_ROLES } from './admin-permissions';
import { AdminPromotionsService } from './admin-promotions.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';

@ApiTags('admin')
@Controller('admin/promotions')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
export class AdminPromotionsController {
  constructor(private readonly promotionsService: AdminPromotionsService) {}

  @Get()
  @Roles(...CONTENT_READ_ROLES)
  list() {
    return this.promotionsService.list();
  }

  @Get(':id')
  @Roles(...CONTENT_READ_ROLES)
  getOne(@Param('id') id: string) {
    return this.promotionsService.getOne(id);
  }

  @Post()
  @Roles(...CONTENT_WRITE_ROLES)
  create(@Body() body: CreatePromotionDto) {
    return this.promotionsService.create(body);
  }

  @Patch(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  update(@Param('id') id: string, @Body() body: UpdatePromotionDto) {
    return this.promotionsService.update(id, body);
  }

  @Delete(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
