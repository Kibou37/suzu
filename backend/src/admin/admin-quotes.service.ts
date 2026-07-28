import { Injectable, NotFoundException } from '@nestjs/common';
import type { QuoteStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminQuotesService {
  constructor(private readonly prisma: PrismaService) {}

  list(status?: QuoteStatus) {
    return this.prisma.quoteRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async updateStatus(id: string, status: QuoteStatus) {
    const existing = await this.prisma.quoteRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Quote request not found');
    }

    return this.prisma.quoteRequest.update({
      where: { id },
      data: { status },
    });
  }
}
