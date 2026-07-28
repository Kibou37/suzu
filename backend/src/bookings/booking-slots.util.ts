import { BookingType } from '@prisma/client';

export const SLOT_HOURS_WEEKDAY = [10, 11, 12, 13, 14, 15, 16, 17];
export const SLOT_HOURS_SATURDAY = [10, 11, 12, 13, 14, 15, 16];
export const SLOT_HOURS_SUNDAY = [10, 11, 12, 13, 14, 15];

export function getHoursForWeekday(weekday: number): number[] {
  if (weekday === 0) return SLOT_HOURS_SUNDAY;
  if (weekday === 6) return SLOT_HOURS_SATURDAY;
  return SLOT_HOURS_WEEKDAY;
}

export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error('Invalid date format');
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
    throw new Error('Invalid date');
  }

  return date;
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildSlotStartsAt(day: Date, hour: number): Date {
  const slot = new Date(day);
  slot.setHours(hour, 0, 0, 0);
  return slot;
}

export function buildSlotEndsAt(startsAt: Date): Date {
  const endsAt = new Date(startsAt);
  endsAt.setHours(endsAt.getHours() + 1);
  return endsAt;
}

export function formatSlotIso(date: Date, hour: number): string {
  return buildSlotStartsAt(date, hour).toISOString();
}

export type GeneratedServiceSlot = {
  startsAt: Date;
  endsAt: Date;
  type: BookingType;
  maxBookings: number;
};

export function generateServiceSlotsForDay(
  day: Date,
  types: BookingType[] = [BookingType.TEST_DRIVE, BookingType.SERVICE],
): GeneratedServiceSlot[] {
  const hours = getHoursForWeekday(day.getDay());
  const slots: GeneratedServiceSlot[] = [];

  for (const type of types) {
    for (const hour of hours) {
      const startsAt = buildSlotStartsAt(day, hour);
      slots.push({
        startsAt,
        endsAt: buildSlotEndsAt(startsAt),
        type,
        maxBookings: 1,
      });
    }
  }

  return slots;
}
