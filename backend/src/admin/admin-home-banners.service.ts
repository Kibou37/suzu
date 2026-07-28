import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateHomeBannerDto,
  UpdateHomeBannerDto,
} from './dto/home-banner.dto';

@Injectable()
export class AdminHomeBannersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.homeBanner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getOne(id: string) {
    const item = await this.prisma.homeBanner.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Banner not found');
    return item;
  }

  async create(input: CreateHomeBannerDto) {
    const sortOrder =
      input.sortOrder ??
      ((await this.prisma.homeBanner.aggregate({ _max: { sortOrder: true } }))
        ._max.sortOrder ?? -1) + 1;

    return this.prisma.homeBanner.create({
      data: {
        title: input.title.trim(),
        subtitle: input.subtitle?.trim() || null,
        description: input.description?.trim() || null,
        linkUrl: input.linkUrl?.trim() || null,
        linkLabel: input.linkLabel?.trim() || null,
        imageDesktop: input.imageDesktop.trim(),
        imageMobile: input.imageMobile?.trim() || null,
        sortOrder,
        isActive: input.isActive ?? true,
      },
    });
  }

  async update(id: string, input: UpdateHomeBannerDto) {
    await this.ensureExists(id);
    return this.prisma.homeBanner.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.subtitle !== undefined
          ? { subtitle: input.subtitle.trim() || null }
          : {}),
        ...(input.description !== undefined
          ? { description: input.description.trim() || null }
          : {}),
        ...(input.linkUrl !== undefined
          ? { linkUrl: input.linkUrl.trim() || null }
          : {}),
        ...(input.linkLabel !== undefined
          ? { linkLabel: input.linkLabel.trim() || null }
          : {}),
        ...(input.imageDesktop !== undefined
          ? { imageDesktop: input.imageDesktop.trim() }
          : {}),
        ...(input.imageMobile !== undefined
          ? { imageMobile: input.imageMobile.trim() || null }
          : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.homeBanner.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.homeBanner.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Banner not found');
  }
}
