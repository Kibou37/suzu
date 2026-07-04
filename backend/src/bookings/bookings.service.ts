import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type CreateTestDriveInput = {
  carSlug?: string;
  scheduledAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
};

export type CreateServiceInput = {
  scheduledAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: string;
  vin?: string;
  mileage?: number;
  notes?: string;
};

const SLOT_HOURS_WEEKDAY = [10, 11, 12, 13, 14, 15, 16, 17];
const SLOT_HOURS_SATURDAY = [10, 11, 12, 13, 14, 15, 16];
const SLOT_HOURS_SUNDAY = [10, 11, 12, 13, 14, 15];
const MAX_BOOKINGS_PER_SLOT = 1;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableSlots(
    date: string,
    type: BookingType = BookingType.TEST_DRIVE,
  ) {
    const day = this.parseDateOnly(date);
    const hours = this.getHoursForDay(day);

    if (hours.length === 0) {
      return [];
    }

    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await this.prisma.booking.findMany({
      where: {
        type,
        scheduledAt: { gte: dayStart, lte: dayEnd },
        status: { not: 'CANCELLED' },
      },
      select: { scheduledAt: true },
    });

    return hours
      .filter((hour) => {
        const taken = existing.filter(
          (booking) => booking.scheduledAt.getHours() === hour,
        ).length;
        return taken < MAX_BOOKINGS_PER_SLOT;
      })
      .map((hour) => this.formatSlotLabel(day, hour));
  }

  async createTestDrive(input: CreateTestDriveInput) {
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

    const allowedSlots = await this.getAvailableSlots(
      this.formatDateOnly(scheduledAt),
      BookingType.TEST_DRIVE,
    );
    const slotLabel = this.formatSlotLabel(scheduledAt, scheduledAt.getHours());

    if (!allowedSlots.includes(slotLabel)) {
      throw new BadRequestException('This time slot is no longer available');
    }

    let carId: string | undefined;

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
        scheduledAt,
        customerName: name,
        customerPhone: phone,
        customerEmail: input.customerEmail?.trim() || null,
        notes: input.notes?.trim() || null,
      },
    });

    return {
      id: booking.id,
      scheduledAt: booking.scheduledAt.toISOString(),
    };
  }

  async createService(input: CreateServiceInput) {
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

    const allowedSlots = await this.getAvailableSlots(
      this.formatDateOnly(scheduledAt),
      BookingType.SERVICE,
    );
    const slotLabel = this.formatSlotLabel(scheduledAt, scheduledAt.getHours());

    if (!allowedSlots.includes(slotLabel)) {
      throw new BadRequestException('This time slot is no longer available');
    }

    const notesParts = [`Service: ${serviceType}`];
    if (input.vin?.trim()) notesParts.push(`VIN: ${input.vin.trim()}`);
    if (input.mileage != null && input.mileage >= 0) {
      notesParts.push(`Mileage: ${input.mileage} km`);
    }
    if (input.notes?.trim()) notesParts.push(input.notes.trim());

    const booking = await this.prisma.booking.create({
      data: {
        type: BookingType.SERVICE,
        scheduledAt,
        customerName: name,
        customerPhone: phone,
        customerEmail: input.customerEmail?.trim() || null,
        notes: notesParts.join('\n'),
      },
    });

    return {
      id: booking.id,
      scheduledAt: booking.scheduledAt.toISOString(),
    };
  }

  private parseDateOnly(value: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      throw new BadRequestException('Invalid date format');
    }

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      throw new BadRequestException('Invalid date');
    }

    return date;
  }

  private formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getHoursForDay(date: Date): number[] {
    const weekday = date.getDay();

    if (weekday === 0) return SLOT_HOURS_SUNDAY;
    if (weekday === 6) return SLOT_HOURS_SATURDAY;
    return SLOT_HOURS_WEEKDAY;
  }

  private formatSlotLabel(date: Date, hour: number): string {
    const slot = new Date(date);
    slot.setHours(hour, 0, 0, 0);
    return slot.toISOString();
  }
}
