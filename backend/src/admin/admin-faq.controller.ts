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
import { AdminFaqService } from './admin-faq.service';
import { CONTENT_READ_ROLES, CONTENT_WRITE_ROLES } from './admin-permissions';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@ApiTags('admin')
@Controller('admin/faq')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
export class AdminFaqController {
  constructor(private readonly faqService: AdminFaqService) {}

  @Get()
  @Roles(...CONTENT_READ_ROLES)
  list() {
    return this.faqService.list();
  }

  @Get(':id')
  @Roles(...CONTENT_READ_ROLES)
  getOne(@Param('id') id: string) {
    return this.faqService.getOne(id);
  }

  @Post()
  @Roles(...CONTENT_WRITE_ROLES)
  create(@Body() body: CreateFaqDto) {
    return this.faqService.create(body);
  }

  @Patch(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  update(@Param('id') id: string, @Body() body: UpdateFaqDto) {
    return this.faqService.update(id, body);
  }

  @Delete(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}
