import { describe, expect, it } from 'vitest';
import { CreatePlaceSchema, NearbyQuerySchema, RegisterSchema } from '@/src/lib/validators';

describe('RegisterSchema', () => {
  it('normalizes the email', () => {
    const result = RegisterSchema.parse({ email: '  Sude@Example.COM ', password: 'secret123' });
    expect(result.email).toBe('sude@example.com');
  });

  it('rejects short passwords', () => {
    expect(RegisterSchema.safeParse({ email: 'a@b.com', password: '123' }).success).toBe(false);
  });
});

describe('CreatePlaceSchema', () => {
  const valid = { name: 'Moda Sahili', latitude: 40.98, longitude: 29.02 };

  it('accepts a minimal place', () => {
    expect(CreatePlaceSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid coordinates', () => {
    expect(CreatePlaceSchema.safeParse({ ...valid, latitude: 120 }).success).toBe(false);
  });

  it('rejects unknown categories and ratings above 5', () => {
    expect(CreatePlaceSchema.safeParse({ ...valid, category: 'Spaceship' }).success).toBe(false);
    expect(CreatePlaceSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
  });
});

describe('NearbyQuerySchema', () => {
  it('parses query string values and applies the default radius', () => {
    const q = NearbyQuerySchema.parse({ lat: '41.03', lng: '28.98' });
    expect(q).toMatchObject({ lat: 41.03, lng: 28.98, radius: 5000 });
  });
});
