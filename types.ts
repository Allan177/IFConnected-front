export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Comment {
  id?: number;
  userId: number;
  text: string;
  // Optional: Backend might return username if we expanded the DTO, 
  // otherwise we just show userId or generic avatar
  username?: string; 
}

export interface Post {
  id: number;
  userId: number; // The author ID
  content: string;
  imageUrl?: string;
  comments: Comment[];
  createdAt?: string; // Optional if backend sends it
}

export interface LoginRequest {
  username: string;
  email: string;
}

export interface CreateCommentRequest {
  userId: number;
  text: string;
}