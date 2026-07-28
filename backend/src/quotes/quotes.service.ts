import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { dealers } from '@suzuki/shared';
import { CrmService } from '../crm/crm.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import type { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly recaptchaService: RecaptchaService,
    private readonly crmService: CrmService,
  ) {}

  async create(input: CreateQuoteDto, userId?: string) {
    await this.recaptchaService.verify(input.recaptchaToken, 'quote_request');

    const customerName = input.customerName.trim();
    const customerPhone = input.customerPhone.trim();
    const customerEmail = input.customerEmail.trim().toLowerCase();
    const notes = input.notes?.trim() || null;
    const carSlug = input.carSlug.trim();
    const modelName = input.modelName.trim();
    const summary = input.summary.trim();
    const dealerId = input.dealerId.trim();

    if (customerName.length < 2) {
      throw new BadRequestException('Please enter your full name');
    }

    if (customerPhone.replace(/\D/g, '').length < 6) {
      throw new BadRequestException('Please enter a valid phone number');
    }

    const dealer = dealers.find((item) => item.id === dealerId);
    if (!dealer) {
      throw new BadRequestException('Please select a preferred dealer');
    }

    const car = await this.prisma.car.findUnique({
      where: { slug: carSlug },
      select: { id: true, slug: true, name: true },
    });

    if (!car) {
      throw new BadRequestException('Selected model was not found');
    }

    let configurationId: string | null = null;

    if (input.configurationId) {
      const configuration = await this.prisma.configuration.findUnique({
        where: { id: input.configurationId },
        select: { id: true, userId: true },
      });

      if (!configuration) {
        throw new BadRequestException('Configuration was not found');
      }

      // Reject whenever the configuration is owned by someone else — including
      // the case where the current request is anonymous, which previously
      // bypassed this check entirely and allowed reading/attaching another
      // customer's saved configuration by guessing its id.
      if (configuration.userId && configuration.userId !== userId) {
        throw new BadRequestException(
          'Configuration does not belong to this account',
        );
      }

      configurationId = configuration.id;
    }

    const contactMethod = input.contactMethod;
    const snapshot = (input.snapshot ?? {}) as Prisma.InputJsonValue;

    const quote = await this.prisma.quoteRequest.create({
      data: {
        userId: userId ?? null,
        configurationId,
        carSlug: car.slug,
        modelName: modelName || car.name,
        summary,
        snapshot,
        totalPrice: input.totalPrice,
        customerName,
        customerPhone,
        customerEmail,
        notes,
        dealerId: dealer.id,
        dealerName: dealer.name,
        contactMethod,
      },
    });

    void this.mailService.sendQuoteRequestSafe({
      customerName,
      customerPhone,
      customerEmail,
      notes,
      modelName: quote.modelName,
      summary,
      totalPrice: Number(quote.totalPrice),
      dealerName: dealer.name,
      contactMethod,
    });

    void this.crmService.sendLeadSafe({
      type: 'quote',
      title: `Quote — Suzuki ${quote.modelName} — ${customerName}`,
      customerName,
      customerPhone,
      customerEmail,
      comments: [summary, notes].filter(Boolean).join('\n\n'),
      sourceDescription: 'website_quote',
      fields: {
        quoteId: quote.id,
        carSlug: car.slug,
        totalPrice: Number(quote.totalPrice),
        dealerName: dealer.name,
        contactMethod,
      },
    });

    return {
      id: quote.id,
      status: quote.status,
      createdAt: quote.createdAt.toISOString(),
    };
  }
}
