import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  listStaff() {
    return this.prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.CONTENT_MANAGER, Role.DEALER_MANAGER] },
      },
      orderBy: [{ role: 'asc' }, { email: 'asc' }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });
  }
}
