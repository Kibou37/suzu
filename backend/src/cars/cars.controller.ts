import { Controller, Get, Param, Query } from '@nestjs/common';
import { CarCondition } from '@prisma/client';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  findAll(
    @Query('condition') condition?: CarCondition,
    @Query('isOffer') isOffer?: string,
  ) {
    return this.carsService.findAll({
      condition,
      isOffer:
        isOffer === 'true' ? true : isOffer === 'false' ? false : undefined,
    });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.carsService.findBySlug(slug);
  }
}
