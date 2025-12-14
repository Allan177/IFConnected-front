import { ReactNode } from "react";

// Este layout é simples: centraliza o conteúdo.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 transition-colors">
      {children}
    </div>
  );
}
