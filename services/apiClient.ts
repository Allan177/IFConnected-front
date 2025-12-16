export const API_BASE_URL = "http://localhost:8080/api";

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete (headers as any)["Content-Type"];
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // Tenta ler o corpo da resposta (pode ser vazio ou JSON)
    const text = await response.text();
    let data: any = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("Resposta não é JSON válido:", text);
      }
    }

    if (!response.ok) {
      // Se o backend mandou uma mensagem de erro (ex: "No value present"), usamos ela
      const errorMessage =
        data.message || data.error || `Erro HTTP: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    console.error(`Erro na requisição para ${endpoint}:`, error.message);
    throw error;
  }
}
