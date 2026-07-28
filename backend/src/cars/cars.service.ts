import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BodyType,
  CarCondition,
  FuelType,
  Prisma,
  Transmission,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  buildCarsCacheKey,
  computeCarFacets,
  type CarFacets,
} from './cars-facets.util';

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

const LIST_CACHE_TTL = 60;
const FACETS_CACHE_TTL = 300;

@Injectable()
export class CarsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private buildWhere(params: FindAllParams): Prisma.CarWhereInput {
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

    return where;
  }

  async findAll(params: FindAllParams) {
    const cacheKey = buildCarsCacheKey('cars:list', params);
    const cached =
      await this.redis.get<Awaited<ReturnType<CarsService['queryAll']>>>(
        cacheKey,
      );
    if (cached) return cached;

    const result = await this.queryAll(params);
    await this.redis.set(cacheKey, result, LIST_CACHE_TTL);
    return result;
  }

  private queryAll(params: FindAllParams) {
    return this.prisma.car.findMany({
      where: this.buildWhere(params),
      orderBy: [{ isFeatured: 'desc' }, { price: 'asc' }],
      include: { variants: true },
    });
  }

  async getFacets(
    params: Pick<FindAllParams, 'condition' | 'isOffer'>,
  ): Promise<CarFacets> {
    const cacheKey = buildCarsCacheKey('cars:facets', params);
    const cached = await this.redis.get<CarFacets>(cacheKey);
    if (cached) return cached;

    const cars = await this.prisma.car.findMany({
      where: this.buildWhere(params),
      select: {
        bodyType: true,
        fuelType: true,
        transmission: true,
        trim: true,
        price: true,
        year: true,
        mileage: true,
      },
    });

    const facets = computeCarFacets(cars);
    await this.redis.set(cacheKey, facets, FACETS_CACHE_TTL);
    return facets;
  }

  async findBySlug(slug: string) {
    const cacheKey = `cars:slug:${slug}`;
    const cached =
      await this.redis.get<Awaited<ReturnType<CarsService['queryBySlug']>>>(
        cacheKey,
      );
    if (cached) return cached;

    const car = await this.queryBySlug(slug);
    await this.redis.set(cacheKey, car, LIST_CACHE_TTL);
    return car;
  }

  private async queryBySlug(slug: string) {
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
