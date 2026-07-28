import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

export const MEDIA_FOLDERS = ['cars', 'blog', 'promotions', 'banners'] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class AdminMediaService {
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {}

  ensureFolder(folder: MediaFolder): string {
    const dir = join(this.uploadsRoot, folder);
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  assertFolder(folder: string): MediaFolder {
    if (!MEDIA_FOLDERS.includes(folder as MediaFolder)) {
      throw new BadRequestException('Invalid upload folder');
    }
    return folder as MediaFolder;
  }

  assertFile(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, and WebP images are allowed',
      );
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }
    return file;
  }

  toPublicUrl(folder: MediaFolder, filename: string): string {
    return `/uploads/${folder}/${filename}`;
  }

  async registerUpload(input: {
    folder: MediaFolder;
    filename: string;
    originalName?: string;
    mimeType: string;
    size: number;
  }) {
    const url = this.toPublicUrl(input.folder, input.filename);
    return this.prisma.mediaAsset.create({
      data: {
        url,
        filename: input.filename,
        originalName: input.originalName?.trim() || null,
        folder: input.folder,
        mimeType: input.mimeType,
        size: input.size,
      },
    });
  }

  list(folder?: string) {
    const resolved = folder ? this.assertFolder(folder) : undefined;
    return this.prisma.mediaAsset.findMany({
      where: resolved ? { folder: resolved } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    const usage = await this.findUsage(asset.url);
    const absolutePath = join(this.uploadsRoot, asset.folder, asset.filename);

    if (existsSync(absolutePath)) {
      try {
        unlinkSync(absolutePath);
      } catch {
        // Keep DB cleanup even if file is already missing / locked.
      }
    }

    await this.prisma.mediaAsset.delete({ where: { id } });
    return {
      deleted: true,
      warning:
        usage.length > 0
          ? `File deleted, but it may still be referenced by: ${usage.join(', ')}`
          : null,
    };
  }

  private async findUsage(url: string): Promise<string[]> {
    const usage: string[] = [];

    const [banners, blog, promotions, cars] = await Promise.all([
      this.prisma.homeBanner.count({
        where: { OR: [{ imageDesktop: url }, { imageMobile: url }] },
      }),
      this.prisma.blogPost.count({ where: { coverImage: url } }),
      this.prisma.promotion.count({ where: { image: url } }),
      this.prisma.car.findMany({
        select: { id: true, name: true, images: true },
      }),
    ]);

    if (banners > 0) usage.push(`homepage banners (${banners})`);
    if (blog > 0) usage.push(`blog posts (${blog})`);
    if (promotions > 0) usage.push(`promotions (${promotions})`);

    const carsUsing = cars.filter((car) => {
      if (!Array.isArray(car.images)) return false;
      return car.images.some((item) => item === url);
    });
    if (carsUsing.length > 0) {
      usage.push(`cars (${carsUsing.length})`);
    }

    return usage;
  }
}
