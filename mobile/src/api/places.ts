import { api } from './client';
import { Photo, Place, PlaceInput, PlaceSummary, ReportReason } from '@/src/types';

export interface PhotoUpload {
  uri: string;
  name: string;
  type: string;
}

export const placesAPI = {
  getMyPlaces: () => api.get<Place[]>('/places'),

  /** Friends' places within `radius` meters, sorted by distance. */
  getNearbyPlaces: (lat: number, lng: number, radius = 5000) =>
    api.get<Place[]>('/places/nearby', { lat, lng, radius }),

  getPlaceDetails: (placeId: number) => api.get<Place>(`/places/${placeId}`),

  /** AI summary of what you and your friends saved about this place. The model can be slow. */
  getPlaceSummary: (placeId: number) =>
    api.get<PlaceSummary>(`/places/${placeId}/summary`, undefined, { timeout: 30000 }),

  searchPlaces: (q: string) => api.get<Place[]>('/places/search', { q }),

  createPlace: (data: PlaceInput) => api.post<Place>('/places', data),

  updatePlace: (placeId: number, data: Partial<PlaceInput>) => api.put<Place>(`/places/${placeId}`, data),

  deletePlace: (placeId: number) => api.delete(`/places/${placeId}`),

  /** Report a friend's place as objectionable. Reports are reviewed by hand. */
  reportPlace: (placeId: number, reason: ReportReason) =>
    api.post(`/places/${placeId}/report`, { reason }),

  uploadPhotos(placeId: number, photos: PhotoUpload[]) {
    const formData = new FormData();
    // React Native's FormData accepts { uri, name, type } objects for files
    photos.forEach((photo) => formData.append('photos', photo as unknown as Blob));

    return api.post<Photo[]>(`/places/${placeId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },

  getPlacePhotos: (placeId: number) => api.get<Photo[]>(`/places/${placeId}/photos`),

  getFavorites: () => api.get<Place[]>('/favorites'),
  addFavorite: (placeId: number) => api.post(`/places/${placeId}/favorite`),
  removeFavorite: (placeId: number) => api.delete(`/places/${placeId}/favorite`),
};
