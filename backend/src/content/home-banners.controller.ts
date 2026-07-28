import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('content')
@Controller('home-banners')
export class HomeBannersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.homeBanner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        linkUrl: true,
        linkLabel: true,
        imageDesktop: true,
        imageMobile: true,
        sortOrder: true,
      },
    });
  }
}
