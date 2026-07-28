import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingStatus, BookingType } from '@prisma/client';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminBookingsService } from './admin-bookings.service';
import { OPERATIONS_ROLES } from './admin-permissions';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('admin')
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
@Roles(...OPERATIONS_ROLES)
export class AdminBookingsController {
  constructor(private readonly bookingsService: AdminBookingsService) {}

  @Get()
  list(
    @Query('type') type?: BookingType,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.list({ type, status });
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() body: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, body.status);
  }
}
