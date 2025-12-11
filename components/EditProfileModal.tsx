import React, { useState, useRef, useEffect } from "react";
import { X, Camera, Save, Loader } from "lucide-react";
import { User } from "../types";
import { api } from "../services/api"; // Certifique-se de importar a api

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export function EditProfileModal({ isOpen, onClose, user, onUpdate }: EditProfileModalProps) {
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  
  // PREVIEWS (Para mostrar na tela)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.profileImageUrl || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // ARQUIVOS REAIS (Para enviar pro Backend) - NOVO!
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(user.username);
      setBio(user.bio || "");
      setAvatarPreview(user.profileImageUrl || null);
      // setBannerPreview(user.coverImageUrl || null);
      setAvatarFile(null); // Reseta o arquivo ao abrir
      setBannerFile(null); // Reseta o arquivo ao abrir
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Cria Preview
      const objectUrl = URL.createObjectURL(file);
      
      if (type === 'avatar') {
        setAvatarPreview(objectUrl);
        setAvatarFile(file); // 2. Guarda o arquivo real no estado
      } else {
        setBannerPreview(objectUrl);
        setBannerFile(file); // 2. Guarda o arquivo real no estado
      }
    }
  };

  // --- AQUI ESTAVA O PROBLEMA, AGORA CORRIGIDO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Cria o FormData (Pacote de dados mistos)
      const formData = new FormData();
      
      // Adiciona os textos
      formData.append("username", username);
      formData.append("bio", bio);

      // Adiciona os arquivos APENAS se o usuário trocou
      if (avatarFile) {
        formData.append("profileImage", avatarFile); // Nome deve bater com o Backend Java
      }
      
      if (bannerFile) {
        formData.append("coverImage", bannerFile);
      }

      // 2. Chama a nova função da API
      const updatedUser = await api.updateProfileData(user.id, formData);

      // 3. Sucesso
      onUpdate(updatedUser);
      onClose();
      
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Editar Perfil</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* BANNER */}
          <div className="relative">
            <div className="h-32 bg-gray-200 relative group">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-black/80 transition backdrop-blur-sm"
                >
                  <Camera size={16} />
                  Alterar Capa
                </button>
              </div>
              <input 
                type="file" 
                ref={bannerInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleImageChange(e, 'banner')}
              />
            </div>

            {/* AVATAR */}
            <div className="absolute -bottom-10 left-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-indigo-100 overflow-hidden shadow-md">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-indigo-600">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full border-2 border-white shadow-sm hover:bg-indigo-700 transition"
                >
                  <Camera size={14} />
                </button>
                <input 
                    type="file" 
                    ref={avatarInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleImageChange(e, 'avatar')}
                />
              </div>
            </div>
          </div>

          {/* INPUTS */}
          <div className="px-6 pt-12 pb-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome de Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Biografia</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={160}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none text-gray-800"
              />
              <p className="text-right text-xs text-gray-400 mt-1">{bio.length}/160</p>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancelar</button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}