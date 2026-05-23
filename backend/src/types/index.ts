export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  bio: string | null;
  latitude: string | null;
  longitude: string | null;
  lastLocationUpdate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Place {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  latitude: string;
  longitude: string;
  address: string | null;
  rating: string | null;
  notes: string | null;
  favoriteFood: string | null;
  favoriteDrink: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: number;
  senderId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}
