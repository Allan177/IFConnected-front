import React, { useState, useRef } from "react";
import { User } from "../types";
import { api } from "../services/api";
import { X, Save, Loader2, Camera } from "lucide-react";
import { Avatar } from "./Avatar";

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || ""); // Novo campo Bio

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Atualiza textos
      let updatedUser = await api.updateUser({ ...user, username, email, bio });

      // 2. Se tiver selecionado arquivo, faz upload da foto
      // (Poderia fazer tudo numa chamada só se mudasse o endpoint do Java,
      // mas fazer em duas etapas simplifica nosso código atual)
      if (fileInputRef.current?.files?.[0]) {
        updatedUser = await api.uploadProfilePicture(
          user.id,
          fileInputRef.current.files[0]
        );
      }

      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      alert("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  // Preview local da imagem ao selecionar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // Truque visual: ler o arquivo localmente só pra mostrar no avatar
      // A lógica real de envio é no submit
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Editar Perfil</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* FOTO DE PERFIL */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar name={username} src={user.profileImageUrl} size="xl" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <p className="text-xs text-slate-400">Clique para alterar foto</p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all resize-none h-20"
              placeholder="Conte um pouco sobre você..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
