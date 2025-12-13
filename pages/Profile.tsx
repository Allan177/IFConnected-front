import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Link as LinkIcon, Edit3, Grid, ArrowLeft, Camera, UserPlus, Check } from 'lucide-react';
import { User, Post } from '../types';
import { api } from '../services/api';

interface ProfileProps {
  viewingId: number;           // ID do perfil que queremos ver (pode ser o meu ou de outro)
  currentUser: User | null;    // Eu (logado)
  onBack: () => void;
  onEditProfile: () => void;
  onUpdateImage?: (type: 'avatar' | 'banner', file: File) => void;
}

const Profile = ({ viewingId, currentUser, onBack, onEditProfile, onUpdateImage }: ProfileProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'midia' | 'curtidas'>('posts');
  
  // O perfil agora carrega os dados de quem estamos visitando
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Estados de Preview (Manter lógica anterior)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // 1. VERIFICA SE O PERFIL É O MEU
  const isMyProfile = currentUser?.id === viewingId;

  // 2. BUSCA OS DADOS DO USUÁRIO NA API
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Se for meu perfil e eu já tenho os dados atualizados no App.tsx, uso eles
        if (isMyProfile && currentUser) {
            setProfileUser(currentUser);
        } else {
            // Se for de outra pessoa, busco na API
            const data = await api.getUserById(viewingId);
            setProfileUser(data);
            
            // Aqui você verificaria se já segue o usuário (mockado por enquanto)
            setIsFollowing(false); 
        }
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [viewingId, currentUser, isMyProfile]);

  // Sincroniza imagens quando carrega
  useEffect(() => {
    if (profileUser) {
        setAvatarPreview(profileUser.profileImageUrl || null);
        setBannerPreview(profileUser.coverImageUrl || null);
    }
  }, [profileUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;
    setIsFollowing(!isFollowing); // Otimista (muda na hora)
    await api.followUser(currentUser.id, profileUser.id);
  };

  // Mantive sua função de upload, mas ela só funciona se isMyProfile for true
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    if (!onUpdateImage) return;
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      if (type === 'avatar') setAvatarPreview(objectUrl);
      else setBannerPreview(objectUrl);
      onUpdateImage(type, file);
    }
  };

  if (loading || !profileUser) {
    return <div className="min-h-screen flex items-center justify-center"><p>Carregando perfil...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="font-bold text-lg text-gray-900">{profileUser.username}</h2>
                <p className="text-xs text-gray-500">Perfil do usuário</p>
            </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          
          {/* BANNER (Só editável se for meu perfil) */}
          <div className={`h-32 relative ${isMyProfile ? 'group cursor-pointer' : ''} bg-gray-200`}>
            {bannerPreview ? (
                <img src={bannerPreview} alt="Capa" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            )}
            
            {isMyProfile && (
                <>
                    <div onClick={() => bannerInputRef.current?.click()} className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <Camera className="text-white" />
                    </div>
                    <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                </>
            )}
          </div>

          <div className="px-6 pb-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-4">
              
              {/* AVATAR */}
              <div className={`relative w-24 h-24 rounded-full border-4 border-white bg-indigo-100 shadow-sm overflow-hidden ${isMyProfile ? 'group cursor-pointer' : ''}`}>
                {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-indigo-700">
                        {profileUser.username.charAt(0).toUpperCase()}
                    </div>
                )}
                
                {isMyProfile && (
                    <>
                        <div onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                        </div>
                        <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                    </>
                )}
              </div>
              
              {/* --- BOTÕES DE AÇÃO (A Mágica acontece aqui) --- */}
              {isMyProfile ? (
                  <button onClick={onEditProfile} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition shadow-sm text-sm">
                    <Edit3 size={16} /> Editar Perfil
                  </button>
              ) : (
                  <button 
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition shadow-sm text-sm ${
                        isFollowing 
                        ? 'bg-white border border-gray-200 text-gray-900 hover:text-red-600 hover:border-red-200' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isFollowing ? (
                        <><span>Seguindo</span></>
                    ) : (
                        <><UserPlus size={16} /> Seguir</>
                    )}
                  </button>
              )}
            </div>

            {/* Infos do Usuário */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profileUser.username}</h1>
              <p className="text-gray-500 font-medium">@{profileUser.username}</p>
              <p className="mt-3 text-gray-800 leading-relaxed text-sm">{profileUser.bio || "Sem biografia."}</p>
              
              <div className="flex gap-6 mt-5 pt-5 border-t border-gray-100 text-sm">
                 <div className="flex gap-1"><span className="font-bold">120</span> <span className="text-gray-500">Seguindo</span></div>
                 <div className="flex gap-1"><span className="font-bold">450</span> <span className="text-gray-500">Seguidores</span></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Placeholder do Feed do Usuário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Grid size={48} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">Posts de {profileUser.username}</h3>
            <p className="text-gray-500 text-sm">Em breve você verá os posts aqui.</p>
        </div>

      </div>
    </div>
  );
};

export default Profile;