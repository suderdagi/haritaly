import { apiClient } from './client';
import { Place, Photo, ApiResponse } from '@/src/types';

export const placesAPI = {
  // Get user's saved places
  async getMyPlaces() {
    const response = await apiClient.get('/places');
    let places = [];
    if (Array.isArray(response.data)) {
      places = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      places = response.data.data;
    }
    console.log('[placesAPI.getMyPlaces] Final places array:', places);
    return places;
  },

  // Get nearby places saved by friends
  // radius is in meters
  async getNearbyPlaces(latitude: number, longitude: number, radius: number = 5000) {
    const response = await apiClient.get<ApiResponse<Place[]>>(
      `/places/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
    return response.data.data || [];
  },

  // Get place details
  async getPlaceDetails(placeId: number) {
    const response = await apiClient.get<ApiResponse<Place>>(`/places/${placeId}`);
    return response.data.data;
  },

  // Search places
  async searchPlaces(query: string) {
    const response = await apiClient.get<ApiResponse<Place[]>>(`/places/search?q=${query}`);
    return response.data.data || [];
  },

  // Create new place
  async createPlace(data: {
    name: string;
    latitude: number;
    longitude: number;
    description?: string;
    category?: string;
    address?: string;
    favoriteFood?: string;
    favoriteDrink?: string;
    rating?: number;
    notes?: string;
  }) {
    const response = await apiClient.post<ApiResponse<Place>>('/places', data);
    return response.data.data;
  },

  // Update place
  async updatePlace(
    placeId: number,
    data: {
      name?: string;
      description?: string;
      category?: string;
      address?: string;
      rating?: number;
      notes?: string;
      favoriteFood?: string;
      favoriteDrink?: string;
    }
  ) {
    const response = await apiClient.put<ApiResponse<Place>>(`/places/${placeId}`, data);
    return response.data.data;
  },

  // Delete place
  async deletePlace(placeId: number) {
    await apiClient.delete(`/places/${placeId}`);
  },

  // Upload photos for a place
  async uploadPhotos(placeId: number, photos: File[]) {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append('photos', photo);
    });

    const response = await apiClient.post<ApiResponse<any>>(`/places/${placeId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Get photos for a place
  async getPlacePhotos(placeId: number) {
    const response = await apiClient.get<ApiResponse<Photo[]>>(`/places/${placeId}/photos`);
    return response.data.data || [];
  },
};
