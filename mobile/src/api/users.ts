import { api } from './client';
import { BlockedUser, User } from '@/src/types';

export const usersAPI = {
  getProfile: () => api.get<User>('/users/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string; bio?: string }) =>
    api.put<User>('/users/profile', data),

  /** Permanently deletes the account. The password is checked again on the server. */
  deleteAccount: (password: string) => api.delete('/users/profile', undefined, { password }),

  block: (userId: number) => api.post(`/users/${userId}/block`),
  unblock: (userId: number) => api.delete(`/users/${userId}/block`),
  getBlocked: () => api.get<BlockedUser[]>('/users/blocked'),
};
