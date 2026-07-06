import { Injectable, Logger } from '@nestjs/common';
import { BookingType } from '@prisma/client';
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
}
