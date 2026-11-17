import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { ValidationError } from './errors';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function validatePhoto(file: File) {
  if (!EXTENSIONS[file.type]) {
    throw new ValidationError('Only JPEG, PNG, WEBP or HEIC images are allowed');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new ValidationError('Each photo must be smaller than 5 MB');
  }
}

/**
 * Stores the photo on local disk and returns its public URL.
 * Files are renamed with a random UUID, so user-supplied file names never touch the file system.
 * In production this function is the single place to swap for S3 / Cloudinary.
 */
export async function savePhoto(file: File): Promise<string> {
  const fileName = `${randomUUID()}.${EXTENSIONS[file.type]}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));

  return `/uploads/${fileName}`;
}
