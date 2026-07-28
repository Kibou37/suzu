import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingType } from '@prisma/client';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { OPERATIONS_ROLES } from '../admin/admin-permissions';
import { BookingsService } from './bookings.service';

@ApiTags('admin')
@Controller('bookings/admin/slots')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
@Roles(...OPERATIONS_ROLES)
export class BookingSlotsAdminController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  list(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('type') type?: BookingType,
  ) {
    return this.bookingsService.listAdminSlots(from, to, type);
  }

  @Post()
  upsert(
    @Body()
    body: {
      startsAt: string;
      type: BookingType;
      maxBookings?: number;
      isBlocked?: boolean;
    },
  ) {
    return this.bookingsService.upsertAdminSlot(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { maxBookings?: number; isBlocked?: boolean },
  ) {
    return this.bookingsService.updateAdminSlot(id, body);
  }
}
