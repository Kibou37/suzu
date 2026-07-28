import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CrmModule } from '../crm/crm.module';
import { MailModule } from '../mail/mail.module';
import { RecaptchaModule } from '../recaptcha/recaptcha.module';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [RecaptchaModule, MailModule, AuthModule, CrmModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class QuotesModule {}
