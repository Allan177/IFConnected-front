"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Event } from "@/types";
import { EventCard } from "@/features/events/EventCard";
import { EventModal } from "@/features/events/EventModal";
import { Calendar, Loader2, MapPinOff, Plus } from "lucide-react";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados do Modal e Edição ---
  // isModalOpen: controla se o modal aparece ou não
  const [isModalOpen, setIsModalOpen] = useState(false);
  // editingEvent: guarda o evento que está sendo editado (ou null se for criação)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!user.campusId) {
      setLoading(false);
      return;
    }
    loadEvents();
  }, [user]);

  const loadEvents = () => {
    if (!user?.campusId) return;
    api
      .getEventsByCampus(user.campusId)
      .then(setEvents)
      .catch((err) => console.error("Erro ao carregar eventos", err))
      .finally(() => setLoading(false));
  };

  // --- Funções de Ação ---

  // Abre o modal para CRIAR (limpa o editingEvent)
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Abre o modal para EDITAR (preenche o editingEvent)
  // Essa função é passada para o EventCard
  const handleOpenEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // Deleta o evento
  // Essa função é passada para o EventCard
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja cancelar este evento?")) return;
    try {
      await api.deleteEvent(id);
      // Remove da lista visualmente sem precisar recarregar a página
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Não foi possível excluir o evento.");
    }
  };

  // Callback chamado quando o Modal termina de salvar (Sucesso)
  const handleModalSuccess = (savedEvent: Event, isEdit: boolean) => {
    if (isEdit) {
      // Se foi edição, encontramos o evento antigo na lista e trocamos pelo novo
      setEvents((prev) =>
        prev.map((e) => (e.id === savedEvent.id ? savedEvent : e))
      );
    } else {
      // Se foi criação, adicionamos no topo da lista
      setEvents((prev) => [savedEvent, ...prev]);
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
      {/* Header Fixo */}
      <div className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <Calendar className="text-sky-500" /> Eventos
        </h1>

        {user?.campusId && (
          <button
            onClick={handleOpenCreate}
            className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition shadow-lg shadow-sky-500/20"
            title="Criar Evento"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* Conteúdo da Lista */}
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
            <EventCard
              key={event.id}
              event={event}
              currentUser={user!}
              // Passamos as funções que criamos acima para o Card usar
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Unificado (Create/Edit) */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        currentUserCampusId={user?.campusId || 0}
        currentUserId={user?.id || 0}
        // Passamos o evento que será editado (ou null se for novo)
        eventToEdit={editingEvent}
      />
    </div>
  );
}