import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreatePromotionDto,
  UpdatePromotionDto,
} from './dto/promotion.dto';

@Injectable()
export class AdminPromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.promotion.findMany({
      orderBy: [{ startsAt: 'desc' }, { title: 'asc' }],
    });
  }

  async getOne(id: string) {
    const item = await this.prisma.promotion.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Promotion not found');
    }
    return item;
  }

  create(input: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: this.toCreateData(input),
    });
  }

  async update(id: string, input: UpdatePromotionDto) {
    await this.ensureExists(id);
    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.subtitle !== undefined
          ? { subtitle: input.subtitle.trim() || null }
          : {}),
        ...(input.description !== undefined
          ? { description: input.description.trim() || null }
          : {}),
        ...(input.image !== undefined
          ? { image: input.image.trim() || null }
          : {}),
        ...(input.linkUrl !== undefined
          ? { linkUrl: input.linkUrl.trim() || null }
          : {}),
        ...(input.startsAt !== undefined
          ? { startsAt: input.startsAt ? new Date(input.startsAt) : null }
          : {}),
        ...(input.endsAt !== undefined
          ? { endsAt: input.endsAt ? new Date(input.endsAt) : null }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.promotion.delete({ where: { id } });
    return { deleted: true };
  }

  private toCreateData(input: CreatePromotionDto) {
    return {
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      description: input.description?.trim() || null,
      image: input.image?.trim() || null,
      linkUrl: input.linkUrl?.trim() || null,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      isActive: input.isActive ?? true,
    };
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.promotion.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Promotion not found');
    }
  }
}
