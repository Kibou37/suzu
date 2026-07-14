import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BookingType } from '@prisma/client';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import {
  BookingsService,
  type CreateServiceInput,
  type CreateTestDriveInput,
} from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('slots')
  getSlots(@Query('date') date: string, @Query('type') type?: BookingType) {
    return this.bookingsService.getAvailableSlots(
      date,
      type ?? BookingType.TEST_DRIVE,
    );
  }

  @Post('test-drive')
  @UseGuards(OptionalJwtAuthGuard)
  createTestDrive(
    @Body() body: CreateTestDriveInput,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.bookingsService.createTestDrive(body, user?.sub);
  }

  @Post('service')
  @UseGuards(OptionalJwtAuthGuard)
  createService(
    @Body() body: CreateServiceInput,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.bookingsService.createService(body, user?.sub);
  }
}
