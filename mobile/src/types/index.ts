// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

// Place types
export interface Place {
  id: number;
  userId: number;
  name: string;
  description?: string;
  category?: string;
  latitude: number;
  longitude: number;
  address?: string;
  rating?: number;
  notes?: string;
  favoriteFood?: string;
  favoriteDrink?: string;
  createdAt: string;
  updatedAt: string;
  photos?: Photo[];
  user?: User; // For displaying who saved the place
}

// Photo types
export interface Photo {
  id: number;
  placeId: number;
  url: string;
  uploadedAt: string;
}

// Friend types
export interface Friend {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Map types
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
