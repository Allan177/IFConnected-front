"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { CreatePost } from "./components/CreatePost";
import { PostCard } from "./components/PostCard";
import { User, Post } from "./types";
import { api } from "./services/api";
import { Avatar } from "./components/Avatar";
import Profile from "./pages/Profile"; 
import { EditProfileModal } from "./components/EditProfileModal";

import { LogOut, Globe, Users } from "lucide-react";

export default function App() {
  
  // 1. CORREÇÃO DO F5: Inicializa lendo do LocalStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("ifconnect_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authView, setAuthView] = useState<"login" | "register">("login");

  // Estados de Navegação
  const [currentView, setCurrentView] = useState<"feed" | "profile">("feed");
  const [viewingProfileId, setViewingProfileId] = useState<number | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. EFEITO PARA SALVAR SESSÃO: Sempre que o usuário muda, salva no navegador
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("ifconnect_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("ifconnect_user");
    }
  }, [currentUser]);

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return;
    setLoadingPosts(true);
    setError(null);
    try {
      let data: Post[] = [];
      if (activeTab === "global") {
        data = await api.getAllPosts();
      } else {
        data = await api.getFriendsFeed(currentUser.id);
      }

      const sorted = data.sort((a, b) => {
        if (typeof a.id === "number") return b.id - a.id;
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });

      setPosts(sorted);
    } catch (err) {
      console.error(err);
      setError("Could not load posts. Backend might be offline.");
    } finally {
      setLoadingPosts(false);
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (currentUser && currentView === "feed") {
      fetchPosts();
    }
  }, [fetchPosts, currentUser, currentView]);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  // 3. FUNÇÃO DE NAVEGAÇÃO: Chamada ao clicar em qualquer avatar
  const handleNavigateToProfile = (userId: number) => {
    setViewingProfileId(userId);
    setCurrentView("profile");
    window.scrollTo(0, 0);
  };

  // 4. ATUALIZAÇÃO RÁPIDA DE IMAGEM (Fora do Modal)
  const handleQuickImageUpdate = async (type: 'avatar' | 'banner', file: File) => {
    if (!currentUser) return;
  
    try {
      const formData = new FormData();
      // Reenvia dados atuais para não perder
      formData.append("username", currentUser.username);
      if (currentUser.bio) formData.append("bio", currentUser.bio);
  
      // Anexa a imagem nova
      if (type === 'avatar') {
          formData.append("profileImage", file);
      } else {
          formData.append("coverImage", file);
      }
  
      const updatedUser = await api.updateProfileData(currentUser.id, formData);
      setCurrentUser(updatedUser); // Atualiza estado global
  
    } catch (error) {
      console.error("Erro ao atualizar imagem rápida:", error);
      alert("Erro ao salvar imagem.");
    }
  };

  // --- LÓGICA DE LOGIN/REGISTER ---
  if (!currentUser) {
    if (authView === "register") {
      return (
        <Register
          onRegister={setCurrentUser}
          onSwitchToLogin={() => setAuthView("login")}
        />
      );
    }
    return (
      <Login
        onLogin={setCurrentUser}
        onSwitchToRegister={() => setAuthView("register")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo - Volta pro Feed */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => setCurrentView("feed")} 
          >
            <div className="w-8 h-8">
              <img
                src="/resources/logo3.png"
                className="w-full h-full object-contain"
                alt="Logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <span className="font-bold text-lg text-indigo-600 tracking-tight hidden sm:block">
              IF Connect
            </span>
          </div>

          {/* LADO DIREITO: Meu Perfil */}
          <div className="flex items-center gap-3">
            <div 
                className="text-right hidden sm:block cursor-pointer"
                onClick={() => handleNavigateToProfile(currentUser.id)} // Vai pro meu ID
            >
              <p className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition">
                {currentUser.username}
              </p>
            </div>

            <div 
                onClick={() => handleNavigateToProfile(currentUser.id)} 
                className="cursor-pointer"
            >
                <Avatar
                name={currentUser.username}
                src={currentUser.profileImageUrl}
                />
            </div>

            <button
              onClick={() => setCurrentUser(null)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-xl mx-auto px-0 sm:px-4 py-6">
        
        {/* VIEW: PERFIL */}
        {currentView === "profile" && viewingProfileId ? (
            <Profile 
              viewingId={viewingProfileId}          // ID do perfil que quero ver
              currentUser={currentUser}             // Quem sou eu (pra saber se edito ou sigo)
              onBack={() => setCurrentView("feed")} 
              onEditProfile={() => setIsEditModalOpen(true)}
              onUpdateImage={handleQuickImageUpdate} // Função de update rápido
            />
        ) : (
            
        /* VIEW: FEED */
        <>
            {/* CRIAÇÃO DE POST */}
            <div className="px-4 sm:px-0 mb-6">
            <CreatePost
                currentUser={currentUser}
                onPostCreated={handlePostCreated}
            />
            </div>

            {/* ABAS */}
            <div className="flex border-b border-slate-200 mb-6 bg-white sm:rounded-xl shadow-sm sticky top-16 z-40 mx-4 sm:mx-0 overflow-hidden">
            <button
                onClick={() => setActiveTab("global")}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all relative
                ${activeTab === "global" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"}`}
            >
                <Globe size={18} /> Global
                {activeTab === "global" && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
            </button>

            <button
                onClick={() => setActiveTab("friends")}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all relative
                ${activeTab === "friends" ? "text-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"}`}
            >
                <Users size={18} /> Seguindo
                {activeTab === "friends" && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
            </button>
            </div>

            {/* STATUS */}
            <div className="px-4 sm:px-0 mb-4 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === "global" ? "Explorar Tudo" : "Seus Amigos"}
            </h2>
            {loadingPosts && <span className="text-xs text-indigo-500 font-bold animate-pulse">CARREGANDO...</span>}
            </div>

            {/* LISTA DE POSTS */}
            <div className="space-y-4 px-4 sm:px-0">
            {error ? (
                <div className="text-center py-10 bg-white rounded-xl border border-red-100 p-6">
                <p className="text-red-500 mb-2">{error}</p>
                <button onClick={() => fetchPosts()} className="text-indigo-600 font-bold text-sm">Tentar Novamente</button>
                </div>
            ) : posts.length === 0 && !loadingPosts ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    {activeTab === "global" ? <Globe size={24} /> : <Users size={24} />}
                </div>
                <p className="text-slate-500 font-medium">Nenhum post aqui ainda.</p>
                </div>
            ) : (
                posts.map((post) => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser} 
                    onUserClick={handleNavigateToProfile} // <--- Passamos a navegação aqui
                />
                ))
            )}
            </div>
        </>
        )}
      </main>

      {/* MODAL DE EDIÇÃO */}
      {currentUser && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          user={currentUser}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}
    </div>
  );
}