import { Injectable, Logger } from '@nestjs/common';
import { BookingType } from '@prisma/client';
import { dealer } from '@suzuki/shared';

type BookingSmsInput = {
  type: BookingType;
  customerName: string;
  customerPhone: string;
  scheduledAt: Date;
};

/**
 * SMS.ru client.
 * Without SMSRU_API_KEY (or legacy SMS_API_ID) messages are logged only.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  isConfigured(): boolean {
    return Boolean(this.resolveApiKey());
  }

  private resolveApiKey(): string | undefined {
    return (
      process.env.SMSRU_API_KEY?.trim() ||
      process.env.SMS_API_ID?.trim() ||
      undefined
    );
  }

  private resolveFrom(): string | undefined {
    return (
      process.env.SMSRU_FROM?.trim() ||
      process.env.SMS_FROM?.trim() ||
      undefined
    );
  }

  private bookingLabel(type: BookingType): string {
    return type === BookingType.TEST_DRIVE
      ? 'test drive'
      : 'service appointment';
  }

  private formatSlot(date: Date): string {
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
    });
  }

  private normalizeTo(phone: string): string {
    return phone.replace(/\s+/g, '').replace(/^\+/, '');
  }

  async sendText(phone: string, text: string): Promise<void> {
    const to = this.normalizeTo(phone);
    const apiId = this.resolveApiKey();

    if (!apiId) {
      this.logger.debug(`SMS stub → ${to} | ${text}`);
      return;
    }

    const params = new URLSearchParams({
      api_id: apiId,
      to,
      msg: text,
      json: '1',
    });
    const from = this.resolveFrom();
    if (from) params.set('from', from);

    const response = await fetch(
      `https://sms.ru/sms/send?${params.toString()}`,
    );
    if (!response.ok) {
      this.logger.warn(`SMS provider HTTP ${response.status} for ${to}`);
      return;
    }

    const payload = (await response.json()) as {
      status?: string;
      status_text?: string;
    };
    if (payload.status && payload.status !== 'OK') {
      this.logger.warn(
        `SMS provider rejected send to ${to}: ${payload.status_text ?? payload.status}`,
      );
    }
  }

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    const text = `${dealer.name}: your verification code is ${code}. Valid for 10 minutes.`;
    await this.sendText(phone, text);
  }

  async sendBookingConfirmation(input: BookingSmsInput): Promise<void> {
    const label = this.bookingLabel(input.type);
    const slot = this.formatSlot(input.scheduledAt);
    const text = `${dealer.name}: your ${label} is booked for ${slot}. We will confirm shortly.`;
    await this.sendText(input.customerPhone, text);
  }

  async sendBookingConfirmationSafe(input: BookingSmsInput): Promise<void> {
    try {
      await this.sendBookingConfirmation(input);
    } catch (error) {
      this.logger.error('Failed to send booking SMS', error);
    }
  }
}
