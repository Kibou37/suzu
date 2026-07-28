import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { CrmModule } from '../crm/crm.module';
import { RecaptchaModule } from '../recaptcha/recaptcha.module';
import { SmsModule } from '../sms/sms.module';
import { BookingSlotsAdminController } from './booking-slots-admin.controller';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [RecaptchaModule, MailModule, SmsModule, AuthModule, CrmModule],
  controllers: [BookingsController, BookingSlotsAdminController],
  providers: [BookingsService],
})
export class BookingsModule {}
