// src/contexts/AuthContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Efeito para carregar o usuário do LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("ifconnected:user");
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        // Poderia fazer um fetch para validar o token aqui, mas vamos simplificar
        setUser(userData);
      } catch (e) {
        localStorage.removeItem("ifconnected:user");
      }
    }
    setIsLoading(false);
  }, []);

  // 2. Proteção de Rota (Redirecionamento)
  useEffect(() => {
    const isAuthRoute =
      pathname.includes("/login") || pathname.includes("/register");

    if (isLoading) return;

    if (user && isAuthRoute) {
      // Já logado e tentando ir para login/register: Redireciona para o feed
      router.push("/feed");
    } else if (!user && !isAuthRoute) {
      // Não logado e tentando ir para uma rota protegida: Redireciona para o login
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("ifconnected:user", JSON.stringify(userData));
    router.push("/feed"); // Redireciona para o novo feed
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ifconnected:user");
    router.push("/login"); // Manda para o login
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook Customizado para usar o Contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
