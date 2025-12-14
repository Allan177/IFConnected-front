// src/services/authService.ts

import { httpClient } from "./apiClient";
import { User, LoginRequest, RegisterRequest } from "@/types";

export const authService = {
  // POST /api/login
  login: (data: LoginRequest) =>
    httpClient<User>("/login", { method: "POST", body: JSON.stringify(data) }),

  // POST /api/users
  register: (data: RegisterRequest) =>
    httpClient<User>("/users", { method: "POST", body: JSON.stringify(data) }),

  // GET /api/users/{id}
  getMe: (id: number) => httpClient<User>(`/users/${id}`),
};
