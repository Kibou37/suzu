import { Injectable, NotFoundException } from '@nestjs/common';
import type { CarCondition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { uniqueCarSlug } from './admin.util';
import type { CreateCarDto, UpdateCarDto } from './dto/car.dto';

@Injectable()
export class AdminCarsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  list(params: { condition?: CarCondition }) {
    return this.prisma.car.findMany({
      where: params.condition ? { condition: params.condition } : undefined,
      orderBy: [{ updatedAt: 'desc' }],
      include: { variants: true },
    });
  }

  async getOne(id: string) {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!car) {
      throw new NotFoundException('Car not found');
    }
    return car;
  }

  async create(input: CreateCarDto) {
    const slug = await uniqueCarSlug(this.prisma, input.name, input.slug);

    const car = await this.prisma.car.create({
      data: {
        name: input.name.trim(),
        slug,
        condition: input.condition,
        year: input.year,
        price: input.price,
        bodyType: input.bodyType,
        fuelType: input.fuelType,
        transmission: input.transmission,
        trim: input.trim?.trim() || null,
        description: input.description?.trim() || null,
        mileage: input.mileage ?? 0,
        horsepower: input.horsepower ?? null,
        isFeatured: input.isFeatured ?? false,
        isOffer: input.isOffer ?? false,
        offerLabel: input.offerLabel?.trim() || null,
        images: input.images ?? [],
        ...(input.variantName
          ? {
              variants: {
                create: [
                  { name: input.variantName.trim(), basePrice: input.price },
                ],
              },
            }
          : {}),
      },
      include: { variants: true },
    });

    await this.invalidateCache();
    return car;
  }

  async update(id: string, input: UpdateCarDto) {
    const existing = await this.prisma.car.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Car not found');
    }

    const slug =
      input.slug !== undefined || input.name !== undefined
        ? await uniqueCarSlug(
            this.prisma,
            input.name ?? existing.name,
            input.slug,
            id,
          )
        : existing.slug;

    const car = await this.prisma.car.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        slug,
        ...(input.condition !== undefined
          ? { condition: input.condition }
          : {}),
        ...(input.year !== undefined ? { year: input.year } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.bodyType !== undefined ? { bodyType: input.bodyType } : {}),
        ...(input.fuelType !== undefined ? { fuelType: input.fuelType } : {}),
        ...(input.transmission !== undefined
          ? { transmission: input.transmission }
          : {}),
        ...(input.trim !== undefined
          ? { trim: input.trim.trim() || null }
          : {}),
        ...(input.description !== undefined
          ? { description: input.description.trim() || null }
          : {}),
        ...(input.mileage !== undefined ? { mileage: input.mileage } : {}),
        ...(input.horsepower !== undefined
          ? { horsepower: input.horsepower }
          : {}),
        ...(input.isFeatured !== undefined
          ? { isFeatured: input.isFeatured }
          : {}),
        ...(input.isOffer !== undefined ? { isOffer: input.isOffer } : {}),
        ...(input.offerLabel !== undefined
          ? { offerLabel: input.offerLabel.trim() || null }
          : {}),
        ...(input.images !== undefined ? { images: input.images } : {}),
      },
      include: { variants: true },
    });

    await this.invalidateCache(existing.slug);
    return car;
  }

  async remove(id: string) {
    const existing = await this.prisma.car.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Car not found');
    }
    await this.prisma.car.delete({ where: { id } });
    await this.invalidateCache(existing.slug);
    return { deleted: true };
  }

  private async invalidateCache(slug?: string) {
    await this.redis.deleteByPrefix('cars:list');
    await this.redis.deleteByPrefix('cars:facets');
    if (slug) {
      await this.redis.deleteByPrefix(`cars:slug:${slug}`);
    }
  }
}
