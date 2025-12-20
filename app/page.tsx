"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só toma decisão quando terminar de carregar o usuário do localStorage
    if (!isLoading) {
      if (user) {
        // Se tem usuário, manda para o Feed (Home Logada)
        router.replace("/feed");
      } else {
        // Se não tem, manda para o Login
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  // Enquanto decide, mostra um loading centralizado
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="animate-spin text-sky-500" size={40} />
    </div>
  );
}
