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
  Project,
} from "@/types";
import { request } from "./apiClient";

interface NewComment {
  postId: string | number;
  userId: number;
  content: string;
}

export interface Campus {
  id: number;
  name: string;
}

export const api = {
  login: (data: LoginRequest) => authService.login(data),
  register: (data: RegisterRequest) => authService.register(data),
  getMe: (id: number) => authService.getMe(id),

  getAllCampuses: () => request<Campus[]>("/campus"),

  updateUser: (user: User) =>
    request<User>(`/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  uploadProfilePicture: (userId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<User>(`/users/${userId}/photo`, {
      method: "POST",
      body: formData,
    });
  },

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

  addComment: (data: NewComment) =>
    request<any>(`/posts/${data.postId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        userId: data.userId,
        text: data.content,
      }),
    }),

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

  getEventsByCampus: (campusId: number) =>
    request<Event[]>(`/events/campus/${campusId}`),

  joinEvent: (eventId: number, userId: number) =>
    request<void>(`/events/${eventId}/join?userId=${userId}`, {
      method: "POST",
    }),

  leaveEvent: (eventId: number, userId: number) =>
    request<void>(`/events/${eventId}/leave?userId=${userId}`, {
      method: "POST",
    }),

  updateEvent: (id: number, data: Partial<CreateEventRequest>) =>
    request<Event>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteEvent: (id: number) =>
    request<void>(`/events/${id}`, {
      method: "DELETE",
    }),

    // --- PROJETOS ---
  getUserProjects: (userId: number) => 
    request<Project[]>(`/users/${userId}/projects`),

  createProject: (formData: FormData) => 
    request<Project>("/projects", {
      method: "POST",
      body: formData
    }),

  deleteProject: (id: number) => 
    request<void>(`/projects/${id}`, {
      method: "DELETE"
    }),

    // PUT /api/projects/{id}
  updateProject: (id: number, formData: FormData) => 
    request<Project>(`/projects/${id}`, {
      method: "PUT",
      body: formData
    }),



     loginGoogle: (token: string) => 
      request<{ token: string }>("/auth/google", { 
          method: "POST", 
          body: JSON.stringify({ token }) 
      }),
  // ...
};

