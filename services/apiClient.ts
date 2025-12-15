// src/services/apiClient.ts

export const API_BASE_URL = "http://localhost:8080/api";

// --- MUDANÇA: Renomeado de httpClient para request ---
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    // Adicionar token JWT aqui no futuro, por enquanto sem token
    ...options.headers,
  };

  // Trata FormData (upload de arquivo)
  if (options.body instanceof FormData) {
    delete (headers as any)["Content-Type"];
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Lança o erro bonitinho que o Backend manda
    throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : undefined; // Trata resposta vazia (void)
}
// Agora este arquivo exporta a função 'request'
