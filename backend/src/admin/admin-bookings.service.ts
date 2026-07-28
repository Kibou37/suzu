import { Injectable, NotFoundException } from '@nestjs/common';
import type { BookingStatus, BookingType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AdminBookingsFilter = {
  type?: BookingType;
  status?: BookingStatus;
};

@Injectable()
export class AdminBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  list(filter: AdminBookingsFilter) {
    return this.prisma.booking.findMany({
      where: {
        ...(filter.type ? { type: filter.type } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: [{ scheduledAt: 'desc' }],
      include: {
        car: { select: { name: true, slug: true } },
      },
    });
  }

  async updateStatus(id: string, status: BookingStatus) {
    const existing = await this.prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status },
      include: { car: { select: { name: true, slug: true } } },
    });
  }
}
