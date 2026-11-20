import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { del, put } from '@vercel/blob';
import { ValidationError } from './errors';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Where photos are stored:
 * - Vercel Blob when a Blob store is connected to the project (production). Vercel's file system
 *   is read-only and reset on every deployment, so files can't be kept on disk there.
 *   Newer stores are connected with BLOB_STORE_ID and the SDK signs in with the deployment's
 *   OIDC token; older ones get a BLOB_READ_WRITE_TOKEN. The SDK handles both.
 * - public/uploads on local disk otherwise (development and tests).
 */
const useBlobStorage = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

export function validatePhoto(file: File) {
  if (!EXTENSIONS[file.type]) {
    throw new ValidationError('Only JPEG, PNG, WEBP or HEIC images are allowed');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new ValidationError('Each photo must be smaller than 5 MB');
  }
}

/**
 * Stores the photo and returns its URL: an absolute Blob URL, or `/uploads/<file>` on local disk.
 * Files are renamed with a random UUID, so user-supplied file names are never used
 * and the URL can't be guessed.
 */
export async function savePhoto(file: File): Promise<string> {
  const fileName = `${randomUUID()}.${EXTENSIONS[file.type]}`;

  if (useBlobStorage()) {
    // The Blob store has to be created with "Public" access (see README)
    const blob = await put(`photos/${fileName}`, file, { access: 'public', contentType: file.type });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${fileName}`;
}

/**
 * Deletes stored photo files after their database rows are gone.
 * Errors are logged instead of thrown: a leftover file must never block deleting a place or an account.
 */
export async function deletePhotoFiles(urls: string[]): Promise<void> {
  const blobUrls = urls.filter((url) => /^https?:\/\//.test(url));
  const localFiles = urls
    .filter((url) => url.startsWith('/uploads/'))
    // basename() keeps the path inside UPLOAD_DIR even if a stored value were tampered with
    .map((url) => path.join(UPLOAD_DIR, path.basename(url)));

  try {
    if (blobUrls.length > 0 && useBlobStorage()) {
      await del(blobUrls);
    }
    await Promise.all(localFiles.map((file) => unlink(file).catch(() => undefined)));
  } catch (error) {
    console.error('Could not delete photo files', error);
  }
}
