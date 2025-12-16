"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Post, User } from "@/types";
import { api } from "@/services/api";
import {
  MessageCircle,
  Heart,
  Repeat2,
  UserPlus,
  Check,
  Loader2,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PostCardProps {
  post: Post;
  currentUser: User | null;
}

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

  // --- ESTADOS ---
  const [authorName, setAuthorName] = useState(`User ${post.userId}`);
  const [author, setAuthor] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const [isLiked, setIsLiked] = useState(
    currentUser ? post.likes?.includes(currentUser.id) || false : false
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

  // Estados de Comentário
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  // Verificação segura de propriedade
  const isOwnPost = currentUser?.id === post.userId;

  // --- EFEITOS ---
  useEffect(() => {
    api
      .getUserById(post.userId)
      .then((user) => {
        if (user) {
          setAuthorName(user.username);
          setAuthor(user);
        }
      })
      .catch(() => setAuthorName(`ID #${post.userId}`));

    if (currentUser && !isOwnPost) {
      api
        .isFollowing(currentUser.id, post.userId)
        .then(setIsFollowing)
        .catch(console.error);
    }
  }, [post.userId, currentUser, isOwnPost]);

  // --- LIKE ---
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    setLikeCount((prev) => prev + (newLikeState ? 1 : -1));

    try {
      await api.toggleLike(post.id, currentUser.id);
    } catch (error) {
      setIsLiked(!newLikeState);
      setLikeCount((prev) => prev - (newLikeState ? 1 : -1));
      console.error("Erro ao curtir:", error);
    }
  };

  // --- FOLLOW ---
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

  // --- COMENTÁRIO ---
  const toggleCommentInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    setShowCommentInput((prev) => !prev);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim() || loadingComment || !currentUser) return;

    setLoadingComment(true);
    try {
      await api.addComment({
        postId: post.id,
        userId: currentUser.id,
        content: commentText.trim(),
      });

      setCommentText("");
      setCommentCount((prev) => prev + 1);
      setShowCommentInput(false);
    } catch (error) {
      alert("Erro ao enviar comentário.");
      console.error(error);
    } finally {
      setLoadingComment(false);
    }
  };

  // --- NAVEGAÇÃO ---

  // 1. Ir para a página do POST (Detalhes)
  const goToPost = () => {
    router.push(`/post/${post.id}`);
  };

  // 2. Ir para a página do PERFIL (Autor)
  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique suba para o card e abra o post
    router.push(`/profile/${post.userId}`);
  };

  return (
    <div
      onClick={goToPost} // <--- MUDANÇA: O card leva ao Post
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
    >
      <div className="flex gap-3">
        {/* Avatar - Leva ao Perfil */}
        <div
          onClick={goToProfile} // <--- Mantém navegação para perfil
          className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0 overflow-hidden relative hover:opacity-80 transition-opacity"
        >
          {author?.profileImageUrl ? (
            <Image
              src={author.profileImageUrl}
              alt={authorName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            (authorName || "?")[0].toUpperCase()
          )}
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-1 text-sm flex-wrap">
            {/* Nome do Autor - Leva ao Perfil */}
            <span
              onClick={goToProfile} // <--- Mantém navegação para perfil
              className="font-bold text-slate-900 dark:text-white hover:underline z-10"
            >
              {authorName}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              @{authorName.toLowerCase().replace(/\s/g, "")}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {formatTimeAgo(post.createdAt)}
            </span>

            {/* Botão Seguir */}
            {!isOwnPost && currentUser && (
              <>
                <span className="text-slate-300 dark:text-slate-700 text-xs">
                  •
                </span>
                <button
                  onClick={handleFollowToggle}
                  disabled={loadingFollow}
                  className={`text-xs font-bold transition-colors disabled:opacity-50 ml-1 flex items-center gap-1
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

          {/* Conteúdo */}
          <p className="text-slate-900 dark:text-slate-100 mt-1 mb-2 whitespace-pre-wrap leading-normal">
            {post.content}
          </p>

          {/* Imagem do Post - AQUI ESTÁ A MELHORIA */}
          {post.imageUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative w-full aspect-video bg-slate-100 dark:bg-black">
              <Image
                src={post.imageUrl}
                alt="Post media"
                fill
                className="object-contain" // ALTERADO: Garante que a imagem inteira seja visível.
                unoptimized
              />
            </div>
          )}

          {/* Footer Ações */}
          <div className="flex justify-between mt-3 max-w-md text-slate-500 dark:text-slate-400">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-colors ${
                isLiked ? "text-pink-500" : "hover:text-pink-500"
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                <Heart size={18} className={isLiked ? "fill-pink-500" : ""} />
              </div>
              <span className="text-xs">{likeCount}</span>
            </button>

            <button
              onClick={toggleCommentInput}
              className="flex items-center gap-2 group hover:text-sky-500 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-xs">{commentCount}</span>
            </button>

            <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 size={18} />
              </div>
            </button>
          </div>

          {/* Input de Comentário */}
          {showCommentInput && (
            <form
              onSubmit={handleCommentSubmit}
              className="mt-3 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={loadingComment}
                className="flex-1 p-2 text-sm rounded-full border border-slate-300 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!commentText.trim() || loadingComment}
                className="p-2 rounded-full bg-sky-500 text-white disabled:bg-slate-400 hover:bg-sky-600 transition-colors"
              >
                {loadingComment ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
