import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('content')
@Controller('blog')
export class BlogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: 'desc' }],
    });
  }

  @Get(':slug')
  async getOne(@Param('slug') slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.isPublished) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }
}
