import { Injectable, NotFoundException } from '@nestjs/common';
import { CarCondition, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type FindAllParams = {
  condition?: CarCondition;
  isOffer?: boolean;
};

@Injectable()
export class CarsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: FindAllParams) {
    const where: Prisma.CarWhereInput = {};

    if (params.condition) {
      where.condition = params.condition;
    }

    if (params.isOffer !== undefined) {
      where.isOffer = params.isOffer;
    }

    return this.prisma.car.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { price: 'asc' }],
      include: {
        variants: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const car = await this.prisma.car.findUnique({
      where: { slug },
      include: {
        variants: {
          include: {
            variantOptions: {
              include: { option: true },
            },
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException(`Car "${slug}" not found`);
    }

    return car;
  }
}
