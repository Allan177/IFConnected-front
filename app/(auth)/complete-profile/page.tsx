"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api, Campus } from "@/services/api";
import { MapPin, Save, Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
  const { user, login } = useAuth(); // Precisamos da função login para atualizar o user no contexto
  const router = useRouter();
  
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusId, setCampusId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carrega a lista de campi
    api.getAllCampuses().then(setCampuses).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !campusId) return;

    setLoading(true);
    try {
      // 1. Atualiza no Backend (Usando a rota que já temos de updateCampus)
      // Ou a rota genérica de update user
      // Vamos usar a rota específica se tiver, ou criar um update rápido.
      
      // Assumindo que temos um user atualizado:
      const updatedUser = { ...user, campusId: Number(campusId) };
      
      // Chama a API para salvar
      await api.updateUser(updatedUser); 
      // OBS: Se você tiver a rota PATCH /users/{id}/campus, é melhor usar ela.
      // Ex: await api.updateUserCampus(user.id, Number(campusId));

      // 2. Atualiza o Contexto Local e Redireciona
      login(updatedUser); // Atualiza o estado global
      router.push("/feed"); // Manda pro abraço

    } catch (error) {
      console.error("Erro ao salvar campus", error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-zinc-800">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quase lá!</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Para finalizar, precisamos saber em qual Campus você estuda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Selecione seu Campus
            </label>
            <select
              required
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-700 focus:ring-2 focus:ring-sky-500 outline-none transition text-slate-900 dark:text-white"
            >
              <option value="" disabled>Selecione...</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !campusId}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Salvar e Continuar</>}
          </button>
        </form>
      </div>
    </div>
  );
}