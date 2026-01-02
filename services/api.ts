// src/services/api.ts

import { authService } from "./authService";
import { postService } from "./postService";
import {
  User,
  LoginRequest,
  RegisterRequest,
  Post,
  Event,
  CreateEventRequest,
} from "@/types";
import { request } from "./apiClient";

// Interface para o body do comentário (Front-end)
interface NewComment {
  postId: string | number; // <--- MUDANÇA
  userId: number;
  content: string;
}

export interface Campus {
  id: number;
  name: string;
}

export const api = {
  // --- Auth ---
  login: (data: LoginRequest) => authService.login(data),
  register: (data: RegisterRequest) => authService.register(data),
  getMe: (id: number) => authService.getMe(id),

  getAllCampuses: () => request<Campus[]>("/campus"),

  // PUT /api/users/{id}
  updateUser: (user: User) =>
    request<User>(`/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  // POST /api/users/{id}/photo
  uploadProfilePicture: (userId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<User>(`/users/${userId}/photo`, {
      method: "POST",
      body: formData,
    });
  },

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

  createEvent: (data: CreateEventRequest) =>
    request<Event>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // GET /api/events/campus/{campusId}
  getEventsByCampus: (campusId: number) =>
    request<Event[]>(`/events/campus/${campusId}`),

  // POST /api/events/{id}/join?userId=...
  joinEvent: (eventId: number, userId: number) =>
    request<void>(`/events/${eventId}/join?userId=${userId}`, {
      method: "POST",
    }),

  // POST /api/events/{id}/leave?userId=...
  leaveEvent: (eventId: number, userId: number) =>
    request<void>(`/events/${eventId}/leave?userId=${userId}`, {
      method: "POST",
    }),

  updateEvent: (id: number, data: Partial<CreateEventRequest>) =>
    request<Event>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE /api/events/{id}
  deleteEvent: (id: number) =>
    request<void>(`/events/${id}`, {
      method: "DELETE",
    }),
};