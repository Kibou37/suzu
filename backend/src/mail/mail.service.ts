import { Injectable, Logger } from '@nestjs/common';
import { BookingType, QuoteContactMethod } from '@prisma/client';
import { dealer } from '@suzuki/shared';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type BookingEmailInput = {
  type: BookingType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  scheduledAt: Date;
  notes?: string | null;
};

type QuoteEmailInput = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string | null;
  modelName: string;
  summary: string;
  totalPrice: number;
  dealerName: string;
  contactMethod: QuoteContactMethod;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  isConfigured(): boolean {
    return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  }

  private getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
    });

    return this.transporter;
  }

  private getFromAddress(): string {
    return process.env.MAIL_FROM ?? process.env.GMAIL_USER ?? dealer.email;
  }

  private getDealerInbox(): string {
    return process.env.MAIL_TO ?? dealer.email;
  }

  private formatSlot(date: Date): string {
    return date.toLocaleString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
    });
  }

  private bookingLabel(type: BookingType): string {
    return type === BookingType.TEST_DRIVE
      ? 'test drive'
      : 'service appointment';
  }

  private contactMethodLabel(method: QuoteContactMethod): string {
    switch (method) {
      case QuoteContactMethod.PHONE:
        return 'Phone';
      case QuoteContactMethod.EMAIL:
        return 'Email';
      default:
        return 'Phone or email';
    }
  }

  async sendBookingConfirmation(input: BookingEmailInput): Promise<void> {
    const transporter = this.getTransporter();

    if (!transporter) {
      return;
    }

    const slot = this.formatSlot(input.scheduledAt);
    const label = this.bookingLabel(input.type);
    const from = this.getFromAddress();
    const dealerInbox = this.getDealerInbox();

    const customerLines = [
      `Dear ${input.customerName},`,
      '',
      `Thank you for booking a ${label} with ${dealer.name}.`,
      `Your appointment is scheduled for ${slot}.`,
      '',
      'We will contact you shortly to confirm the details.',
      '',
      `${dealer.name}`,
      dealer.address,
      dealer.phone,
    ];

    const dealerLines = [
      `New ${label} booking`,
      '',
      `Name: ${input.customerName}`,
      `Phone: ${input.customerPhone}`,
      input.customerEmail ? `Email: ${input.customerEmail}` : null,
      `When: ${slot}`,
      input.notes ? `Notes:\n${input.notes}` : null,
    ].filter(Boolean);

    const tasks: Promise<unknown>[] = [
      transporter.sendMail({
        from,
        to: dealerInbox,
        subject: `New ${label} — ${input.customerName}`,
        text: dealerLines.join('\n'),
      }),
    ];

    if (input.customerEmail) {
      tasks.push(
        transporter.sendMail({
          from,
          to: input.customerEmail,
          subject: `Your ${label} booking — ${dealer.name}`,
          text: customerLines.join('\n'),
        }),
      );
    }

    await Promise.all(tasks);
  }

  async sendBookingConfirmationSafe(input: BookingEmailInput): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      await this.sendBookingConfirmation(input);
    } catch (error) {
      this.logger.error('Failed to send booking email', error);
    }
  }

  async sendQuoteRequest(input: QuoteEmailInput): Promise<void> {
    const transporter = this.getTransporter();

    if (!transporter) {
      return;
    }

    const from = this.getFromAddress();
    const dealerInbox = this.getDealerInbox();
    const contactMethod = this.contactMethodLabel(input.contactMethod);
    const priceLine =
      input.totalPrice > 0
        ? `Estimated total: £${input.totalPrice.toLocaleString('en-GB')}`
        : 'Estimated total: on request';

    const dealerLines = [
      'New quote request',
      '',
      `Name: ${input.customerName}`,
      `Phone: ${input.customerPhone}`,
      `Email: ${input.customerEmail}`,
      `Preferred contact: ${contactMethod}`,
      `Preferred dealer: ${input.dealerName}`,
      `Model: Suzuki ${input.modelName}`,
      priceLine,
      '',
      'Configuration:',
      input.summary,
      input.notes ? `\nCustomer comment:\n${input.notes}` : null,
    ].filter(Boolean);

    const customerLines = [
      `Dear ${input.customerName},`,
      '',
      `Thank you for requesting a quote for the Suzuki ${input.modelName}.`,
      `${input.dealerName} will contact you shortly with a tailored offer.`,
      '',
      'Your configuration:',
      input.summary,
      '',
      priceLine,
      '',
      `${dealer.name}`,
      dealer.address,
      dealer.phone,
    ];

    await Promise.all([
      transporter.sendMail({
        from,
        to: dealerInbox,
        subject: `Quote request — Suzuki ${input.modelName} — ${input.customerName}`,
        text: dealerLines.join('\n'),
      }),
      transporter.sendMail({
        from,
        to: input.customerEmail,
        subject: `Your quote request — Suzuki ${input.modelName}`,
        text: customerLines.join('\n'),
      }),
    ]);
  }

  async sendQuoteRequestSafe(input: QuoteEmailInput): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      await this.sendQuoteRequest(input);
    } catch (error) {
      this.logger.error('Failed to send quote request email', error);
    }
  }

  async sendContactMessage(input: {
    name: string;
    email: string;
    phone?: string | null;
    message: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) return;

    const from = this.getFromAddress();
    const dealerInbox = this.getDealerInbox();

    await transporter.sendMail({
      from,
      to: dealerInbox,
      replyTo: input.email,
      subject: `Contact form — ${input.name}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        input.phone ? `Phone: ${input.phone}` : null,
        '',
        input.message,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }

  async sendContactMessageSafe(input: {
    name: string;
    email: string;
    phone?: string | null;
    message: string;
  }): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.debug(`Contact form (mail skipped): ${input.email}`);
      return;
    }

    try {
      await this.sendContactMessage(input);
    } catch (error) {
      this.logger.error('Failed to send contact email', error);
    }
  }

  async sendPasswordReset(input: {
    email: string;
    resetUrl: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(
          `Password reset link for ${input.email}: ${input.resetUrl}`,
        );
      }
      return;
    }

    const from = this.getFromAddress();
    await transporter.sendMail({
      from,
      to: input.email,
      subject: `Password reset — ${dealer.name}`,
      text: [
        'We received a request to reset your password.',
        '',
        `Open this link to choose a new password (valid for 1 hour):`,
        input.resetUrl,
        '',
        'If you did not request this, you can ignore this email.',
        '',
        dealer.name,
      ].join('\n'),
    });
  }

  async sendPasswordResetSafe(input: {
    email: string;
    resetUrl: string;
  }): Promise<void> {
    try {
      await this.sendPasswordReset(input);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
    }
  }
}
