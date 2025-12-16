"use client";
import React, { useState } from "react";
import { useFollow } from "@/hooks/useFollow";
import { User } from "@/types";
import { Loader2, Check, UserPlus, X } from "lucide-react";

interface FollowButtonProps {
  currentUser: User | null;
  targetUserId: number;
  onToggle?: (isNowFollowing: boolean) => void; // Callback opcional para atualizar contadores
  compact?: boolean; // Estilo pequeno (para cards) ou grande (para perfil)
}

export default function FollowButton({
  currentUser,
  targetUserId,
  onToggle,
  compact = false,
}: FollowButtonProps) {
  const { isFollowing, isLoading, toggleFollow } = useFollow(
    currentUser,
    targetUserId
  );
  const [isHovering, setIsHovering] = useState(false);

  // Se for o próprio usuário, não mostra botão
  if (currentUser?.id === targetUserId) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita abrir o perfil ao clicar no botão
    e.preventDefault();

    const newState = await toggleFollow();
    if (newState !== undefined && onToggle) {
      onToggle(newState);
    }
  };

  // ESTILOS
  const baseClasses =
    "font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-50";

  // Estilo Compacto (PostCard)
  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${baseClasses} text-xs 
          ${
            isFollowing
              ? "text-green-600 hover:text-red-600"
              : "text-sky-500 hover:text-sky-600"
          }`}
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isFollowing ? (
          "Seguindo"
        ) : (
          "Seguir"
        )}
      </button>
    );
  }

  // Estilo Grande (Perfil / Sidebar)
  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading}
      className={`${baseClasses} rounded-full px-6 py-2 text-sm border shadow-sm w-36
        ${
          isFollowing
            ? isHovering
              ? "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
              : "bg-transparent text-slate-700 dark:text-white border-slate-300 dark:border-slate-600"
            : "bg-black dark:bg-white text-white dark:text-black border-transparent hover:opacity-90"
        }
      `}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isFollowing ? (
        isHovering ? (
          <>
            {" "}
            <X size={16} /> Deixar{" "}
          </>
        ) : (
          <>
            {" "}
            <Check size={16} /> Seguindo{" "}
          </>
        )
      ) : (
        <>
          {" "}
          <UserPlus size={16} /> Seguir{" "}
        </>
      )}
    </button>
  );
}
