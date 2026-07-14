import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getBookings(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        car: {
          select: { name: true, slug: true },
        },
      },
    });

    return bookings.map((booking) => ({
      id: booking.id,
      type: booking.type,
      status: booking.status,
      scheduledAt: booking.scheduledAt.toISOString(),
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      notes: booking.notes,
      carName: booking.car?.name ?? null,
      carSlug: booking.car?.slug ?? null,
      createdAt: booking.createdAt.toISOString(),
    }));
  }

  async updateProfile(userId: string, input: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: input.phone?.trim() || undefined,
        firstName: input.firstName?.trim() || undefined,
        lastName: input.lastName?.trim() || undefined,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        vehicleIdentifierType: true,
        vehicleIdentifier: true,
        dealerId: true,
        dealerName: true,
      },
    });
  }
}
