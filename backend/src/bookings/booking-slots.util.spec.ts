import {
  generateServiceSlotsForDay,
  getHoursForWeekday,
  parseDateOnly,
} from './booking-slots.util';
import { BookingType } from '@prisma/client';

describe('booking-slots.util', () => {
  it('returns weekday hours for Monday', () => {
    const monday = parseDateOnly('2026-07-20');
    expect(getHoursForWeekday(monday.getDay())).toEqual([
      10, 11, 12, 13, 14, 15, 16, 17,
    ]);
  });

  it('generates separate slots for test drive and service', () => {
    const day = parseDateOnly('2026-07-21');
    const slots = generateServiceSlotsForDay(day, [
      BookingType.TEST_DRIVE,
      BookingType.SERVICE,
    ]);

    expect(slots.length).toBe(getHoursForWeekday(day.getDay()).length * 2);
    expect(slots.some((slot) => slot.type === BookingType.TEST_DRIVE)).toBe(
      true,
    );
    expect(slots.some((slot) => slot.type === BookingType.SERVICE)).toBe(true);
  });
});
