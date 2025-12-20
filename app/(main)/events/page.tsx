"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Event } from "@/types";
import { EventCard } from "@/features/events/EventCard";
import { Calendar, Loader2, MapPinOff, Plus } from "lucide-react";
// Importaremos o Modal de Criar Evento aqui depois

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (!user.campusId) {
      setLoading(false);
      return;
    }

    // Carrega eventos do campus do usuário
    api
      .getEventsByCampus(user.campusId)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleEventCreated = (newEvent: Event) => {
    setEvents((prev) => [newEvent, ...prev]);
    setIsCreateModalOpen(false);
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-sky-500" />
      </div>
    );

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <Calendar className="text-sky-500" /> Eventos
        </h1>

        {/* Botão Criar (Só aparece se tiver campus) */}
        {user?.campusId && (
          <button
            onClick={() => setIsCreateModalOpen(true)} // Vamos criar o modal já já
            className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition"
            title="Criar Evento"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* Lista */}
      {!user?.campusId ? (
        <div className="p-10 text-center flex flex-col items-center text-slate-500">
          <MapPinOff size={48} className="mb-4 text-slate-300" />
          <p className="font-bold">Sem Campus vinculado.</p>
          <p className="text-sm">
            Edite seu perfil e selecione um campus para ver os eventos.
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <p>Nenhum evento agendado no seu campus.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {events.map((event) => (
            <EventCard key={event.id} event={event} currentUser={user!} />
          ))}
        </div>
      )}

      {/* Modal de Criação (Vamos criar no próximo passo, deixe comentado por enquanto se quiser rodar) */}
      {/* <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreated={handleEventCreated} /> */}
    </div>
  );
}
