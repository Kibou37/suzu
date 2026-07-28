import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountService } from './account.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('bookings')
  getBookings(@CurrentUser() user: AuthUser) {
    return this.accountService.getBookings(user.sub);
  }

  @Patch('bookings/:id/cancel')
  cancelBooking(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.accountService.cancelBooking(user.sub, id);
  }

  @Post('bookings/cancel')
  cancelBookingById(
    @CurrentUser() user: AuthUser,
    @Body() body: CancelBookingDto,
  ) {
    return this.accountService.cancelBooking(user.sub, body.id);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: AuthUser, @Body() body: UpdateProfileDto) {
    return this.accountService.updateProfile(user.sub, body);
  }
}
