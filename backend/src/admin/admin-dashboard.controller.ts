import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingStatus, BookingType, QuoteStatus } from '@prisma/client';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('admin')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
export class AdminDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getSummary() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [
      cars,
      faqs,
      blogPosts,
      promotions,
      bookings,
      quoteRequests,
      pendingQuotes,
      quotesToday,
      upcomingTestDrives,
      activePromotions,
      pendingBookings,
      homeBanners,
    ] = await Promise.all([
      this.prisma.car.count(),
      this.prisma.fAQ.count(),
      this.prisma.blogPost.count(),
      this.prisma.promotion.count(),
      this.prisma.booking.count(),
      this.prisma.quoteRequest.count(),
      this.prisma.quoteRequest.count({
        where: { status: QuoteStatus.PENDING },
      }),
      this.prisma.quoteRequest.count({
        where: { createdAt: { gte: startOfToday, lte: endOfToday } },
      }),
      this.prisma.booking.count({
        where: {
          type: BookingType.TEST_DRIVE,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          scheduledAt: { gte: now, lte: inSevenDays },
        },
      }),
      this.prisma.promotion.count({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
      }),
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      this.prisma.homeBanner.count({ where: { isActive: true } }),
    ]);

    return {
      cars,
      faqs,
      blogPosts,
      promotions,
      bookings,
      quoteRequests,
      pendingQuotes,
      quotesToday,
      upcomingTestDrives,
      activePromotions,
      pendingBookings,
      homeBanners,
    };
  }
}
