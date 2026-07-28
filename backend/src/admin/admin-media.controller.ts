import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { AdminRolesGuard } from '../auth/admin-roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminMediaService } from './admin-media.service';
import { CONTENT_READ_ROLES, CONTENT_WRITE_ROLES } from './admin-permissions';
import { ensureUploadDir, resolveMediaFolder } from './admin-media.util';

@ApiTags('admin')
@Controller('admin/media')
@UseGuards(JwtAuthGuard, AdminRolesGuard)
export class AdminMediaController {
  constructor(private readonly mediaService: AdminMediaService) {}

  @Get()
  @Roles(...CONTENT_READ_ROLES)
  list(@Query('folder') folder?: string) {
    return this.mediaService.list(folder);
  }

  @Post('upload')
  @Roles(...CONTENT_WRITE_ROLES)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
      fileFilter: (_req, file, callback) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only JPG, PNG, and WebP images are allowed',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
      storage: diskStorage({
        destination: (req, _file, callback) => {
          const folder = resolveMediaFolder(
            typeof req.query.folder === 'string' ? req.query.folder : undefined,
          );
          callback(null, ensureUploadDir(folder));
        },
        filename: (_req, file, callback) => {
          const ext = extname(file.originalname).toLowerCase() || '.jpg';
          callback(null, `${randomUUID()}${ext}`);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folderParam?: string,
  ) {
    const folder = this.mediaService.assertFolder(
      resolveMediaFolder(folderParam),
    );
    const saved = this.mediaService.assertFile(file);
    const asset = await this.mediaService.registerUpload({
      folder,
      filename: saved.filename,
      originalName: saved.originalname,
      mimeType: saved.mimetype,
      size: saved.size,
    });

    return {
      id: asset.id,
      url: asset.url,
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.size,
      folder: asset.folder,
    };
  }

  @Delete(':id')
  @Roles(...CONTENT_WRITE_ROLES)
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
