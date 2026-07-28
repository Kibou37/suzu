import { Module } from '@nestjs/common';
import { CrmModule } from '../crm/crm.module';
import { MailModule } from '../mail/mail.module';
import { RecaptchaModule } from '../recaptcha/recaptcha.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [MailModule, CrmModule, RecaptchaModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
