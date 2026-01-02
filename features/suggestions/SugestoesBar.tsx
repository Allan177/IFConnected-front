"use client";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { User } from "@/types";
import { Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SugestoesBar() {
  const { user } = useAuth();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // MOCK para simular o follow (precisamos do endpoint no api.ts)
  const handleFollow = async (id: number) => {
    if (!user) return;
    try {
      await api.followUser(user.id, id);
      // Remove da lista de sugestões após seguir
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert("Erro ao seguir.");
    }
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // GET /api/users/{id}/suggestions?radiusKm=50
    api
      .getSuggestions(user.id, 50)
      .then(setSuggestions)
      .catch((e) => {
        console.error("Erro ao carregar sugestões:", e);
        // Se o erro for "Usuário não tem campus", trate
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl sticky top-4">
      <h3 className="font-extrabold text-xl mb-4 text-slate-900 dark:text-slate-50 flex items-center gap-2">
        <Zap size={20} className="text-sky-500" /> Quem Seguir
      </h3>

      {loading ? (
        <Loader2 className="animate-spin text-sky-500 mx-auto" size={24} />
      ) : suggestions.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhuma sugestão por perto.</p>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push(`/profile/${s.id}`)}
              >
                <div className="w-10 h-10 bg-sky-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-sky-600 dark:text-slate-200">
                  {s.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm truncate">{s.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Campus Próximo
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(s.id)}
                className="bg-black dark:bg-sky-500 text-white px-4 py-1.5 rounded-full font-bold text-sm hover:opacity-90 transition"
              >
                Seguir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
