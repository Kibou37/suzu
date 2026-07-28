import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bookings = await prisma.booking.findMany({
  orderBy: { createdAt: 'desc' },
  take: 30,
  select: {
    id: true,
    type: true,
    status: true,
    customerName: true,
    customerEmail: true,
    notes: true,
    scheduledAt: true,
  },
});

const slots = await prisma.serviceSlot.findMany({
  orderBy: { startsAt: 'desc' },
  take: 20,
});

const bookingCounts = await prisma.booking.groupBy({
  by: ['type', 'status'],
  _count: true,
});

console.log('BOOKING counts:', bookingCounts);
console.log('BOOKINGS:', bookings);
console.log('SLOTS count:', slots.length);
console.log('SLOTS sample:', slots.slice(0, 10));

await prisma.$disconnect();
