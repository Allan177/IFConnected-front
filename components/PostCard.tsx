import React, { useState, useEffect } from "react";
import { Post, User } from "../types";
import { api } from "../services/api";
import { MessageCircle, Heart, Share2, UserPlus, Check } from "lucide-react";

interface PostCardProps {
  post: Post;
  currentUser: User | null;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser }) => {
  // Estado para armazenar os dados do autor do post (buscado pelo ID)
  const [author, setAuthor] = useState<User | null>(null);

  // Estado visual para saber se já seguiu (apenas visual, reseta ao recarregar)
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // 1. Busca os dados do autor do post assim que o componente carrega
  useEffect(() => {
    // Se o backend mandasse o objeto author dentro do post, não precisaria disso.
    // Mas como manda só userId, buscamos o nome para ficar bonito.
    api
      .getUserById(post.userId)
      .then(setAuthor)
      .catch(() => console.error("Erro ao carregar autor"));
  }, [post.userId]);

  // 2. Função de Seguir
  const handleFollow = async () => {
    if (!currentUser || !author) return;

    setLoadingFollow(true);
    try {
      await api.followUser(currentUser.id, author.id);
      setIsFollowing(true); // Muda o botão para "Seguindo"
    } catch (error) {
      alert("Erro ao seguir usuário.");
    } finally {
      setLoadingFollow(false);
    }
  };

  // Verifica se o post é do próprio usuário logado (não pode seguir a si mesmo)
  const isOwnPost = currentUser?.id === post.userId;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
      {/* CABEÇALHO DO POST */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar (Placeholder com a inicial) */}
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
            {author ? author.username.charAt(0).toUpperCase() : "?"}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {author ? author.username : `User ${post.userId}`}
              </span>

              {/* --- BOTÃO SEGUIR --- */}
              {!isOwnPost && (
                <>
                  <span className="text-slate-300 text-xs">•</span>
                  {isFollowing ? (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                      <Check size={12} /> Seguindo
                    </span>
                  ) : (
                    <button
                      onClick={handleFollow}
                      disabled={loadingFollow}
                      className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {loadingFollow ? "..." : "Seguir"}
                    </button>
                  )}
                </>
              )}
            </div>

            <span className="text-xs text-slate-400">
              {/* Formatação simples de data */}
              {post.createdAt
                ? new Date(post.createdAt).toLocaleDateString()
                : "Just now"}
            </span>
          </div>
        </div>
      </div>

      {/* CONTEÚDO TEXTO */}
      <p className="text-slate-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* CONTEÚDO IMAGEM (Se houver) */}
      {post.imageUrl && (
        <div className="rounded-lg overflow-hidden border border-slate-100 mb-4 bg-slate-50">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-auto object-cover max-h-[500px]"
            loading="lazy"
            onError={(e) => {
              // Esconde imagem quebrada
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* RODAPÉ (Ações Mockadas) */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm transition-colors group">
          <Heart size={18} className="group-hover:fill-red-500/20" />
          <span>Curtir</span>
        </button>

        <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-sm transition-colors">
          <MessageCircle size={18} />
          <span>{post.comments ? post.comments.length : 0} Comentários</span>
        </button>

        <button className="flex items-center gap-2 text-slate-400 hover:text-green-600 text-sm transition-colors">
          <Share2 size={18} />
        </button>
      </div>

      {/* LISTA DE COMENTÁRIOS (Simplificada) */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-4 bg-slate-50 rounded-lg p-3 space-y-2">
          {post.comments.map((comment) => (
            <div key={comment.id} className="text-xs">
              <span className="font-bold text-slate-700 mr-2">
                User {comment.userId}:
              </span>
              <span className="text-slate-600">{comment.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
