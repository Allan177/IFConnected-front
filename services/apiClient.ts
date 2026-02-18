export const API_BASE_URL = "http://localhost:8080/api";

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 🔹 CORREÇÃO: Concatenação direta.
  // O endpoint já vem com a barra inicial (ex: "/auth/google")
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  // 🔹 Só define JSON se NÃO for FormData (Upload de arquivos)
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // 🔹 Injeta token JWT (Se existir no localStorage)
  if (typeof window !== "undefined") {
    // Atenção: Garanta que o nome da chave aqui é o mesmo usado no Login.tsx
    const token = localStorage.getItem("ifconnected:token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data: any = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("Resposta não é JSON válido:", text);
      }
    }

    if (!response.ok) {
      // Tenta pegar a mensagem de erro do backend ou usa o status
      const errorMessage =
        data?.message ||
        data?.error ||
        `Erro na requisição: ${response.status} ${response.statusText}`;
      
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    console.error(`Falha em ${endpoint}:`, error.message);
    throw error;
  }
}