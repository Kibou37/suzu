import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookingType } from '@prisma/client';
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
  createTestDrive(@Body() body: CreateTestDriveInput) {
    return this.bookingsService.createTestDrive(body);
  }

  @Post('service')
  createService(@Body() body: CreateServiceInput) {
    return this.bookingsService.createService(body);
  }
}
