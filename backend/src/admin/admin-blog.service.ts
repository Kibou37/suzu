import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { uniqueBlogSlug } from './admin.util';
import type { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

@Injectable()
export class AdminBlogService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.blogPost.findMany({
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async getOne(id: string) {
    const item = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Blog post not found');
    }
    return item;
  }

  async create(input: CreateBlogPostDto) {
    const slug = await uniqueBlogSlug(this.prisma, input.title, input.slug);
    const isPublished = input.isPublished ?? false;

    return this.prisma.blogPost.create({
      data: {
        title: input.title.trim(),
        slug,
        excerpt: input.excerpt?.trim() || null,
        content: input.content.trim(),
        coverImage: input.coverImage?.trim() || null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });
  }

  async update(id: string, input: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }

    const nextTitle = input.title?.trim() ?? existing.title;
    const slug =
      input.slug !== undefined || input.title !== undefined
        ? await uniqueBlogSlug(this.prisma, nextTitle, input.slug, id)
        : existing.slug;

    let publishedAt = existing.publishedAt;
    if (input.isPublished === true && !existing.isPublished) {
      publishedAt = new Date();
    }
    if (input.isPublished === false) {
      publishedAt = null;
    }

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        slug,
        ...(input.excerpt !== undefined
          ? { excerpt: input.excerpt.trim() || null }
          : {}),
        ...(input.content !== undefined
          ? { content: input.content.trim() }
          : {}),
        ...(input.coverImage !== undefined
          ? { coverImage: input.coverImage.trim() || null }
          : {}),
        ...(input.isPublished !== undefined
          ? { isPublished: input.isPublished, publishedAt }
          : {}),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }
    await this.prisma.blogPost.delete({ where: { id } });
    return { deleted: true };
  }
}
