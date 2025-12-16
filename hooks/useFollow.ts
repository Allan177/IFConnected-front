import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { User } from "@/types";

export function useFollow(currentUser: User | null, targetUserId: number) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Carregando inicial

  // Verifica o status inicial ao montar
  useEffect(() => {
    if (!currentUser || currentUser.id === targetUserId) {
      setIsChecking(false);
      return;
    }

    let mounted = true;
    api
      .isFollowing(currentUser.id, targetUserId)
      .then((status) => {
        if (mounted) setIsFollowing(status);
      })
      .catch((err) => console.error("Erro ao verificar follow:", err))
      .finally(() => {
        if (mounted) setIsChecking(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser, targetUserId]);

  const toggleFollow = async () => {
    if (!currentUser || isLoading) return;

    // Estado Otimista: Muda na tela antes de o servidor responder
    const previousState = isFollowing;
    setIsFollowing(!previousState);
    setIsLoading(true);

    try {
      if (previousState) {
        // Estava seguindo -> Unfollow
        await api.unfollowUser(currentUser.id, targetUserId);
      } else {
        // Não estava seguindo -> Follow
        await api.followUser(currentUser.id, targetUserId);
      }
      // Sucesso: Retorna o novo estado para quem chamou (útil para contadores)
      return !previousState;
    } catch (error) {
      // Erro: Reverte o estado visual
      setIsFollowing(previousState);
      alert("Erro ao realizar ação.");
      return previousState;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    isLoading: isLoading || isChecking,
    toggleFollow,
  };
}
