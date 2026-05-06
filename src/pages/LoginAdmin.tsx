import { useState } from "react";
import { Lock } from "lucide-react";

interface Props {
  onLogin: () => void;
}

export function LoginAdmin({ onLogin }: Props) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (usuario === "admin" && senha === "hydra123") {
      setErro("");
      onLogin();
      return;
    }

    setErro("Usuário ou senha inválidos.");
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
            Entre para configurar boias e enviar dados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
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
            />
          </div>

          {erro && (
            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-400 text-center">
          Login temporário de desenvolvimento.
        </div>
      </div>
    </div>
  );
}