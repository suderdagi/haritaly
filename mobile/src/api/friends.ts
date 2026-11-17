import { api } from './client';
import { Friend, FriendRequest, UserSearchResult } from '@/src/types';

export const friendsAPI = {
  list: () => api.get<Friend[]>('/friends'),
  incomingRequests: () => api.get<FriendRequest[]>('/friends/requests'),
  sendRequest: (receiverId: number) => api.post('/friends', { receiverId }),
  accept: (requestId: number) => api.post(`/friends/${requestId}/accept`),
  reject: (requestId: number) => api.post(`/friends/${requestId}/reject`),
  remove: (friendId: number) => api.delete('/friends', { friendId }),
  searchUsers: (q: string) => api.get<UserSearchResult[]>('/users/search', { q }),
};
