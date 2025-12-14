"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../services/api";
import { Post, User } from "@/types";
import { PostCard } from "../../feed/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, MapPin, Check, UserPlus } from "lucide-react";

// O DTO que o backend manda
interface UserProfileData {
  user: User;
  followersCount: number;
  followingCount: number;
  postCount: number;
  // isFollowing?: boolean; // Vamos checar isso no backend depois
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth(); // O usuário que está logado

  const profileId = Number(id);

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false); // Estado para o botão

  useEffect(() => {
    setLoading(true);
    // Não carregamos o perfil do usuário logado se o ID for inválido
    if (isNaN(profileId)) return;

    Promise.all([
      api.getUserProfile(profileId), // Busca User + Stats (Postgres + Mongo)
      api.getPostsByUser(profileId), // Busca posts (Mongo)
    ])
      .then(([profileRes, postsRes]) => {
        setProfileData(profileRes);
        setPosts(
          postsRes.sort(
            (a, b) =>
              new Date(b.createdAt!).getTime() -
              new Date(a.createdAt!).getTime()
          )
        );

        // Lógica de isFollowing (Aprimorar depois com endpoint real do backend)
        // Por enquanto, assumimos que se o botão não for seu, ele não está seguindo
        // if (currentUser) { api.isFollowing(currentUser.id, profileId).then(setIsFollowing); }
      })
      .catch((e) => {
        console.error("Erro ao carregar perfil:", e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [profileId, currentUser]); // Recarrega se o ID do perfil ou o usuário logado mudar

  const handleFollow = async () => {
    if (!currentUser || !profileData || isFollowing) return;

    try {
      await api.followUser(currentUser.id, profileData.user.id);
      setIsFollowing(true);
      setProfileData((prev) =>
        prev ? { ...prev, followersCount: prev.followersCount + 1 } : null
      );
    } catch (error) {
      alert("Erro ao seguir.");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin text-sky-500 mx-auto" size={32} />
      </div>
    );
  if (!profileData)
    return (
      <div className="p-10 text-center text-slate-500">
        Perfil não encontrado.
      </div>
    );

  const isOwnProfile = currentUser?.id === profileData.user.id;

  return (
    <div className="pb-10 min-h-screen">
      {/* HEADER FIXO */}
      <div className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-xl leading-tight">
            {profileData.user.username}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {profileData.postCount} publicações
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DO PERFIL */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
        {/* Capa (Mock) e Foto */}
        <div className="h-36 bg-gradient-to-r from-sky-500 to-indigo-600 w-full relative -mx-4 -mt-4"></div>
        <div className="-mt-12 ml-4">
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-500 overflow-hidden">
            {profileData.user.profileImageUrl ? (
              <img
                src={profileData.user.profileImageUrl}
                alt="Foto"
                className="w-full h-full object-cover"
              />
            ) : (
              profileData.user.username[0].toUpperCase()
            )}
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="flex justify-end -mt-8 mb-4">
          {isOwnProfile ? (
            <button className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Editar Perfil
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`px-6 py-2 rounded-full font-bold text-sm text-white transition-colors flex items-center gap-2 shadow-sm 
                                ${
                                  isFollowing
                                    ? "bg-green-600"
                                    : "bg-black dark:bg-orange-700"
                                }`}
            >
              {isFollowing ? (
                <>
                  <Check size={16} /> Seguindo
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Seguir
                </>
              )}
            </button>
          )}
        </div>

        {/* Informações */}
        <h2 className="text-xl font-bold">{profileData.user.username}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
          @{profileData.user.email.split("@")[0]}
        </p>

        <p className="text-sm mb-3">{profileData.user.bio || "Sem bio."}</p>

        <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={16} /> Campus ID:{" "}
            {profileData.user.campusId || "Não Definido"}
          </span>
        </div>

        {/* Estatísticas */}
        <div className="flex gap-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            <b className="font-bold text-slate-900 dark:text-slate-50">
              {profileData.followingCount}
            </b>{" "}
            Seguindo
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            <b className="font-bold text-slate-900 dark:text-slate-50">
              {profileData.followersCount}
            </b>{" "}
            Seguidores
          </span>
        </div>
      </div>

      {/* FEED DO USUÁRIO */}
      <div className="mt-4">
        <h3 className="font-bold text-lg px-4 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          Publicações
        </h3>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={currentUser!} />
        ))}
        {posts.length === 0 && (
          <p className="p-10 text-center text-slate-500">Nenhuma publicação.</p>
        )}
      </div>
    </div>
  );
}
