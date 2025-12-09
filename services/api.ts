import { API_BASE_URL } from "../constants";
import {
  LoginRequest,
  User,
  Post,
  CreateCommentRequest,
  Comment,
} from "../types";

// --- DADOS MOCKADOS (PARA MODO DEMO) ---
let MOCK_ID_COUNTER = 100;
const MOCK_USERS: User[] = [
  {
    id: 1,
    username: "demo_user",
    email: "demo@ifconnected.com",
    bio: "Conta de demonstração",
  },
  {
    id: 2,
    username: "maria_dev",
    email: "maria@teste.com",
    bio: "Fullstack Developer",
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: 99,
    userId: 1,
    content:
      "👋 Bem-vindo ao Modo Demo!\n\nSe você está vendo isso, o Frontend interceptou a requisição porque o Backend Java (Porta 8080) não respondeu.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    comments: [],
    likes: [2], // Maria curtiu
    createdAt: new Date().toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- HANDLER DO MOCK ---
async function handleMockRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  console.warn(`[MOCK MODE] Request to ${endpoint} intercepted.`);
  await delay(600);

  // 1. LOGIN / REGISTER
  if (endpoint === "/users" && options.method === "POST") {
    const body = JSON.parse(options.body as string) as LoginRequest;
    const mockId =
      body.username === "demo_user"
        ? 1
        : Math.floor(Math.random() * 10000) + 100;
    const newUser = { id: mockId, username: body.username, email: body.email };
    MOCK_USERS.push(newUser);
    return newUser as T;
  }

  // 2. BUSCAR USUÁRIO POR ID
  if (
    endpoint.match(/\/users\/\d+$/) &&
    (!options.method || options.method === "GET")
  ) {
    const id = parseInt(endpoint.split("/").pop() || "1");
    const user = MOCK_USERS.find((u) => u.id === id) || {
      id,
      username: `User ${id}`,
      email: "mock@test.com",
    };
    return user as T;
  }

  // 3. ATUALIZAR USUÁRIO (PUT)
  if (endpoint.match(/\/users\/\d+$/) && options.method === "PUT") {
    const body = JSON.parse(options.body as string) as User;
    // Retorna o próprio objeto atualizado
    return body as T;
  }

  // 4. UPLOAD DE FOTO (POST)
  if (endpoint.includes("/photo") && options.method === "POST") {
    // Retorna um user fake com foto atualizada
    return {
      id: 1,
      username: "demo",
      profileImageUrl: "https://github.com/shadcn.png",
    } as T;
  }

  // 5. LISTAR POSTS
  if (
    (endpoint === "/posts" || endpoint.startsWith("/posts/")) &&
    (!options.method || options.method === "GET")
  ) {
    return [...MOCK_POSTS].sort((a, b) => b.id - a.id) as unknown as T;
  }

  // 6. CRIAR POST
  if (endpoint === "/posts" && options.method === "POST") {
    const formData = options.body as FormData;
    const userId = Number(formData.get("userId"));
    const content = formData.get("content") as string;
    const file = formData.get("file") as File;
    let imageUrl = file ? URL.createObjectURL(file) : undefined;

    const newPost: Post = {
      id: ++MOCK_ID_COUNTER,
      userId,
      content,
      imageUrl,
      comments: [],
      likes: [],
      createdAt: new Date().toISOString(),
    };
    MOCK_POSTS.unshift(newPost);
    return newPost as T;
  }

  // 7. LIKES
  if (endpoint.includes("/like") && options.method === "POST") {
    // Retorna qualquer coisa, o front otimista resolve
    return {} as T;
  }

  return {} as T;
}

// --- CLIENTE HTTP ---
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text);
  } catch (error: any) {
    console.error("API Error (Fallback to Mock):", error);
    return handleMockRequest<T>(endpoint, options);
  }
}

// --- MÉTODOS EXPORTADOS ---
export const api = {
  login: async (data: LoginRequest): Promise<User> => {
    return request<User>("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  register: async (data: LoginRequest): Promise<User> => {
    return api.login(data);
  },

  // --- O QUE ESTAVA FALTANDO 👇 ---
  updateUser: async (user: User): Promise<User> => {
    return request<User>(`/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
  },

  uploadProfilePicture: async (userId: number, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append("file", file);
    return request<User>(`/users/${userId}/photo`, {
      method: "POST",
      body: formData,
    });
  },

  toggleLike: async (postId: number, userId: number): Promise<Post> => {
    return request<Post>(`/posts/${postId}/like?userId=${userId}`, {
      method: "POST",
    });
  },
  // --------------------------------

  getUserById: async (userId: number): Promise<User> => {
    return request<User>(`/users/${userId}`);
  },

  followUser: async (followerId: number, followedId: number): Promise<void> => {
    return request<void>(`/users/${followerId}/follow/${followedId}`, {
      method: "POST",
    });
  },

  createPost: async (
    userId: number,
    content: string,
    file: File | null
  ): Promise<Post> => {
    const formData = new FormData();
    formData.append("userId", userId.toString());
    formData.append("content", content);
    if (file) formData.append("file", file);
    return request<Post>("/posts", {
      method: "POST",
      body: formData,
    });
  },

  getAllPosts: async (): Promise<Post[]> => {
    return request<Post[]>("/posts");
  },

  getFriendsFeed: async (userId: number): Promise<Post[]> => {
    return request<Post[]>(`/posts/feed/${userId}`);
  },

  getPostsByUser: async (userId: number): Promise<Post[]> => {
    return request<Post[]>(`/posts/user/${userId}`);
  },

  addComment: async (
    postId: number,
    data: CreateCommentRequest
  ): Promise<Comment> => {
    return request<Comment>(`/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
};
