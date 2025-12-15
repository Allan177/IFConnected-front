"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User as UserIcon, MapPin, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
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

export default function Sidebar({ user }: { user: User }) {
  const { logout } = useAuth();

  // O ID do usuário logado é essencial para o link de perfil
  const userId = user.id;

  return (
    <aside className="w-[275px] hidden md:flex flex-col p-4 fixed h-screen z-20">
      <div className="flex flex-col items-center xl:items-start space-y-2">
        {/* Logo Estilo X */}
        <div className="p-3 mb-4">
          <span className="font-extrabold text-3xl text-sky-500">
            IFconnect
          </span>
        </div>

        <NavItem href="/feed" icon={Home} label="Feed Principal" />
        <NavItem href="/regional" icon={MapPin} label="Campus & Perto" />
        <NavItem href={`/profile/${userId}`} icon={UserIcon} label="Perfil" />

        {/* Botão para Postar (Em breve) */}
        <button className="mt-4 bg-sky-400 0 text-white w-fit xl:w-full py-3 px-6 rounded-full font-bold text-lg shadow-lg hover:bg-sky-500 transition">
          <span className="xl:hidden">+</span>
          <span className="hidden xl:inline">Publicar</span>
        </button>
      </div>

      {/* Rodapé da Sidebar: Usuário Logado e Configuração */}
      <div className="mt-auto w-full">
        <div className="flex justify-between items-center w-full p-3 hover:bg-slate-100 dark:hover:bg-zinc-800/20 rounded-full transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800/10 rounded-full flex items-center justify-center font-bold text-white">
              {user.username[0].toUpperCase()}
            </div>
            <div className="hidden xl:block overflow-hidden">
              <p className="font-bold text-sm truncate">{user.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{user.email.split("@")[0]}
              </p>
            </div>
          </div>
          <ThemeToggle /> {/* Botão de Modo Escuro */}
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
