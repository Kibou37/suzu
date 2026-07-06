'use client';

import { useMemo, useState } from 'react';
import { minBookingDate } from '@/lib/bookings';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
] as const;

type BookingDateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
};

function parseIsoDate(iso: string): { year: string; month: string; day: string } {
  if (!iso) {
    return { year: '', month: '', day: '' };
  }

  const [year = '', month = '', day = ''] = iso.split('-');
  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function clampDay(year: string, month: string, day: string, minIso: string): string {
  if (!year || !month || !day) {
    return day;
  }

  const maxDay = daysInMonth(Number(year), Number(month));
  let nextDay = Math.min(Number(day), maxDay);

  const { year: minYear, month: minMonth, day: minDay } = parseIsoDate(minIso);
  if (year === minYear && month === minMonth && nextDay < Number(minDay)) {
    nextDay = Number(minDay);
  }

  return String(nextDay).padStart(2, '0');
}

function buildIso(year: string, month: string, day: string): string {
  if (!year || !month || !day) {
    return '';
  }

  return `${year}-${month}-${day}`;
}

export function BookingDateField({
  value,
  onChange,
  min = minBookingDate(),
  required = false,
}: BookingDateFieldProps) {
  const [parts, setParts] = useState(() => parseIsoDate(value));

  const { year, month, day } = parts;
  const minParts = parseIsoDate(min);
  const minYear = Number(minParts.year);

  const years = useMemo(() => {
    const endYear = minYear + 1;
    return Array.from({ length: endYear - minYear + 1 }, (_, index) => String(minYear + index));
  }, [minYear]);

  const months = useMemo(() => {
    if (!year) {
      return [...MONTHS];
    }

    if (Number(year) > minYear) {
      return [...MONTHS];
    }

    if (Number(year) < minYear) {
      return [];
    }

    return MONTHS.filter((item) => Number(item.value) >= Number(minParts.month));
  }, [minParts.month, minYear, year]);

  const days = useMemo(() => {
    if (!year || !month) {
      return [];
    }

    const maxDay = daysInMonth(Number(year), Number(month));
    const startDay =
      year === minParts.year && month === minParts.month ? Number(minParts.day) : 1;

    return Array.from({ length: maxDay - startDay + 1 }, (_, index) =>
      String(startDay + index).padStart(2, '0'),
    );
  }, [minParts.day, minParts.month, minParts.year, month, year]);

  const updateDate = (nextYear: string, nextMonth: string, nextDay: string) => {
    const clampedDay = clampDay(nextYear, nextMonth, nextDay, min);
    const nextParts = { year: nextYear, month: nextMonth, day: clampedDay };
    setParts(nextParts);

    const iso = buildIso(nextYear, nextMonth, clampedDay);
    if (!iso || iso < min) {
      onChange('');
      return;
    }

    onChange(iso);
  };

  return (
    <div className="conversion-form__date-row">
      <select
        className="conversion-form__select"
        value={year}
        onChange={(event) => updateDate(event.target.value, month, day)}
        required={required}
        aria-label="Year"
      >
        <option value="" disabled>
          Year
        </option>
        {years.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        className="conversion-form__select"
        value={month}
        onChange={(event) => updateDate(year, event.target.value, day)}
        required={required}
        disabled={!year}
        aria-label="Month"
      >
        <option value="" disabled>
          Month
        </option>
        {months.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <select
        className="conversion-form__select"
        value={day}
        onChange={(event) => updateDate(year, month, event.target.value)}
        required={required}
        disabled={!year || !month}
        aria-label="Day"
      >
        <option value="" disabled>
          Day
        </option>
        {days.map((item) => (
          <option key={item} value={item}>
            {Number(item)}
          </option>
        ))}
      </select>
    </div>
  );
}
