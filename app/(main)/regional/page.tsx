"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Post, User } from "@/types";
import { PostCard } from "../feed/PostCard";
import {
  Loader2,
  MapPin,
  MapPinOff,
  Users,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegionalPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Controle de Paginação do Carrossel (Índice inicial)
  const [startIndex, setStartIndex] = useState(0);

  // --- MUDANÇA 1: Diminuir de 4 para 3 itens ---
  const ITEMS_PER_VIEW = 3;
  // ---------------------------------------------

  useEffect(() => {
    if (!user) return;
    if (!user.campusId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [feedData, suggestionsData] = await Promise.all([
          api.getRegionalFeed(user.id, 50),
          api.getSuggestions(user.id, 50),
        ]);

        setPosts(
          feedData.sort(
            (a, b) =>
              new Date(b.createdAt!).getTime() -
              new Date(a.createdAt!).getTime()
          )
        );
        setSuggestions(suggestionsData);
      } catch (error) {
        console.error("Erro ao carregar dados regionais", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleFollowSuggestion = async (targetId: number) => {
    if (!user) return;
    try {
      await api.followUser(user.id, targetId);
      // Remove da lista visualmente para dar feedback imediato
      setSuggestions((prev) => prev.filter((u) => u.id !== targetId));
    } catch (e) {
      alert("Erro ao seguir.");
    }
  };

  // --- LÓGICA DO CARROSSEL ---
  const handleNext = () => {
    if (startIndex + ITEMS_PER_VIEW < suggestions.length) {
      setStartIndex((prev) => prev + ITEMS_PER_VIEW);
    }
  };

  const handlePrev = () => {
    if (startIndex - ITEMS_PER_VIEW >= 0) {
      setStartIndex((prev) => prev - ITEMS_PER_VIEW);
    }
  };

  // Recorta exatamente os itens para exibir agora
  const currentItems = suggestions.slice(
    startIndex,
    startIndex + ITEMS_PER_VIEW
  );
  const hasNext = startIndex + ITEMS_PER_VIEW < suggestions.length;
  const hasPrev = startIndex > 0;

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  // Sem Campus
  if (user && !user.campusId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white dark:bg-black">
        <div className="bg-slate-100 dark:bg-zinc-900 p-6 rounded-full mb-4">
          <MapPinOff size={48} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Onde você estuda?
        </h2>
        <p className="text-slate-500 max-w-md mb-6">
          Para ver posts e pessoas próximas, você precisa vincular seu perfil a
          um Campus do IF.
        </p>
        <button
          onClick={() => router.push(`/profile/${user.id}`)}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
        >
          Editar Perfil e Escolher Campus
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10 min-h-screen bg-slate-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <h1 className="font-bold text-xl flex items-center gap-2 text-slate-900 dark:text-white">
          <MapPin className="text-sky-500" /> Campus & Região
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Atividades em um raio de 50km
        </p>
      </div>

      {/* --- CARROSSEL DE SUGESTÕES --- */}
      {suggestions.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 p-4 mb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Users size={16} className="text-sky-500" /> Pessoas Próximas
            </h2>

            {/* Controles de Navegação */}
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft
                  size={20}
                  className="text-slate-600 dark:text-slate-300"
                />
              </button>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight
                  size={20}
                  className="text-slate-600 dark:text-slate-300"
                />
              </button>
            </div>
          </div>

          {/* --- MUDANÇA 2: GRID DE 3 COLUNAS --- */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {currentItems.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-between transition-all hover:border-sky-200 dark:hover:border-sky-900 h-full"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Avatar */}
                  <div
                    className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 mb-3 overflow-hidden relative cursor-pointer border-2 border-white dark:border-slate-800"
                    onClick={() => router.push(`/profile/${suggestion.id}`)}
                  >
                    {suggestion.profileImageUrl ? (
                      <Image
                        src={suggestion.profileImageUrl}
                        alt={suggestion.username}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-slate-500">
                        {suggestion.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center w-full mb-3">
                    <p
                      className="font-bold text-sm truncate text-slate-900 dark:text-white cursor-pointer hover:underline"
                      onClick={() => router.push(`/profile/${suggestion.id}`)}
                    >
                      {suggestion.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Do seu Campus
                    </p>
                  </div>
                </div>

                {/* Botão Seguir */}
                <button
                  onClick={() => handleFollowSuggestion(suggestion.id)}
                  className="w-full py-1.5 px-3 bg-white dark:bg-black border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-full hover:bg-sky-50 dark:hover:bg-slate-900 hover:text-sky-600 hover:border-sky-200 transition flex items-center justify-center gap-1"
                >
                  <UserPlus size={14} /> Seguir
                </button>
              </div>
            ))}

            {/* Preenchimento vazio para alinhar o grid se faltar item na última página */}
            {[...Array(ITEMS_PER_VIEW - currentItems.length)].map((_, i) => (
              <div key={`empty-${i}`} className="hidden md:block"></div>
            ))}
          </div>
        </div>
      )}

      {/* Feed Regional */}
      <div>
        {posts.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <p className="font-bold">Nenhum post na região.</p>
            <p className="text-sm mt-1">
              Seja o primeiro do seu campus a publicar!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user!} />
          ))
        )}
      </div>
    </div>
  );
}
