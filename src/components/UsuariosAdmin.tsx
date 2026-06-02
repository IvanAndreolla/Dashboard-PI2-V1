import { useEffect, useState } from "react";
import { obterToken } from "../services/auth";

const API_URL = "";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
  ativo: boolean;
  createdAt: string;
}

export function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<Usuario["role"]>("OPERATOR");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function carregarUsuarios() {
    try {
      const resposta = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${obterToken()}`,
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao carregar usuários");
      }

      setUsuarios(await resposta.json());
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar usuários.");
    }
  }

  async function criarUsuario(event: React.FormEvent) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${obterToken()}`,
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          role,
        }),
      });

      if (!resposta.ok) {
        const erroApi = await resposta.json();
        throw new Error(erroApi.error || "Erro ao criar usuário");
      }

      setNome("");
      setEmail("");
      setSenha("");
      setRole("OPERATOR");

      await carregarUsuarios();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Erro ao criar usuário.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function desativarUsuario(id: string) {
    const confirmar = confirm("Deseja desativar este usuário?");

    if (!confirmar) return;

    try {
      const resposta = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${obterToken()}`,
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao desativar usuário");
      }

      await carregarUsuarios();
    } catch (error) {
      console.error(error);
      setErro("Erro ao desativar usuário.");
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <div>
        <h2 className="font-bold text-lg">Usuários administrativos</h2>
        <p className="text-sm text-gray-500">
          Cadastre usuários autorizados para acessar o painel administrativo.
        </p>
      </div>

      {erro && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
          {erro}
        </div>
      )}

      <form onSubmit={criarUsuario} className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border rounded-lg px-3 py-2"
          placeholder="Nome"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-lg px-3 py-2"
          placeholder="E-mail"
        />

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="border rounded-lg px-3 py-2"
          placeholder="Senha"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Usuario["role"])}
          className="border rounded-lg px-3 py-2"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="OPERATOR">OPERATOR</option>
          <option value="VIEWER">VIEWER</option>
        </select>

        <button
          type="submit"
          disabled={carregando}
          className="bg-blue-700 text-white rounded-lg px-4 py-2 hover:bg-blue-800 disabled:bg-gray-400"
        >
          {carregando ? "Salvando..." : "Cadastrar"}
        </button>
      </form>

      <div className="overflow-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3 border">Nome</th>
              <th className="text-left p-3 border">E-mail</th>
              <th className="text-left p-3 border">Permissão</th>
              <th className="text-left p-3 border">Status</th>
              <th className="text-left p-3 border">Ações</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="p-3 border">{usuario.nome}</td>
                <td className="p-3 border">{usuario.email}</td>
                <td className="p-3 border">{usuario.role}</td>
                <td className="p-3 border">
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </td>
                <td className="p-3 border">
                  {usuario.ativo && (
                    <button
                      onClick={() => desativarUsuario(usuario.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Desativar
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}