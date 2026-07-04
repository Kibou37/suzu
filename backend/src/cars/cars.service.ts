import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BodyType,
  CarCondition,
  FuelType,
  Prisma,
  Transmission,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type FindAllParams = {
  condition?: CarCondition;
  isOffer?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  bodyType?: BodyType;
  fuelType?: FuelType;
  transmission?: Transmission;
  trim?: string;
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

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {
        ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
        ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
      };
    }

    if (params.minYear !== undefined || params.maxYear !== undefined) {
      where.year = {
        ...(params.minYear !== undefined ? { gte: params.minYear } : {}),
        ...(params.maxYear !== undefined ? { lte: params.maxYear } : {}),
      };
    }

    if (params.maxMileage !== undefined) {
      where.mileage = { lte: params.maxMileage };
    }

    if (params.bodyType) {
      where.bodyType = params.bodyType;
    }

    if (params.fuelType) {
      where.fuelType = params.fuelType;
    }

    if (params.transmission) {
      where.transmission = params.transmission;
    }

    if (params.trim) {
      where.trim = params.trim;
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
