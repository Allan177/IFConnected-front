"use client";
import React, { useEffect, useState } from "react";
import { Post, User } from "@/types";
import { api } from "../../../services/api"; // Usar a API para buscar o nome do autor
import { MessageCircle, Heart, Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostCardProps {
  post: Post;
  // O usuário logado é passado para saber quem curtiu
  currentUser: User;
}

// MOCK para evitar erro de servidor quando o nome não for carregado
const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return "agora";
  const seconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export function PostCard({ post, currentUser }: PostCardProps) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState(`User ${post.userId}`);
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(currentUser.id) || false
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

  // Efeito para buscar o nome do autor (só o ID vem do Mongo)
  useEffect(() => {
    api
      .getUserById(post.userId)
      .then((user) => setAuthorName(user.username))
      .catch(() => setAuthorName(`ID #${post.userId}`));
  }, [post.userId]);

  const handleLike = async () => {
    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    setLikeCount((prev) => prev + (newLikeState ? 1 : -1));

    // Lógica otimista: Chama o backend e reverte se der erro
    try {
      // Rota POST /posts/{postId}/like?userId={id}
      await api.toggleLike(Number(post.id), currentUser.id);
    } catch (error) {
      setIsLiked(!newLikeState);
      setLikeCount((prev) => prev - (newLikeState ? 1 : -1));
      console.error("Erro ao curtir/descurtir");
    }
  };

  // Navegar para o perfil
  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o click no card acione outras ações
    router.push(`/profile/${post.userId}`);
  };

  return (
    <div className="bg-white dark:bg-black/5 border-b border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/90 cursor-pointer transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          onClick={goToProfile}
          className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
        >
          {authorName[0].toUpperCase()}
        </div>

        <div className="flex-1">
          {/* Header do Post */}
          <div className="flex items-center gap-1 text-sm">
            <span
              onClick={goToProfile}
              className="font-bold hover:underline cursor-pointer"
            >
              {authorName}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              @{authorName.toLowerCase().replace(/\s/g, "")}
            </span>
            <span className="text-slate-500 dark:text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>

          {/* Conteúdo */}
          <p className="text-slate-900 dark:text-slate-50 mt-1 mb-2 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Imagem */}
          {post.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img
                src={post.imageUrl}
                alt="Post media"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Footer de Ações */}
          <div className="flex justify-between mt-3 max-w-md">
            {/* Likes */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm ${
                isLiked ? "text-pink-500" : "text-slate-500 hover:text-pink-500"
              }`}
            >
              <Heart
                size={18}
                className={isLiked ? "fill-pink-500" : "hover:fill-pink-500/20"}
              />
              <span>{likeCount}</span>
            </button>

            {/* Comentários (Simples) */}
            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-sky-500 transition-colors">
              <MessageCircle size={18} />
              <span>{post.comments?.length || 0}</span>
            </button>

            {/* Compartilhar (Simples) */}
            <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-green-500 transition-colors">
              <Repeat2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
