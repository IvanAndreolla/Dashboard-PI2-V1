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
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <Lock className="text-blue-700" />
          </div>

          <h1 className="text-2xl font-bold">Acesso administrativo</h1>

          <p className="text-sm text-gray-500 mt-1">
            Entre com uma conta autorizada para configurar boias, sensores e usuários.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@hydra.local"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {erro && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-400 text-center">
          Acesso restrito a usuários cadastrados.
        </div>
      </div>
    </div>
  );
}