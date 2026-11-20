import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { PhotoUpload } from '@/src/api/places';

// Phone photos are often several megabytes. Shrinking them before upload keeps every request well
// under the server's 4.5 MB body limit on Vercel, saves mobile data and makes them load faster for friends.
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.7;

/** Resizes the photo (keeping its aspect ratio) and re-encodes it as JPEG, which also converts HEIC. */
export async function preparePhoto(asset: ImagePickerAsset, index: number): Promise<PhotoUpload> {
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_SIDE) {
    context.resize(asset.width >= asset.height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }

  const image = await context.renderAsync();
  try {
    const result = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
    return { uri: result.uri, type: 'image/jpeg', name: `photo-${index + 1}.jpg` };
  } finally {
    // Free the native image memory right away instead of waiting for garbage collection
    image.release();
    context.release();
  }
}
