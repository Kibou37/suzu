import { hashPassword, STORAGE_KEYS } from './config';
import type { AccountBooking } from './account';

export const DEMO_TEST_ACCOUNT = {
  id: 'demo-user-test',
  email: 'demo@suzuki.local',
  password: 'Demo1234',
  phone: '+447000900123',
  firstName: 'James',
  lastName: 'Smith',
  vehicleIdentifierType: 'VIN',
  vehicleIdentifier: 'JS2ZC63S004123456',
  dealerId: 'name-name-london',
  dealerName: 'Name name',
} as const;

type DemoUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  vehicleIdentifierType?: 'VIN' | 'CHASSIS' | null;
  vehicleIdentifier?: string | null;
  dealerId?: string | null;
  dealerName?: string | null;
};

function sampleBookings(): AccountBooking[] {
  const inOneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'demo-booking-1',
      type: 'TEST_DRIVE',
      status: 'CONFIRMED',
      scheduledAt: inOneWeek,
      customerName: 'James Smith',
      customerPhone: DEMO_TEST_ACCOUNT.phone,
      customerEmail: DEMO_TEST_ACCOUNT.email,
      notes: 'Interested in Vitara GLX trim',
      carName: 'Vitara',
      carSlug: 'vitara',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-booking-2',
      type: 'SERVICE',
      status: 'PENDING',
      scheduledAt: inTwoWeeks,
      customerName: 'James Smith',
      customerPhone: DEMO_TEST_ACCOUNT.phone,
      customerEmail: DEMO_TEST_ACCOUNT.email,
      notes: 'Annual service',
      carName: null,
      carSlug: null,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function ensureDemoTestAccount(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_USE_DEMO_DATA !== 'true') return;

  void (async () => {
    let users: DemoUserRecord[] = [];

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.demoUsers);
      users = raw ? (JSON.parse(raw) as DemoUserRecord[]) : [];
    } catch {
      users = [];
    }

    const passwordHash = await hashPassword(DEMO_TEST_ACCOUNT.password);

    const testUser: DemoUserRecord = {
      id: DEMO_TEST_ACCOUNT.id,
      email: DEMO_TEST_ACCOUNT.email,
      passwordHash,
      phone: DEMO_TEST_ACCOUNT.phone,
      firstName: DEMO_TEST_ACCOUNT.firstName,
      lastName: DEMO_TEST_ACCOUNT.lastName,
      vehicleIdentifierType: DEMO_TEST_ACCOUNT.vehicleIdentifierType,
      vehicleIdentifier: DEMO_TEST_ACCOUNT.vehicleIdentifier,
      dealerId: DEMO_TEST_ACCOUNT.dealerId,
      dealerName: DEMO_TEST_ACCOUNT.dealerName,
    };

    const existingIndex = users.findIndex((user) => user.id === DEMO_TEST_ACCOUNT.id);

    if (existingIndex === -1) {
      users.push(testUser);
    } else {
      users[existingIndex] = testUser;
    }

    localStorage.setItem(STORAGE_KEYS.demoUsers, JSON.stringify(users));

    let allBookings: Record<string, AccountBooking[]> = {};

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.demoBookings);
      allBookings = raw ? (JSON.parse(raw) as Record<string, AccountBooking[]>) : {};
    } catch {
      allBookings = {};
    }

    if (!allBookings[DEMO_TEST_ACCOUNT.id]?.length) {
      allBookings[DEMO_TEST_ACCOUNT.id] = sampleBookings();
      localStorage.setItem(STORAGE_KEYS.demoBookings, JSON.stringify(allBookings));
    }
  })();
}
