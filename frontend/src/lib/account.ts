import {
  authHeaders,
  getAuthToken,
  type UserProfile,
} from '@/lib/auth';
import {
  apiUrl,
  isDemoDataMode,
  parseApiError,
  STORAGE_KEYS,
} from '@/lib/config';

export type AccountBooking = {
  id: string;
  type: 'TEST_DRIVE' | 'SERVICE';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  carName: string | null;
  carSlug: string | null;
  createdAt: string;
};

export type UpdateProfilePayload = {
  phone?: string;
  firstName?: string;
  lastName?: string;
};

function readDemoBookings(userId: string): AccountBooking[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.demoBookings);
    const all = raw ? (JSON.parse(raw) as Record<string, AccountBooking[]>) : {};
    return all[userId] ?? [];
  } catch {
    return [];
  }
}

function writeDemoBookings(userId: string, bookings: AccountBooking[]): void {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(STORAGE_KEYS.demoBookings);
  const all = raw ? (JSON.parse(raw) as Record<string, AccountBooking[]>) : {};
  all[userId] = bookings;
  localStorage.setItem(STORAGE_KEYS.demoBookings, JSON.stringify(all));
}

export function saveDemoBooking(userId: string, booking: AccountBooking): void {
  if (typeof window === 'undefined') return;

  const current = readDemoBookings(userId);
  const alreadyExists = current.some((b) => b.id === booking.id);
  if (!alreadyExists) {
    writeDemoBookings(userId, [booking, ...current]);
  }
}

export async function cancelAccountBooking(bookingId: string): Promise<AccountBooking> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Sign in to manage bookings');
  }

  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    if (!sessionId) {
      throw new Error('Session expired');
    }

    const bookings = readDemoBookings(sessionId);
    const index = bookings.findIndex((booking) => booking.id === bookingId);

    if (index === -1) {
      throw new Error('Booking not found');
    }

    if (bookings[index].type !== 'TEST_DRIVE') {
      throw new Error('Only test drive bookings can be cancelled here');
    }

    if (bookings[index].status === 'CANCELLED' || bookings[index].status === 'COMPLETED') {
      throw new Error('This booking cannot be cancelled');
    }

    const updated: AccountBooking = {
      ...bookings[index],
      status: 'CANCELLED',
    };

    bookings[index] = updated;
    writeDemoBookings(sessionId, bookings);
    return updated;
  }

  const res = await fetch(apiUrl('/api/account/bookings/cancel'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ id: bookingId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(text, 'Unable to cancel booking'));
  }

  return res.json();
}

export async function fetchAccountBookings(): Promise<AccountBooking[]> {
  const token = getAuthToken();
  if (!token) return [];

  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    return sessionId ? readDemoBookings(sessionId) : [];
  }

  const res = await fetch(apiUrl('/api/account/bookings'), {
    headers: authHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Unable to load bookings');
  }

  const items = (await res.json()) as Array<
    AccountBooking & { car?: { name: string; slug: string } | null }
  >;

  return items.map((item) => ({
    id: item.id,
    type: item.type,
    status: item.status,
    scheduledAt: item.scheduledAt,
    customerName: item.customerName,
    customerPhone: item.customerPhone,
    customerEmail: item.customerEmail,
    notes: item.notes,
    carName: item.car?.name ?? item.carName ?? null,
    carSlug: item.car?.slug ?? item.carSlug ?? null,
    createdAt: item.createdAt,
  }));
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    const usersRaw = localStorage.getItem(STORAGE_KEYS.demoUsers);
    const users = usersRaw
      ? (JSON.parse(usersRaw) as Array<UserProfile & { passwordHash: string }>)
      : [];
    const index = users.findIndex((user) => user.id === sessionId);

    if (index === -1) {
      throw new Error('Session expired');
    }

    users[index] = {
      ...users[index],
      phone: payload.phone?.trim() || users[index].phone,
      firstName: payload.firstName?.trim() || users[index].firstName,
      lastName: payload.lastName?.trim() || users[index].lastName,
    };

    localStorage.setItem(STORAGE_KEYS.demoUsers, JSON.stringify(users));

    return {
      id: users[index].id,
      email: users[index].email,
      phone: users[index].phone,
      firstName: users[index].firstName,
      lastName: users[index].lastName,
      vehicleIdentifierType: users[index].vehicleIdentifierType ?? null,
      vehicleIdentifier: users[index].vehicleIdentifier ?? null,
      dealerId: users[index].dealerId ?? null,
      dealerName: users[index].dealerName ?? null,
    };
  }

  const res = await fetch(apiUrl('/api/account/profile'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(text, 'Unable to update profile'));
  }

  return res.json();
}

export function bookingTypeLabel(type: AccountBooking['type']): string {
  return type === 'TEST_DRIVE' ? 'Test drive' : 'Service';
}

export function bookingStatusLabel(status: AccountBooking['status']): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}
