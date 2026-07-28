import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CarCondition } from '@prisma/client';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminCarsService } from './admin-cars.service';
import { CATALOG_READ_ROLES, CATALOG_WRITE_ROLES } from './admin-permissions';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';

@ApiTags('admin')
@Controller('admin/cars')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
export class AdminCarsController {
  constructor(private readonly carsService: AdminCarsService) {}

  @Get()
  @Roles(...CATALOG_READ_ROLES)
  list(@Query('condition') condition?: CarCondition) {
    return this.carsService.list({ condition });
  }

  @Get(':id')
  @Roles(...CATALOG_READ_ROLES)
  getOne(@Param('id') id: string) {
    return this.carsService.getOne(id);
  }

  @Post()
  @Roles(...CATALOG_WRITE_ROLES)
  create(@Body() body: CreateCarDto) {
    return this.carsService.create(body);
  }

  @Patch(':id')
  @Roles(...CATALOG_WRITE_ROLES)
  update(@Param('id') id: string, @Body() body: UpdateCarDto) {
    return this.carsService.update(id, body);
  }

  @Delete(':id')
  @Roles(...CATALOG_WRITE_ROLES)
  remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }
}
