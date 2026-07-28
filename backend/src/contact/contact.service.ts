import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CrmService } from '../crm/crm.service';
import { MailService } from '../mail/mail.service';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import type { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly crmService: CrmService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  async create(input: CreateContactDto) {
    await this.recaptchaService.verify(input.recaptchaToken, 'contact_form');

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone?.trim() || null;
    const message = input.message.trim();

    if (name.length < 2) {
      throw new BadRequestException('Please enter your name');
    }

    if (message.length < 10) {
      throw new BadRequestException('Please enter a longer message');
    }

    void this.mailService.sendContactMessageSafe({
      name,
      email,
      phone,
      message,
    });

    void this.crmService.sendLeadSafe({
      type: 'contact',
      title: `Contact form — ${name}`,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      comments: message,
      sourceDescription: 'website_contact',
    });

    this.logger.debug(`Contact form accepted from ${email}`);

    return { ok: true };
  }
}
