import { Controller, Get, Param, Query } from '@nestjs/common';
import { BodyType, CarCondition, FuelType, Transmission } from '@prisma/client';
import { CarsService } from './cars.service';

function readNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  findAll(
    @Query('condition') condition?: CarCondition,
    @Query('isOffer') isOffer?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minYear') minYear?: string,
    @Query('maxYear') maxYear?: string,
    @Query('maxMileage') maxMileage?: string,
    @Query('bodyType') bodyType?: BodyType,
    @Query('fuelType') fuelType?: FuelType,
    @Query('transmission') transmission?: Transmission,
    @Query('trim') trim?: string,
  ) {
    return this.carsService.findAll({
      condition,
      isOffer:
        isOffer === 'true' ? true : isOffer === 'false' ? false : undefined,
      minPrice: readNumber(minPrice),
      maxPrice: readNumber(maxPrice),
      minYear: readNumber(minYear),
      maxYear: readNumber(maxYear),
      maxMileage: readNumber(maxMileage),
      bodyType,
      fuelType,
      transmission,
      trim,
    });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.carsService.findBySlug(slug);
  }
}
