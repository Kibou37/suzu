import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, BookingType } from '@prisma/client';
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

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.type !== BookingType.TEST_DRIVE) {
      throw new BadRequestException(
        'Only test drive bookings can be cancelled here',
      );
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException('This booking cannot be cancelled');
    }

    if (booking.scheduledAt <= new Date()) {
      throw new BadRequestException('Past bookings cannot be cancelled online');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
      include: {
        car: {
          select: { name: true, slug: true },
        },
      },
    });

    return {
      id: updated.id,
      type: updated.type,
      status: updated.status,
      scheduledAt: updated.scheduledAt.toISOString(),
      customerName: updated.customerName,
      customerPhone: updated.customerPhone,
      customerEmail: updated.customerEmail,
      notes: updated.notes,
      carName: updated.car?.name ?? null,
      carSlug: updated.car?.slug ?? null,
      createdAt: updated.createdAt.toISOString(),
    };
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
