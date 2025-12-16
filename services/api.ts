// src/services/api.ts

import { authService } from "./authService";
import { postService } from "./postService";
import { User, LoginRequest, RegisterRequest, Post } from "@/types";
import { request } from "./apiClient";

// Interface para o body do comentário (Front-end)
interface NewComment {
  postId: string | number; // <--- MUDANÇA
  userId: number;
  content: string;
}

export const api = {
  // --- Auth ---
  login: (data: LoginRequest) => authService.login(data),
  register: (data: RegisterRequest) => authService.register(data),
  getMe: (id: number) => authService.getMe(id),

  // --- Users & Follow ---
  getUserById: (id: number) => request<User>(`/users/${id}`),
  getUserProfile: (userId: number) => request<any>(`/users/${userId}/profile`),

  isFollowing: (followerId: number, followedId: number) =>
    request<boolean>(`/users/${followerId}/isFollowing/${followedId}`),

  followUser: (followerId: number, followedId: number) =>
    request<void>(`/users/${followerId}/follow/${followedId}`, {
      method: "POST",
    }),

  unfollowUser: (followerId: number, followedId: number) =>
    request<void>(`/users/${followerId}/follow/${followedId}`, {
      method: "DELETE",
    }),

  getSuggestions: (userId: number, radiusKm: number = 50) => {
    return request<User[]>(`/users/${userId}/suggestions?radiusKm=${radiusKm}`);
  },

  // --- Posts & Ações ---
  getAllPosts: () => postService.getAll(),
  getPostsByUser: (userId: number) => postService.getPostsByUser(userId),
  getFriendsFeed: (userId: number) => postService.getFriendsFeed(userId),
  getRegionalFeed: (userId: number, radiusKm?: number) =>
    postService.getRegionalFeed(userId, radiusKm),

  toggleLike: (postId: string | number, userId: number) =>
    request<{ isLiked: boolean; likeCount: number }>(
      `/posts/${postId}/like?userId=${userId}`,
      { method: "POST" }
    ),

  getPostById: (postId: string | number) => request<Post>(`/posts/${postId}`),

  // ❗ CORREÇÃO AQUI
  addComment: (data: NewComment) =>
    request<any>(`/posts/${data.postId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        userId: data.userId,
        text: data.content,
      }),
    }),

  // --- Notificações ---
  getNotifications: (userId: number) =>
    request<any[]>(`/notifications/user/${userId}`),

  getUnreadCount: (userId: number) =>
    request<number>(`/notifications/user/${userId}/count`),

  markNotificationsAsRead: (userId: number) =>
    request<void>(`/notifications/user/${userId}/read`, { method: "PUT" }),
};
