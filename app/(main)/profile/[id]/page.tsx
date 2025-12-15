"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../services/api";
import { Post, User } from "@/types";
// --- ATENÇÃO AQUI: Garanta que está importando de @/features/feed/PostCard ---
import { PostCard } from "../../feed/PostCard";
// -----------------------------------------------------------------------------
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  Check,
  UserPlus,
  Edit2,
} from "lucide-react";
import Image from "next/image";

interface UserProfileData {
  user: User;
  followersCount: number;
  followingCount: number;
  postCount: number;
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const profileId = Number(id);

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  const loadData = useCallback(async () => {
    if (isNaN(profileId) || !currentUser) {
      setLoading(false);
      return;
    }

    try {
      const [profileRes, postsRes] = await Promise.all([
        api.getUserProfile(profileId),
        api.getPostsByUser(profileId),
      ]);

      setProfileData(profileRes);
      // Log para debug: verifique no console se as URLs das imagens estão chegando aqui
      console.log("Posts carregados no perfil:", postsRes);

      setPosts(
        postsRes.sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        )
      );

      if (currentUser.id !== profileId) {
        const followingStatus = await api.isFollowing(
          currentUser.id,
          profileId
        );
        setIsFollowing(followingStatus);
      }
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [profileId, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profileData || loadingFollow) return;

    setLoadingFollow(true);
    const action = isFollowing ? api.unfollowUser : api.followUser;
    const newFollowingState = !isFollowing;

    try {
      await action(currentUser.id, profileId);
      setIsFollowing(newFollowingState);
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              followersCount:
                prev.followersCount + (newFollowingState ? 1 : -1),
            }
          : null
      );
    } catch (error) {
      alert(`Falha ao ${newFollowingState ? "seguir" : "deixar de seguir"}.`);
    } finally {
      setLoadingFollow(false);
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
  if (!currentUser) return null;

  const isOwnProfile = currentUser.id === profileId;

  return (
    <div className="pb-10 min-h-screen">
      {/* HEADER FIXO */}
      <div className="bg-white dark:bg-zinc-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
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
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 p-4">
        {/* Capa */}
        <div className="h-36 bg-gradient-to-r from-zinc-800 to-zinc-900 w-full relative -mx-4 -mt-4"></div>

        {/* Foto de Perfil */}
        <div className="-mt-16 ml-4 relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-5xl font-bold text-slate-500 overflow-hidden">
            {profileData.user.profileImageUrl ? (
              <Image
                src={profileData.user.profileImageUrl}
                alt="Foto de Perfil"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                priority
                unoptimized // <--- ADICIONE ISTO AQUI
              />
            ) : (
              profileData.user.username[0].toUpperCase()
            )}
          </div>
        </div>

        {/* Botão de Ação (Alinhado com a foto) */}
        <div className="flex justify-end -mt-10 mb-4">
          {isOwnProfile ? (
            <button className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full font-bold text-sm text-slate-700 dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Editar Perfil
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              onMouseEnter={() => setIsHoveringFollow(isFollowing)}
              onMouseLeave={() => setIsHoveringFollow(false)}
              disabled={loadingFollow}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 
                ${
                  isFollowing
                    ? isHoveringFollow
                      ? "bg-sky-500 text-white border border-red-600 hover:bg-red-700"
                      : "bg-transparent text-black dark:text-white border border-slate-400 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800"
                    : "bg-black dark:bg-sky-500 text-white hover:opacity-90"
                } w-36`}
            >
              {loadingFollow ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isFollowing ? (
                isHoveringFollow ? (
                  "Deixar de Seguir"
                ) : (
                  <>
                    <Check size={16} /> Seguindo
                  </>
                )
              ) : (
                <>
                  <UserPlus size={16} /> Seguir
                </>
              )}
            </button>
          )}
        </div>

        {/* Informações */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {profileData.user.username}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
            @{profileData.user.email.split("@")[0]}
          </p>

          <p className="text-sm mb-3 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {profileData.user.bio || "Sem bio."}
          </p>

          <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <span className="flex items-center gap-1">
              <MapPin size={16} /> Campus ID:{" "}
              {profileData.user.campusId || "Não definido"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} /> Ingressou em 2025
            </span>
          </div>

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
      </div>

      {/* FEED DO USUÁRIO */}
      <div className="mt-0">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button className="px-4 py-3 font-bold text-sm text-slate-900 dark:text-white border-b-4 border-sky-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Posts
          </button>
        </div>

        {posts.length === 0 ? (
          <p className="p-10 text-center text-slate-500">Nenhuma publicação.</p>
        ) : (
          posts.map((post) => (
            // AQUI É O PULO DO GATO: Usar o componente correto
            <PostCard key={post.id} post={post} currentUser={currentUser!} />
          ))
        )}
      </div>
    </div>
  );
}
