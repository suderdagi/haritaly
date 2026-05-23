import { z } from 'zod';

// Auth Validators
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password required'),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().url().optional(),
});

// Place Validators
export const CreatePlaceSchema = z.object({
  name: z.string().min(1, 'Place name required'),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional().nullable(),
  rating: z.union([z.number().min(0).max(5), z.null(), z.undefined()]).optional().default(0),
  notes: z.string().optional().nullable(),
  favoriteFood: z.string().optional().nullable(),
  favoriteDrink: z.string().optional().nullable(),
});

export const UpdatePlaceSchema = CreatePlaceSchema.partial();

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreatePlaceInput = z.infer<typeof CreatePlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof UpdatePlaceSchema>;
