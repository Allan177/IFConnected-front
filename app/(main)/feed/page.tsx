"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { postService } from "@/services/postService";
import { Post } from "@/types";
import { PostCard } from "../feed/PostCard";
import { Home, Users, MapPin, Loader2, RefreshCw } from "lucide-react";
import CreatePost from "../../../features/feed/CreatePost";

type FeedType = "global" | "following" | "regional";

const tabItems: { id: FeedType; icon: any; label: string }[] = [
  { id: "global", icon: Home, label: "Global" },
  { id: "following", icon: Users, label: "Seguindo" },
  { id: "regional", icon: MapPin, label: "Perto" },
];

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<FeedType>("global");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let data: Post[] = [];

      if (activeTab === "global") {
        data = await postService.getAll();
      } else if (activeTab === "following") {
        data = await postService.getFriendsFeed(user.id);
      } else if (activeTab === "regional") {
        // Rota regional (o backend valida se o usuário tem campusId)
        data = await postService.getRegionalFeed(user.id, 50);
      }

      // Ordem: Mais novo primeiro
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
      setPosts(sorted);
    } catch (e: any) {
      console.error("Erro ao buscar feed:", e);
      setError(e.message || "Erro ao conectar com o servidor.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setActiveTab("global"); // Volta para o feed principal para ver o novo post
  };

  // Componente de Cabeçalho do Feed (Abas)
  const FeedHeader = () => (
    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
      {tabItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex-1 py-4 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative 
                        ${
                          activeTab === item.id
                            ? "text-white"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
        >
          {item.label}
          {activeTab === item.id && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-sky-600 rounded-t-full"></div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="pb-10">
      <FeedHeader />

      {/* Área de Criação de Post (Substitua pelo componente real CreatePost) */}
      <div className="border-b border-slate-200 dark:border-y-zinc-800">
        {/* Aqui você chamaria o componente CreatePost */}
        <CreatePost user={user!} onPostCreated={handlePostCreated} />
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="p-10 text-center">
          <Loader2 className="animate-spin text-sky-600 mx-auto" size={24} />
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 border border-red-200 rounded-xl m-4 bg-red-50">
          <p>{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-3 text-sky-600 font-bold flex items-center gap-2 mx-auto hover:underline"
          >
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <p className="font-bold mb-2">Sem posts para mostrar.</p>
          {activeTab === "regional" && (
            <p className="text-sm">
              Vincule seu campus ao perfil para ver posts da sua região!
            </p>
          )}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={user!} />
        ))
      )}
    </div>
  );
}
