import { API_BASE_URL } from '../constants';
import { LoginRequest, User, Post, CreateCommentRequest, Comment } from '../types';

// Simulação de banco de dados em memória para o Modo Demo
let MOCK_ID_COUNTER = 100;
const MOCK_USERS: User[] = [
  { id: 1, username: 'demo_user', email: 'demo@ifconnected.com' }
];
const MOCK_POSTS: Post[] = [
  {
    id: 99,
    userId: 1,
    content: 'Olá! Se você está vendo este post, significa que o Frontend ativou o Modo de Demonstração (Fallback) porque não conseguiu conectar ao seu Backend Java.\n\nIsso geralmente acontece por erro de CORS ou servidor desligado.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    comments: [
      { id: 1, userId: 2, text: 'Design ficou muito clean! 🚀', username: 'dev_frontend' }
    ],
    createdAt: new Date().toISOString()
  }
];

// Função auxiliar para simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function handleMockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.warn(`[MOCK MODE] Request to ${endpoint} intercepted.`);
  await delay(600); // Simula latência de 600ms

  // 1. LOGIN
  if (endpoint === '/users' && options.method === 'POST') {
    const body = JSON.parse(options.body as string) as LoginRequest;
    return { id: 1, username: body.username, email: body.email } as T;
  }

  // 2. LISTAR POSTS
  if (endpoint.startsWith('/posts/user/') && (!options.method || options.method === 'GET')) {
    // Retorna os posts em memória
    return [...MOCK_POSTS].sort((a, b) => b.id - a.id) as unknown as T;
  }

  // 3. CRIAR POST
  if (endpoint === '/posts' && options.method === 'POST') {
    const formData = options.body as FormData;
    const userId = Number(formData.get('userId'));
    const content = formData.get('content') as string;
    const file = formData.get('file') as File;
    
    let imageUrl = undefined;
    if (file) {
      // Cria URL local para a imagem enviada para funcionar no demo
      imageUrl = URL.createObjectURL(file);
    }

    const newPost: Post = {
      id: ++MOCK_ID_COUNTER,
      userId,
      content,
      imageUrl,
      comments: [],
      createdAt: new Date().toISOString()
    };
    
    MOCK_POSTS.unshift(newPost); // Adiciona ao topo da lista mock
    return newPost as T;
  }

  // 4. COMENTAR
  if (endpoint.match(/\/posts\/\d+\/comments/) && options.method === 'POST') {
    const postIdStr = endpoint.split('/')[2];
    const postId = parseInt(postIdStr);
    const body = JSON.parse(options.body as string) as CreateCommentRequest;
    
    const newComment: Comment = {
      id: Math.floor(Math.random() * 1000),
      userId: body.userId,
      text: body.text,
      username: 'Você (Demo)'
    };

    // Atualiza o post na memória mock
    const postIndex = MOCK_POSTS.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      if (!MOCK_POSTS[postIndex].comments) MOCK_POSTS[postIndex].comments = [];
      MOCK_POSTS[postIndex].comments.push(newComment);
    }

    return newComment as T;
  }

  return {} as T;
}

// Wrapper genérico
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : {};

  } catch (error: any) {
    // Se for erro de conexão (NetworkError), ativa o Mock Fallback
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error("Falha na conexão com Backend. Ativando Modo Demo.", error);
      return handleMockRequest<T>(endpoint, options);
    }
    throw error;
  }
}

export const api = {
  login: async (data: LoginRequest): Promise<User> => {
    return request<User>('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  createPost: async (userId: number, content: string, file: File | null): Promise<Post> => {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }

    return request<Post>('/posts', {
      method: 'POST',
      body: formData,
    });
  },

  getPostsByUser: async (userId: number): Promise<Post[]> => {
    return request<Post[]>(`/posts/user/${userId}`);
  },

  addComment: async (postId: number, data: CreateCommentRequest): Promise<Comment> => {
    return request<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};