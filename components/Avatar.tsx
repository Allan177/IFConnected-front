import React from "react";

interface AvatarProps {
  name: string;
  src?: string; // URL da imagem (opcional)
  size?: "sm" | "md" | "lg" | "xl"; // Adicionei XL para o modal
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = "md" }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  // Se tiver imagem (src), renderiza ela
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shrink-0 bg-white`}
        onError={(e) => {
          // Se a imagem falhar (link quebrado), esconde e mostra o fallback
          e.currentTarget.style.display = "none";
          e.currentTarget.parentElement?.classList.remove("bg-white"); // Remove fundo branco
        }}
      />
    );
  }

  // Fallback: Bolinha com inicial
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200 shrink-0`}
    >
      {initial}
    </div>
  );
};
