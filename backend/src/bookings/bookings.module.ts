import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { RecaptchaModule } from '../recaptcha/recaptcha.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [RecaptchaModule, MailModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
