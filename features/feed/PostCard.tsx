"use client";

import React, { useEffect, useState } from "react";
import { Post, User } from "@/types";
import { api } from "@/services/api";
import {
  MessageCircle,
  Heart,
  Repeat2,
  UserPlus,
  Check,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PostCardProps {
  post: Post;
  currentUser: User | null; // Alterado para permitir null por segurança
}

// Utilitário para formatar o tempo (Xm, Xh, Xd)
const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return "agora";
  try {
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
  } catch (e) {
    return "agora";
  }
};

export function PostCard({ post, currentUser }: PostCardProps) {
  const router = useRouter();

  // Estados locais
  const [author, setAuthor] = useState<User | null>(null);
  const [authorName, setAuthorName] = useState(`User ${post.userId}`);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Estado de Curtida (Baseado no array de IDs de usuários que curtiram)
  const [isLiked, setIsLiked] = useState(
    currentUser ? post.likes?.includes(currentUser.id) || false : false
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

  // Verifica se o post pertence ao usuário logado
  const isOwnPost = currentUser?.id === post.userId;

  // 1. Efeito para carregar dados do Autor e Status de Follow
  useEffect(() => {
    // Busca informações do autor no Postgres/Redis via API
    api
      .getUserById(post.userId)
      .then((user) => {
        if (user) {
          setAuthorName(user.username);
          setAuthor(user);
        }
      })
      .catch(() => console.error(`Erro ao carregar autor do post ${post.id}`));

    // Checa se o usuário logado segue o autor do post
    if (currentUser && !isOwnPost) {
      api
        .isFollowing(currentUser.id, post.userId)
        .then(setIsFollowing)
        .catch(console.error);
    }
  }, [post.userId, currentUser, isOwnPost, post.id]);

  // 2. Lógica de Like
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    setLikeCount((prev) => prev + (newLikeState ? 1 : -1));

    try {
      await api.toggleLike(Number(post.id), currentUser.id);
    } catch (error) {
      // Reverte se a API falhar
      setIsLiked(!newLikeState);
      setLikeCount((prev) => prev - (newLikeState ? 1 : -1));
    }
  };

  // 3. Lógica de Follow/Unfollow
  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || !author || loadingFollow) return;

    setLoadingFollow(true);
    const action = isFollowing ? api.unfollowUser : api.followUser;
    const newFollowingState = !isFollowing;

    try {
      await action(currentUser.id, post.userId);
      setIsFollowing(newFollowingState);
    } catch (error) {
      alert(`Erro ao processar solicitação.`);
      console.error(error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.userId}`);
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div
      onClick={goToProfile}
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar com inicial */}
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0">
          {(authorName || "?")[0].toUpperCase()}
        </div>

        <div className="flex-1">
          {/* Header (Nome, @, Tempo, Seguir) */}
          <div className="flex items-center gap-1 text-sm flex-wrap">
            <span className="font-bold text-slate-900 dark:text-white hover:underline">
              {authorName}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              @{authorName.toLowerCase().replace(/\s/g, "")}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {formatTimeAgo(post.createdAt)}
            </span>

            {/* Botão Seguir Dinâmico */}
            {!isOwnPost && currentUser && (
              <>
                <span className="text-slate-300 dark:text-slate-700 text-xs">
                  •
                </span>
                <button
                  onClick={handleFollowToggle}
                  disabled={loadingFollow}
                  className={`text-xs font-bold transition-colors disabled:opacity-50 ml-1 
                            ${
                              isFollowing
                                ? "text-slate-500 dark:text-slate-400 hover:text-red-500"
                                : "text-sky-500 hover:text-sky-600"
                            }`}
                >
                  {loadingFollow ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isFollowing ? (
                    "Seguindo"
                  ) : (
                    "Seguir"
                  )}
                </button>
              </>
            )}
          </div>

          {/* Texto do Post */}
          <p className="text-slate-900 dark:text-slate-100 mt-1 mb-2 whitespace-pre-wrap leading-normal">
            {post.content}
          </p>

          {/* Imagem do Post (Next.js Image com Aspect Ratio Fixado) */}
          {post.imageUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative w-full aspect-video bg-slate-100 dark:bg-slate-800">
              <Image
                src={post.imageUrl}
                alt="Conteúdo do post"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          )}

          {/* Footer (Ações) */}
          <div className="flex justify-between mt-3 max-w-md text-slate-500 dark:text-slate-400">
            {/* Curtidas */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-colors ${
                isLiked ? "text-pink-500" : "hover:text-pink-500"
              }`}
            >
              <div
                className={`p-2 rounded-full group-hover:bg-pink-500/10 transition-colors`}
              >
                <Heart size={18} className={isLiked ? "fill-pink-500" : ""} />
              </div>
              <span className="text-xs">{likeCount}</span>
            </button>

            {/* Comentários */}
            <button className="flex items-center gap-2 group hover:text-sky-500 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-xs">{post.comments?.length || 0}</span>
            </button>

            {/* Compartilhar */}
            <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
