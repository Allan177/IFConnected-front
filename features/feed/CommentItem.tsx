"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import { User } from "@/types";
import { useRouter } from "next/navigation";

interface CommentItemProps {
  userId: number;
  text: string;
  postedAt?: string; // Se seu backend mandar data no futuro
}

export function CommentItem({ userId, text }: CommentItemProps) {
  const [author, setAuthor] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Busca quem fez o comentário
    api
      .getUserById(userId)
      .then(setAuthor)
      .catch(() => console.error("Erro autor comentário"));
  }, [userId]);

  return (
    <div className="flex gap-3 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      {/* Avatar Pequeno */}
      <div
        onClick={() => router.push(`/profile/${userId}`)}
        className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-400 shrink-0 cursor-pointer overflow-hidden relative"
      >
        {author?.profileImageUrl ? (
          <img
            src={author.profileImageUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          author?.username?.[0]?.toUpperCase() || "?"
        )}
      </div>

      <div className="flex-1">
        {/* Header do Comentário */}
        <div className="flex items-center gap-2 mb-1">
          <span
            onClick={() => router.push(`/profile/${userId}`)}
            className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:underline cursor-pointer"
          >
            {author?.username || `User ${userId}`}
          </span>
          <span className="text-xs text-slate-500">
            @{author?.username?.toLowerCase().replace(/\s/g, "")}
          </span>
        </div>

        {/* Texto */}
        <p className="text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  );
}
