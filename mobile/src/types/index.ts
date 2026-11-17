export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  createdAt?: string;
  _count?: { places: number };
}

export interface Photo {
  id: number;
  placeId: number;
  url: string;
  uploadedAt: string;
}

export interface Place {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  category?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  rating?: number | null;
  notes?: string | null;
  favoriteFood?: string | null;
  favoriteDrink?: string | null;
  createdAt: string;
  updatedAt: string;
  photos?: Photo[];
  user?: User;
  /** Meters from the search center, only set by the nearby endpoint */
  distance?: number;
  isFavorite?: boolean;
}

export type PlaceInput = {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
  address?: string;
  rating?: number;
  notes?: string;
  favoriteFood?: string;
  favoriteDrink?: string;
};

export interface Friend extends User {
  friendshipId: number;
  since: string;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  sender: User;
}

export type Relation = 'FRIEND' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'NONE';

export interface UserSearchResult extends User {
  relation: Relation;
}

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
  firstName?: string;
  lastName?: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const displayName = (user: Pick<User, 'firstName' | 'lastName' | 'email'>) =>
  [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

export const initials = (user: Pick<User, 'firstName' | 'lastName' | 'email'>) =>
  ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') || user.email[0]).toUpperCase();
