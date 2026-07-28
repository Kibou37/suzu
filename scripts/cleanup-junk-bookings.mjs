/**
 * Remove dev/smoke test bookings and seeded slot rows cluttering admin.
 * Run: node scripts/cleanup-junk-bookings.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const smokeBookings = await prisma.booking.deleteMany({
  where: {
    OR: [
      { customerName: 'Smoke Tester' },
      { customerEmail: 'smoke@example.com' },
      { notes: { contains: 'smoke booking' } },
      { notes: { contains: 'Smoke booking' } },
      { notes: { contains: 'phase3 smoke' } },
      { notes: { contains: 'e19 admin smoke' } },
    ],
  },
});

const slots = await prisma.serviceSlot.deleteMany();

console.log(`Removed ${smokeBookings.count} smoke/test bookings`);
console.log(`Removed ${slots.count} seeded service slot rows`);

await prisma.$disconnect();
