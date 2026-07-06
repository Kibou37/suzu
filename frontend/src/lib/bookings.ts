export type TestDrivePayload = {
  carSlug?: string;
  scheduledAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
};

export type TestDriveResult = {
  id: string;
  scheduledAt: string;
};

export type ServicePayload = {
  scheduledAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: string;
  vehicle?: string;
  vin?: string;
  mileage?: number;
  notes?: string;
};

export const SERVICE_TYPES = [
  'Scheduled maintenance',
  'Oil change',
  'Tyre service',
  'Diagnostics',
  'Warranty repair',
  'Other',
] as const;

function isDemoDataMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_DEMO_DATA === 'true';
}

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  }

  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

function demoStorageKey(type: 'TEST_DRIVE' | 'SERVICE'): string {
  return `suzuki-demo-bookings-${type}`;
}

function getDemoBookedSlots(type: 'TEST_DRIVE' | 'SERVICE'): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = sessionStorage.getItem(demoStorageKey(type));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function recordDemoBooking(type: 'TEST_DRIVE' | 'SERVICE', scheduledAt: string): void {
  if (typeof window === 'undefined') return;

  const booked = getDemoBookedSlots(type);
  if (booked.includes(scheduledAt)) return;

  sessionStorage.setItem(
    demoStorageKey(type),
    JSON.stringify([...booked, scheduledAt]),
  );
}

function demoSlotsForDate(date: string): string[] {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return [];

  const weekday = parsed.getDay();
  const hours =
    weekday === 0 ? [10, 11, 12, 13, 14, 15] : weekday === 6 ? [10, 11, 12, 13, 14, 15, 16] : [10, 11, 12, 13, 14, 15, 16, 17];

  return hours.map((hour) => {
    const slot = new Date(parsed);
    slot.setHours(hour, 0, 0, 0);
    return slot.toISOString();
  });
}

export async function getBookingSlots(
  date: string,
  type: 'TEST_DRIVE' | 'SERVICE' = 'TEST_DRIVE',
): Promise<string[]> {
  if (isDemoDataMode()) {
    const booked = getDemoBookedSlots(type);
    return demoSlotsForDate(date).filter((slot) => !booked.includes(slot));
  }

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/api/bookings/slots?date=${encodeURIComponent(date)}&type=${type}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function submitTestDrive(payload: TestDrivePayload): Promise<TestDriveResult> {
  if (isDemoDataMode()) {
    recordDemoBooking('TEST_DRIVE', payload.scheduledAt);
    return {
      id: 'demo-booking',
      scheduledAt: payload.scheduledAt,
    };
  }

  const res = await fetch(`${getApiBaseUrl()}/api/bookings/test-drive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Booking failed');
  }

  return res.json();
}

export async function submitService(payload: ServicePayload): Promise<TestDriveResult> {
  if (isDemoDataMode()) {
    recordDemoBooking('SERVICE', payload.scheduledAt);
    return {
      id: 'demo-service-booking',
      scheduledAt: payload.scheduledAt,
    };
  }

  const res = await fetch(`${getApiBaseUrl()}/api/bookings/service`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Booking failed');
  }

  return res.json();
}

function toIsoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function minBookingDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toIsoDateLocal(date);
}

export function formatBookingSlot(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatSlotTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

export function isValidVin(vin: string): boolean {
  return VIN_PATTERN.test(vin.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 6;
}
