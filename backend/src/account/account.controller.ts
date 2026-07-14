import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountService } from './account.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('bookings')
  getBookings(@CurrentUser() user: AuthUser) {
    return this.accountService.getBookings(user.sub);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProfileDto,
  ) {
    return this.accountService.updateProfile(user.sub, body);
  }
}
