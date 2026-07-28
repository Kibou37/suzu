import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('content')
@Controller('faq')
export class FaqController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.fAQ.findMany({
      orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }],
    });
  }
}
