"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Post, User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { PostCard } from "../../feed/PostCard";
import { CommentItem } from "@/features/feed/CommentItem"; // Importe o componente que criamos acima
import { ArrowLeft, Loader2 } from "lucide-react";

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para recarregar o post (útil quando envia comentário novo)
  const loadPost = () => {
    api
      .getPostById(id as string)
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-sky-500" />
      </div>
    );
  if (!post || !user)
    return (
      <div className="p-10 text-center text-slate-500">
        Post não encontrado.
      </div>
    );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg">Publicação</h2>
      </div>

      {/* O Post Principal */}
      <PostCard post={post} currentUser={user} />

      {/* Lista de Comentários */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        {!post.comments || post.comments.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            Seja o primeiro a comentar!
          </div>
        ) : (
          // Como o Mongo não gera ID para sub-documentos automaticamente as vezes, usamos index como key se precisar
          post.comments
            .slice()
            .reverse()
            .map((comment, index) => (
              <CommentItem
                key={index}
                userId={comment.userId}
                text={comment.text}
              />
            ))
        )}
      </div>
    </div>
  );
}
