import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

// Auth
export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
});

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
  bio: z.string().trim().max(300).optional(),
  profilePicture: z.string().url().optional(),
});

// Places
export const PLACE_CATEGORIES = [
  'Restaurant',
  'Cafe',
  'Bar',
  'Park',
  'Museum',
  'Shop',
  'Hotel',
  'Attraction',
  'Other',
] as const;

export const CreatePlaceSchema = z.object({
  name: z.string().trim().min(1, 'Place name is required').max(100),
  description: optionalText(500),
  category: z.enum(PLACE_CATEGORIES).optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: optionalText(200),
  // Places have no ratings: Haritaly only holds places people love. A rating sent by an older client is dropped.
  notes: optionalText(1000),
  favoriteFood: optionalText(100),
  favoriteDrink: optionalText(100),
  isPrivate: z.boolean().optional(),
});

export const UpdatePlaceSchema = CreatePlaceSchema.partial();

export const NearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50_000).default(5000),
  category: z.enum(PLACE_CATEGORIES).optional(),
});

// Friends
export const FriendRequestSchema = z.object({
  receiverId: z.number().int().positive('receiverId is required'),
});

// Account
export const DeleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// Reports
export const REPORT_REASONS = ['INAPPROPRIATE', 'SPAM', 'OTHER'] as const;

export const ReportPlaceSchema = z.object({
  reason: z.enum(REPORT_REASONS),
  details: optionalText(500),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreatePlaceInput = z.infer<typeof CreatePlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof UpdatePlaceSchema>;
export type ReportPlaceInput = z.infer<typeof ReportPlaceSchema>;
