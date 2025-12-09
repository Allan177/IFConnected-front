import React, { useState } from "react";
import { User } from "../types";
import { api } from "../services/api"; // Certifique-se que existe um método para criar user
import { Button } from "./Button";
import { UserPlus, AlertCircle, WifiOff, ArrowLeft } from "lucide-react";

interface RegisterProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void; // Nova prop para navegar entre telas
}

export const Register: React.FC<RegisterProps> = ({
  onRegister,
  onSwitchToLogin,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Geralmente a rota POST /api/users serve para cadastrar
      // Se seu arquivo api.ts não tiver 'register', use o método que faz o POST
      const user = await api.register({ username, email });
      onRegister(user);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black/10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 relative overflow-hidden">
        {/* Header Visual */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Crie sua conta</h1>
          <p className="text-slate-500 mt-2">
            Junte-se ao IFConnected hoje mesmo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Escolha seu Usuário
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="ex: novousuario"
            />
            <p className="text-xs text-slate-400 mt-1 ml-1">
              Será seu nome público na rede.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Seu melhor Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="voce@exemplo.com"
            />
          </div>

          {/* Aviso sobre o Backend (Mantendo a consistência com o Login) */}
          <div className="p-3 bg-indigo-50 text-indigo-700 text-xs rounded-lg flex gap-2 items-start border border-indigo-100">
            <WifiOff size={14} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Info:</strong> Ao clicar em cadastrar, você será conectado
              diretamente ao backend na porta 8080.
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl flex gap-3 items-start border border-red-100 animate-pulse">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="whitespace-pre-line leading-relaxed">{error}</div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3 text-base font-semibold shadow-indigo-200 shadow-lg"
            isLoading={loading}
          >
            Cadastrar Gratuitamente
          </Button>
        </form>

        {/* Footer: Link para voltar ao Login */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm mb-3">Já tem uma conta?</p>
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors hover:underline"
          >
            <ArrowLeft size={16} />
            Voltar para o Login
          </button>
        </div>
      </div>
    </div>
  );
};
