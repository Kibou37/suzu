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
    return demoSlotsForDate(date);
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
