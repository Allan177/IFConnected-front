"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
// 1. Import do Botão Google
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login Padrão (Email/Senha)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await api.login({ email, password });
      login(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

 const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    setLoading(true);
    try {
      // 1. Chama o backend
      const data = await api.loginGoogle(credentialResponse.credential);
      
      // 2. data agora é { token: "...", user: { id: ..., campusId: ... } }
      if (data.token && data.user) {
        localStorage.setItem("ifconnected:token", data.token);
        
        // 3. Usa o objeto 'user' que veio direto na resposta
        login(data.user); // Atualiza o contexto global

        // 4. Redirecionamento baseado no Campus
        if (!data.user.campusId) {
          window.location.href = "/complete-profile";
        } else {
          window.location.href = "/feed";
        }
      }
    } catch (err: any) {
      console.error("Erro Google", err);
      setError("Falha ao autenticar com Google.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 dark:border-zinc-800">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mb-2">
            IFconnected
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Bem-vindo de volta 👋
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              {error}
            </span>
          </div>
        )}

        {/* Formulário Padrão */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Email institucional
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nome@ifpb.edu.br"
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* --- DIVISOR "OU" --- */}
        <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-200 dark:border-zinc-700"></div>
            <span className="px-4 text-xs font-bold text-slate-400 uppercase">OU</span>
            <div className="flex-1 border-t border-slate-200 dark:border-zinc-700"></div>
        </div>

        {/* --- BOTÃO GOOGLE --- */}
        <div className="flex justify-center w-full">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Login com Google falhou')}
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
                width="100%" // Tenta ocupar largura total, mas o componente tem limite
                locale="pt-BR"
            />
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ainda não faz parte?{" "}
            <Link
              href="/register"
              className="font-bold text-sky-500 hover:text-sky-600 hover:underline decoration-2 underline-offset-2"
            >
              Criar conta agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

