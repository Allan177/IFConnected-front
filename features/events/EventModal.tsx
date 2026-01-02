"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { CreateEventRequest, Event } from "@/types";
import { api } from "@/services/api";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (event: Event, isEdit: boolean) => void; // Avisa a página que deu certo
  currentUserCampusId: number;
  currentUserId: number;
  eventToEdit?: Event | null; // Se vier preenchido, é edição
}

export function EventModal({
  isOpen,
  onClose,
  onSuccess,
  currentUserCampusId,
  currentUserId,
  eventToEdit,
}: EventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    locationName: "",
  });

  // Resetar ou Preencher form ao abrir
  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        // TRUQUE: O input datetime-local do HTML exige o formato "YYYY-MM-DDTHH:mm"
        // O Java manda com segundos "YYYY-MM-DDTHH:mm:ss", então cortamos os últimos caracteres
        const dateStr = eventToEdit.eventDate 
          ? eventToEdit.eventDate.substring(0, 16) 
          : "";
          
        setFormData({
          title: eventToEdit.title,
          description: eventToEdit.description || "",
          eventDate: dateStr,
          locationName: eventToEdit.locationName,
        });
      } else {
        // Limpa o form para nova criação
        setFormData({ title: "", description: "", eventDate: "", locationName: "" });
      }
    }
  }, [isOpen, eventToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: CreateEventRequest = {
        ...formData,
        campusId: currentUserCampusId,
        creatorId: currentUserId,
      };

      let result;
      if (eventToEdit) {
        // --- ATUALIZAR ---
        result = await api.updateEvent(eventToEdit.id, payload);
      } else {
        // --- CRIAR ---
        result = await api.createEvent(payload);
      }

      onSuccess(result, !!eventToEdit);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar o evento. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white">
            {eventToEdit ? "Editar Evento" : "Novo Evento"}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Título
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition dark:text-white"
              placeholder="Ex: Torneio de Xadrez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white dark:[color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Local
            </label>
            <input
              type="text"
              required
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white"
              placeholder="Ex: Sala 204"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descrição
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none min-h-[100px] dark:text-white"
              placeholder="Detalhes sobre o evento..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {eventToEdit ? "Salvar Alterações" : "Criar Evento"}
          </button>
        </form>
      </div>
    </div>
  );
}