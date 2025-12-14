// src/types/index.ts

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  campusId?: number;
}

export interface Post {
  id: number | string;
  userId: number;
  content: string;
  imageUrl?: string;
  comments?: any[];
  likes?: number[];
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  username?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
}
