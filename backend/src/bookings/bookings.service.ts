import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingType } from '@prisma/client';
import { CrmService } from '../crm/crm.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import { SmsService } from '../sms/sms.service';
import {
  formatDateOnly,
  formatSlotIso,
  generateServiceSlotsForDay,
  getHoursForWeekday,
  parseDateOnly,
} from './booking-slots.util';
import type {
  CreateServiceDto,
  CreateTestDriveDto,
} from './dto/create-booking.dto';

export type CreateTestDriveInput = CreateTestDriveDto;
export type CreateServiceInput = CreateServiceDto;

export type UpsertServiceSlotInput = {
  startsAt: string;
  type: BookingType;
  maxBookings?: number;
  isBlocked?: boolean;
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recaptchaService: RecaptchaService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly crmService: CrmService,
  ) {}

  async getAvailableSlots(
    date: string,
    type: BookingType = BookingType.TEST_DRIVE,
  ): Promise<string[]> {
    let day: Date;
    try {
      day = parseDateOnly(date);
    } catch {
      throw new BadRequestException('Invalid date format');
    }
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const dbSlots = await this.prisma.serviceSlot.findMany({
      where: {
        type,
        startsAt: { gte: dayStart, lte: dayEnd },
        isBlocked: false,
      },
      orderBy: { startsAt: 'asc' },
    });

    const slots =
      dbSlots.length > 0
        ? dbSlots
        : generateServiceSlotsForDay(day, [type]).map((slot) => ({
            ...slot,
            id: '',
            isBlocked: false,
          }));

    if (slots.length === 0) {
      return [];
    }

    const existing = await this.prisma.booking.findMany({
      where: {
        type,
        scheduledAt: { gte: dayStart, lte: dayEnd },
        status: { not: 'CANCELLED' },
      },
      select: { scheduledAt: true },
    });

    return slots
      .filter((slot) => {
        const taken = existing.filter(
          (booking) =>
            booking.scheduledAt.getTime() === slot.startsAt.getTime(),
        ).length;
        return taken < slot.maxBookings;
      })
      .map((slot) => slot.startsAt.toISOString());
  }

  async listAdminSlots(from: string, to: string, type?: BookingType) {
    let fromDate: Date;
    let toDate: Date;
    try {
      fromDate = parseDateOnly(from);
      toDate = parseDateOnly(to);
    } catch {
      throw new BadRequestException('Invalid date range');
    }
    toDate.setHours(23, 59, 59, 999);

    return this.prisma.serviceSlot.findMany({
      where: {
        startsAt: { gte: fromDate, lte: toDate },
        ...(type ? { type } : {}),
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async upsertAdminSlot(input: UpsertServiceSlotInput) {
    const startsAt = new Date(input.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Invalid startsAt');
    }

    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 1);

    return this.prisma.serviceSlot.upsert({
      where: {
        startsAt_type: {
          startsAt,
          type: input.type,
        },
      },
      create: {
        startsAt,
        endsAt,
        type: input.type,
        maxBookings: input.maxBookings ?? 1,
        isBlocked: input.isBlocked ?? false,
      },
      update: {
        maxBookings: input.maxBookings ?? 1,
        isBlocked: input.isBlocked ?? false,
        endsAt,
      },
    });
  }

  async updateAdminSlot(
    id: string,
    input: { maxBookings?: number; isBlocked?: boolean },
  ) {
    const slot = await this.prisma.serviceSlot.findUnique({ where: { id } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    return this.prisma.serviceSlot.update({
      where: { id },
      data: {
        ...(input.maxBookings !== undefined
          ? { maxBookings: input.maxBookings }
          : {}),
        ...(input.isBlocked !== undefined
          ? { isBlocked: input.isBlocked }
          : {}),
      },
    });
  }

  async createTestDrive(input: CreateTestDriveInput, userId?: string) {
    await this.recaptchaService.verify(
      input.recaptchaToken,
      'test_drive_booking',
    );

    const scheduledAt = new Date(input.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid date or time');
    }

    if (scheduledAt <= new Date()) {
      throw new BadRequestException('Please choose a future date and time');
    }

    const name = input.customerName.trim();
    const phone = input.customerPhone.trim();

    if (name.length < 2) {
      throw new BadRequestException('Please enter your name');
    }

    if (phone.length < 6) {
      throw new BadRequestException('Please enter a valid phone number');
    }

    await this.assertSlotAvailable(scheduledAt, BookingType.TEST_DRIVE);

    let carId: string | undefined;
    let configurationId: string | undefined;
    let notes = input.notes?.trim() || null;

    if (input.configurationId) {
      const configuration = await this.prisma.configuration.findUnique({
        where: { id: input.configurationId },
        include: {
          variant: { include: { car: { select: { id: true, slug: true } } } },
        },
      });

      if (!configuration) {
        throw new BadRequestException('Configuration was not found');
      }

      if (configuration.userId && userId && configuration.userId !== userId) {
        throw new BadRequestException(
          'Configuration does not belong to this account',
        );
      }

      configurationId = configuration.id;
      carId = configuration.variant.car.id;

      if (!input.carSlug || input.carSlug === configuration.variant.car.slug) {
        input.carSlug = configuration.variant.car.slug;
      }

      const snapshotSummary =
        typeof configuration.snapshot === 'object' &&
        configuration.snapshot !== null &&
        'summary' in configuration.snapshot &&
        typeof (configuration.snapshot as { summary?: unknown }).summary ===
          'string'
          ? (configuration.snapshot as { summary: string }).summary
          : null;

      if (snapshotSummary) {
        notes = notes ? `${snapshotSummary}\n\n${notes}` : snapshotSummary;
      }
    }

    if (input.carSlug) {
      const car = await this.prisma.car.findUnique({
        where: { slug: input.carSlug },
        select: { id: true },
      });

      if (!car) {
        throw new BadRequestException('Selected model was not found');
      }

      carId = car.id;
    }

    const booking = await this.prisma.booking.create({
      data: {
        type: BookingType.TEST_DRIVE,
        carId,
        configurationId: configurationId ?? null,
        userId: userId ?? null,
        scheduledAt,
        customerName: name,
        customerPhone: phone,
        customerEmail: input.customerEmail?.trim() || null,
        notes,
      },
    });

    void this.mailService.sendBookingConfirmationSafe({
      type: BookingType.TEST_DRIVE,
      customerName: name,
      customerPhone: phone,
      customerEmail: booking.customerEmail,
      scheduledAt: booking.scheduledAt,
      notes: booking.notes,
    });

    void this.smsService.sendBookingConfirmationSafe({
      type: BookingType.TEST_DRIVE,
      customerName: name,
      customerPhone: phone,
      scheduledAt: booking.scheduledAt,
    });

    void this.crmService.sendLeadSafe({
      type: 'test_drive',
      title: `Test drive — ${name}`,
      customerName: name,
      customerPhone: phone,
      customerEmail: booking.customerEmail,
      comments: booking.notes,
      sourceDescription: 'website_test_drive',
      fields: {
        bookingId: booking.id,
        scheduledAt: booking.scheduledAt.toISOString(),
        carSlug: input.carSlug ?? null,
      },
    });

    return {
      id: booking.id,
      scheduledAt: booking.scheduledAt.toISOString(),
    };
  }

  async createService(input: CreateServiceInput, userId?: string) {
    await this.recaptchaService.verify(input.recaptchaToken, 'service_booking');

    const scheduledAt = new Date(input.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid date or time');
    }

    if (scheduledAt <= new Date()) {
      throw new BadRequestException('Please choose a future date and time');
    }

    const name = input.customerName.trim();
    const phone = input.customerPhone.trim();
    const serviceType = input.serviceType.trim();

    if (name.length < 2) {
      throw new BadRequestException('Please enter your name');
    }

    if (phone.length < 6) {
      throw new BadRequestException('Please enter a valid phone number');
    }

    if (serviceType.length < 2) {
      throw new BadRequestException('Please select a service type');
    }

    await this.assertSlotAvailable(scheduledAt, BookingType.SERVICE);

    const notesParts = [`Service: ${serviceType}`];
    if (input.vehicle?.trim()) {
      notesParts.push(`Vehicle: ${input.vehicle.trim()}`);
    }
    if (input.vin?.trim()) notesParts.push(`VIN: ${input.vin.trim()}`);
    if (input.mileage != null && input.mileage >= 0) {
      notesParts.push(`Mileage: ${input.mileage} km`);
    }
    if (input.notes?.trim()) notesParts.push(input.notes.trim());

    const booking = await this.prisma.booking.create({
      data: {
        type: BookingType.SERVICE,
        userId: userId ?? null,
        scheduledAt,
        customerName: name,
        customerPhone: phone,
        customerEmail: input.customerEmail?.trim() || null,
        notes: notesParts.join('\n'),
      },
    });

    void this.mailService.sendBookingConfirmationSafe({
      type: BookingType.SERVICE,
      customerName: name,
      customerPhone: phone,
      customerEmail: booking.customerEmail,
      scheduledAt: booking.scheduledAt,
      notes: booking.notes,
    });

    void this.smsService.sendBookingConfirmationSafe({
      type: BookingType.SERVICE,
      customerName: name,
      customerPhone: phone,
      scheduledAt: booking.scheduledAt,
    });

    void this.crmService.sendLeadSafe({
      type: 'service',
      title: `Service — ${name}`,
      customerName: name,
      customerPhone: phone,
      customerEmail: booking.customerEmail,
      comments: booking.notes,
      sourceDescription: 'website_service',
      fields: {
        bookingId: booking.id,
        scheduledAt: booking.scheduledAt.toISOString(),
        serviceType,
      },
    });

    return {
      id: booking.id,
      scheduledAt: booking.scheduledAt.toISOString(),
    };
  }

  private async assertSlotAvailable(scheduledAt: Date, type: BookingType) {
    const allowedSlots = await this.getAvailableSlots(
      formatDateOnly(scheduledAt),
      type,
    );

    if (!allowedSlots.includes(scheduledAt.toISOString())) {
      throw new BadRequestException('This time slot is no longer available');
    }
  }

  /** @deprecated kept for tests — use booking-slots.util */
  getHoursForDay(date: Date): number[] {
    return getHoursForWeekday(date.getDay());
  }

  /** @deprecated kept for tests */
  formatSlotLabel(date: Date, hour: number): string {
    return formatSlotIso(date, hour);
  }
}
