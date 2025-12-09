export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string; // Novo: Texto da biografia
  profileImageUrl?: string; // Novo: URL da foto no MinIO
}

export interface Comment {
  id: number;
  userId: number;
  text: string;
  username?: string; // Opcional: Para facilitar a exibição no front
  postedAt?: string; // Data do comentário
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string; // URL da imagem do post no MinIO
  createdAt?: string; // Data em formato ISO
  comments?: Comment[]; // Lista de comentários
  likes?: number[]; // Novo: Lista de IDs dos usuários que curtiram
}

// --- DTOs (Objetos para envio de dados) ---

export interface LoginRequest {
  username: string;
  email: string;
}

export interface CreateCommentRequest {
  userId: number;
  text: string;
}
