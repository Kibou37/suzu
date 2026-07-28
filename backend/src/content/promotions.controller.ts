import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('content')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    const now = new Date();

    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ endsAt: null }, { endsAt: { gte: now } }],
          },
        ],
      },
      orderBy: [{ startsAt: 'desc' }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        image: true,
        linkUrl: true,
        startsAt: true,
        endsAt: true,
      } satisfies Prisma.PromotionSelect,
    });
  }
}
