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
import { AdminBlogService } from './admin-blog.service';
import { CONTENT_READ_ROLES, CONTENT_WRITE_ROLES } from './admin-permissions';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

@ApiTags('admin')
@Controller('admin/blog-posts')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
export class AdminBlogController {
  constructor(private readonly blogService: AdminBlogService) {}

  @Get()
  @Roles(...CONTENT_READ_ROLES)
  list() {
    return this.blogService.list();
  }

  @Get(':id')
  @Roles(...CONTENT_READ_ROLES)
  getOne(@Param('id') id: string) {
    return this.blogService.getOne(id);
  }

  @Post()
  @Roles(...CONTENT_WRITE_ROLES)
  create(@Body() body: CreateBlogPostDto) {
    return this.blogService.create(body);
  }

  @Patch(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  update(@Param('id') id: string, @Body() body: UpdateBlogPostDto) {
    return this.blogService.update(id, body);
  }

  @Delete(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
