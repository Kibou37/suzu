import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class AdminFaqService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.fAQ.findMany({
      orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }],
    });
  }

  async getOne(id: string) {
    const item = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('FAQ not found');
    }
    return item;
  }

  create(input: CreateFaqDto) {
    return this.prisma.fAQ.create({
      data: {
        question: input.question.trim(),
        answer: input.answer.trim(),
        category: input.category?.trim() || null,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, input: UpdateFaqDto) {
    await this.ensureExists(id);
    return this.prisma.fAQ.update({
      where: { id },
      data: {
        ...(input.question !== undefined
          ? { question: input.question.trim() }
          : {}),
        ...(input.answer !== undefined ? { answer: input.answer.trim() } : {}),
        ...(input.category !== undefined
          ? { category: input.category.trim() || null }
          : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.fAQ.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('FAQ not found');
    }
  }
}
