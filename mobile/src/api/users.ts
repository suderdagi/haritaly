import { api } from './client';
import { User } from '@/src/types';

export const usersAPI = {
  getProfile: () => api.get<User>('/users/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string; bio?: string }) =>
    api.put<User>('/users/profile', data),
};
