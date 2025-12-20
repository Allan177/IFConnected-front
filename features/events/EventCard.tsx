"use client";
import React, { useState } from "react";
import { Event, User } from "@/types";
import { api } from "@/services/api";
import {
  Calendar,
  MapPin,
  Check,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  currentUser: User;
}

export function EventCard({ event, currentUser }: EventCardProps) {
  const [isParticipating, setIsParticipating] = useState(
    event.participantIds?.includes(currentUser.id) || false
  );
  const [participantsCount, setParticipantsCount] = useState(
    event.participantIds?.length || 0
  );
  const [loading, setLoading] = useState(false);

  const handleToggleParticipation = async () => {
    setLoading(true);
    try {
      if (isParticipating) {
        await api.leaveEvent(event.id, currentUser.id);
        setParticipantsCount((prev) => prev - 1);
        setIsParticipating(false);
      } else {
        await api.joinEvent(event.id, currentUser.id);
        setParticipantsCount((prev) => prev + 1);
        setIsParticipating(true);
      }
    } catch (error) {
      alert("Erro ao atualizar presença.");
    } finally {
      setLoading(false);
    }
  };

  const date = new Date(event.eventDate);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4">
      {/* Coluna da Data (Estilo Calendário) */}
      <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl h-20 w-20 shrink-0 border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-red-500 uppercase">
          {format(date, "MMM", { locale: ptBR })}
        </span>
        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {format(date, "dd")}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
              {event.title}
            </h3>
            <p className="text-sm text-sky-600 font-medium mt-1">
              {format(date, "EEEE, HH:mm", { locale: ptBR })}
            </p>
          </div>

          {/* Botão de Ação */}
          <button
            onClick={handleToggleParticipation}
            disabled={loading}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border
                    ${
                      isParticipating
                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        : "bg-slate-900 text-white dark:bg-white dark:text-black border-transparent hover:opacity-90"
                    }
                `}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isParticipating ? (
              <>
                <Check size={16} /> Vou
              </>
            ) : (
              "Participar"
            )}
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{event.locationName}</span>
          </div>
          <div className="flex items-center gap-1">
            <UserIcon size={14} />
            <span>{participantsCount} confirmados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
