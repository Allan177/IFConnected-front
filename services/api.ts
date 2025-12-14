// src/services/api.ts

import { authService } from "./authService";
import { postService } from "./postService";
import { User, LoginRequest, RegisterRequest } from "@/types";

// Exemplo: O que o frontend chama é api.login()
// O api.ts apenas repassa para o service responsável (authService.login)

export const api = {
  // --- Auth ---
  login: (data: LoginRequest) => authService.login(data),
  register: (data: RegisterRequest) => authService.register(data),
  getMe: (id: number) => authService.getMe(id),

  // --- Posts ---
  getAllPosts: () => postService.getAll(),
  getFriendsFeed: (userId: number) => postService.getFriendsFeed(userId),
  getRegionalFeed: (userId: number, radiusKm?: number) =>
    postService.getRegionalFeed(userId, radiusKm),
  getPostsByUser: (userId: number) => postService.getPostsByUser(userId),

  // --- User Management (Ainda precisa ser criado o service) ---
  // Você precisará de um userService para fazer isso, por enquanto usamos direto no PostCard
  getUserById: (id: number) => authService.getMe(id), // Reutiliza a rota getMe

  // ... adicione outros métodos de user/post que você precisar,
  // como followUser, toggleLike, etc, agrupados em um userService,
  // ou adicionados aqui para simplificar por enquanto.

  // Exemplo de como adicionar a rota follow que o PostCard precisa:
  // followUser: (followerId: number, followedId: number) => httpClient<void>(`/users/${followerId}/follow/${followedId}`, { method: "POST" }),
};
