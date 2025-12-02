import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Button } from './Button';
import { LogIn, AlertCircle, WifiOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.login({ username, email });
      onLogin(user);
    } catch (err: any) {
      // Se chegamos aqui, nem o Mock funcionou (erro grave de JS)
      setError(err.message || 'Erro inesperado. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">IFConnected</h1>
          <p className="text-slate-500 mt-2">Sua mini rede social minimalista.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome de Usuário</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="ex: joaosilva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="joao@exemplo.com"
            />
          </div>
          
          {/* Informational Banner about CORS/Backend */}
          <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2 items-start border border-blue-100">
            <WifiOff size={14} className="shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Nota:</strong> Se o backend (Porta 8080) estiver indisponível ou bloquear por CORS, o sistema entrará automaticamente em <strong>Modo de Demonstração</strong> para você testar a interface.
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl flex gap-3 items-start border border-red-100">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="whitespace-pre-line leading-relaxed">{error}</div>
            </div>
          )}

          <Button type="submit" className="w-full py-3 text-base" isLoading={loading}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};