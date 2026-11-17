import { api } from './client';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/src/types';

export const authAPI = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
};
