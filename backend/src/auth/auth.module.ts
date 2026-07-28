import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { RedisModule } from '../redis/redis.module';
import { SmsModule } from '../sms/sms.module';
import { AdminRolesGuard } from './admin-roles.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

@Module({
  imports: [RedisModule, SmsModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard, AdminRolesGuard],
  exports: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard, AdminRolesGuard],
})
export class AuthModule {}
