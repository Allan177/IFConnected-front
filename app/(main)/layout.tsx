// src/app/(main)/layout.tsx (Este deve ser o código que você está usando)

"use client";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar"; // Componente da Sidebar
import { Loader2 } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle"; // Já criamos no rascunho
import { SugestoesBar } from "@/features/suggestions/SugestoesBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redireciona para o login se não estiver autenticado e o carregamento terminou
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Tela de Loading enquanto verifica Auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black transition-colors">
        <Loader2 className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  // --- Layout de 3 Colunas (Twitter/X) ---
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 ...">
      <div className="max-w-[1200px] mx-auto flex">
        {/* COLUNA 1: SIDEBAR */}
        <Sidebar user={user!} />

        {/* COLUNA 2: FEED */}
        <main className="flex-1 min-h-screen border-x border-slate-200 dark:border-zinc-900 md:ml-[275px] w-full">
          {children}
        </main>

        {/* COLUNA 3: SUGESTÕES */}
        <aside className="w-80 p-4 sticky top-0 hidden lg:block h-screen">
          {/* Renderiza a barra de sugestões */}
          <SugestoesBar />
        </aside>
      </div>
    </div>
  );
}
