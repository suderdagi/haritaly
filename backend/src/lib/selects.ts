/** Public user fields. Never include `password` in API responses. */
export const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profilePicture: true,
  bio: true,
} as const;
