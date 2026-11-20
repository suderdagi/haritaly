/**
 * Unit tests for photo storage: which backend is chosen, and that files are cleaned up.
 * The Vercel Blob SDK is mocked, so no network or Vercel account is needed.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string) => ({ url: `https://store.public.blob.vercel-storage.com/${pathname}` })),
  del: vi.fn(async () => undefined),
}));

const { put, del } = await import('@vercel/blob');
const { savePhoto, deletePhotoFiles } = await import('@/src/lib/storage');

const photo = () => new File([new Uint8Array([1, 2, 3])], 'cafe.jpg', { type: 'image/jpeg' });

afterEach(() => {
  delete process.env.BLOB_STORE_ID;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  vi.clearAllMocks();
});

describe('savePhoto', () => {
  it('uses Vercel Blob when the store is connected with BLOB_STORE_ID (OIDC)', async () => {
    process.env.BLOB_STORE_ID = 'store_123';

    const url = await savePhoto(photo());

    expect(put).toHaveBeenCalledOnce();
    expect(url).toMatch(/^https:\/\/.+\/photos\/[0-9a-f-]{36}\.jpg$/);
  });

  it('uses Vercel Blob when a read-write token is set', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test';

    await savePhoto(photo());

    expect(put).toHaveBeenCalledOnce();
  });

  it('falls back to local disk when no store is connected', async () => {
    const url = await savePhoto(photo());

    expect(put).not.toHaveBeenCalled();
    expect(url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.jpg$/);
    await deletePhotoFiles([url]);
  });
});

describe('deletePhotoFiles', () => {
  it('deletes Blob files and ignores local files that are already gone', async () => {
    process.env.BLOB_STORE_ID = 'store_123';
    const blobUrl = 'https://store.public.blob.vercel-storage.com/photos/a.jpg';

    await deletePhotoFiles([blobUrl, '/uploads/missing.jpg']);

    expect(del).toHaveBeenCalledWith([blobUrl]);
  });
});
