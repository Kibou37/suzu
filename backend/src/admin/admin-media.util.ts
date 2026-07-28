import { mkdirSync } from 'fs';
import { join } from 'path';
import { MEDIA_FOLDERS, type MediaFolder } from './admin-media.service';

export function resolveMediaFolder(value: string | undefined): MediaFolder {
  if (value && MEDIA_FOLDERS.includes(value as MediaFolder)) {
    return value as MediaFolder;
  }
  return 'cars';
}

export function ensureUploadDir(folder: MediaFolder): string {
  const dir = join(process.cwd(), 'uploads', folder);
  mkdirSync(dir, { recursive: true });
  return dir;
}
