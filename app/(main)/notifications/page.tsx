"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Heart, UserPlus, MessageCircle, Loader2, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: "LIKE" | "FOLLOW" | "COMMENT";
  message: string;
  senderId: number;
  createdAt: string;
  isRead: boolean;
  relatedPostId?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Carrega notificações e marca como lidas
    api
      .getNotifications(user.id)
      .then((data) => {
        setNotifications(data);
        // Marca como lidas após carregar
        api.markNotificationsAsRead(user.id).catch(console.error);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="text-pink-500 fill-pink-500" size={24} />;
      case "FOLLOW":
        return <UserPlus className="text-sky-500 fill-sky-500" size={24} />;
      case "COMMENT":
        return (
          <MessageCircle className="text-green-500 fill-green-500" size={24} />
        );
      default:
        return <Bell className="text-slate-500" size={24} />;
    }
  };

  const handleClick = (n: Notification) => {
    if (n.type === "FOLLOW") {
      router.push(`/profile/${n.senderId}`);
    } else if (n.relatedPostId) {
      // Futuro: router.push(`/post/${n.relatedPostId}`);
      alert("Navegação para post individual em breve!");
    }
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-sky-500" />
      </div>
    );

  return (
    <div className="min-h-screen pb-10">
      <div className="bg-white dark:bg-zinc-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <h1 className="font-bold text-xl">Notificações</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <p>Nenhuma notificação por enquanto.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`p-4 flex gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                                ${
                                  !n.isRead
                                    ? "bg-sky-50 dark:bg-sky-900/10"
                                    : ""
                                }
                            `}
            >
              <div className="mt-1">{getIcon(n.type)}</div>
              <div>
                {/* Aqui você poderia buscar o Avatar do senderId se quiser sofisticar */}
                <p className="text-slate-900 dark:text-slate-100 text-sm">
                  {n.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
