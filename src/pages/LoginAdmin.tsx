import { useState } from "react";
import { Lock } from "lucide-react";
import {
  login,
  salvarToken,
  salvarUsuario,
} from "../services/auth";

interface Props {
  onLogin: () => void;
}

export function LoginAdmin({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await login(email, senha);

      salvarToken(resposta.token);
      salvarUsuario(resposta.usuario);

      onLogin();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao fazer login.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="p-6 flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(212,175,55,0.05)] border border-slate-100 dark:border-gold-500/20 p-8 transition-colors duration-500">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-gold-500/10 flex items-center justify-center mb-4 border border-blue-100 dark:border-gold-500/20 shadow-inner">
            <Lock className="text-blue-600 dark:text-gold-500 w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Acesso <span className="text-blue-600 dark:text-gold-500">Admin</span>
          </h1>

          <p className="text-xs font-semibold text-slate-500 dark:text-gold-500/50 uppercase tracking-widest mt-2">
            Autenticação Segura
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gold-500/70 mb-2">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-gold-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-gold-500 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-gold-500/50 transition-all"
              placeholder="admin@hydra.local"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gold-500/70 mb-2">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-gold-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-gold-500 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-gold-500/50 transition-all"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {erro && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl border border-red-200 dark:border-red-900/50 text-center">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 dark:bg-gold-500 text-white dark:text-black py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl dark:shadow-gold-500/10 mt-4"
          >
            {carregando ? "Autenticando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-8 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gold-500/30 text-center border-t border-slate-100 dark:border-gold-500/10 pt-6">
          Acesso restrito a pessoal autorizado
        </div>
      </div>
    </div>
  );
}