import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { AuthService } from '../auth/auth.service';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminLoginDto } from './dto/admin-login.dto';

@ApiTags('admin')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: AdminLoginDto) {
    const result = await this.authService.login(body);
    const role = await this.authService.getUserRole(result.user.id);

    if (role === Role.CUSTOMER) {
      throw new ForbiddenException('This account does not have admin access.');
    }

    return { ...result, user: { ...result.user, role } };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, AdminRolesGuard)
  async me(@CurrentUser() user: AuthUser) {
    const profile = await this.authService.getProfile(user.sub);
    return { ...profile, role: user.role };
  }
}
