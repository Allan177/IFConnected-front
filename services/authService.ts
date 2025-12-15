// src/services/authService.ts

// --- MUDANÇA AQUI: Trocar httpClient por request ---
import { request } from "./apiClient";
import { User, LoginRequest, RegisterRequest } from "@/types";

export const authService = {
  // Chamadas usando 'request'
  login: (data: LoginRequest) =>
    request<User>("/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: RegisterRequest) =>
    request<User>("/users", { method: "POST", body: JSON.stringify(data) }),
  getMe: (id: number) => request<User>(`/users/${id}`),
};
