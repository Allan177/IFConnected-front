"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User as UserIcon,
  MapPin,
  LogOut,
  Bell,
  Calendar,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle"; // Se não usar, pode remover
import { useAuth } from "@/contexts/AuthContext";
import { User } from "../../types/index";

// Componente para um Item de Navegação (Reaproveitável)
const NavItem = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === "/feed" && pathname === "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-3 rounded-full transition-colors font-bold text-lg w-fit xl:w-full ${
        isActive
          ? "text-sky-700"
          : "text-slate-900 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-sky-700/20"
      }`}
    >
      <Icon size={26} className={isActive ? "text-sky-600" : ""} />
      <span className="hidden xl:inline">{label}</span>
    </Link>
  );
};

// Adicionei 'User | null' para o TypeScript não reclamar se vier vazio
export default function Sidebar({ user }: { user: User | null }) {
  const { logout } = useAuth();

  // 1. PROTEÇÃO DE ID:
  // Se user for nulo, userId vira undefined (não quebra a tela)
  const userId = user?.id;

  // Se o usuário não existir ainda, retornamos null ou um esqueleto simples
  // para evitar erros de renderização
  if (!user) return null; 

  return (
    <aside className="w-[275px] hidden md:flex flex-col p-4 fixed h-screen z-20">
      <div className="flex flex-col items-center xl:items-start space-y-2">
        {/* Logo */}
        <div className="p-3 mb-4">
          <span className="font-extrabold text-3xl text-sky-500">
            IFconnect
          </span>
        </div>
        
        <NavItem href="/feed" icon={Home} label="Feed Principal" />
        <NavItem href="/regional" icon={MapPin} label="Campus & Perto" />
        <NavItem href="/notifications" icon={Bell} label="Notificações" />
        <NavItem href="/events" icon={Calendar} label="Eventos" />
        
        {/* 2. PROTEÇÃO DE LINK: Só cria o link se tiver userId */}
        <NavItem 
          href={userId ? `/profile/${userId}` : "#"} 
          icon={UserIcon} 
          label="Perfil" 
        />
      </div>

      {/* Rodapé da Sidebar */}
      <div className="mt-auto w-full">
        <div className="flex justify-between items-center w-full p-3 hover:bg-slate-100 dark:hover:bg-zinc-800/20 rounded-full transition cursor-pointer">
          <div className="flex items-center gap-3">
            {/* Avatar com Proteção */}
            <div className="w-10 h-10 bg-zinc-800/10 rounded-full flex items-center justify-center font-bold text-white overflow-hidden">
                {/* Se tiver foto, mostra a foto, senão mostra a Inicial */}
                {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Avatar" className="w-full h-full object-cover"/>
                ) : (
                    <span className="text-gray-600 dark:text-gray-300">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                )}
            </div>
            
            <div className="hidden xl:block overflow-hidden">
              {/* 3. PROTEÇÃO DE NOME: Usa Optional Chaining */}
              <p className="font-bold text-sm truncate">
                {user?.username || "Usuário"}
              </p>
              
              {/* 4. PROTEÇÃO DE EMAIL: Já estava correta */}
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{user?.email?.split("@")?.[0] || "..."}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-2 flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800/10 cursor-pointer w-full px-4 py-2 rounded-lg transition text-sm font-bold"
        >
          <LogOut size={18} />{" "}
          <span className="hidden xl:inline">Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}