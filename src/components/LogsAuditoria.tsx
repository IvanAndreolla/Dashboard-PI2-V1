import { useEffect, useState } from "react";
import { obterToken } from "../services/auth";

const API_URL = "/api";

interface AuditLog {
  id: string;
  usuarioId: string | null;
  acao: string;
  detalhes: any;
  ip: string | null;
  createdAt: string;
}

export function LogsAuditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregarLogs() {
    try {
      const resposta = await fetch(`${API_URL}/audit`, {
        headers: {
          Authorization: `Bearer ${obterToken()}`,
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao carregar logs do sistema");
      }

      setLogs(await resposta.json());
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar logs.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLogs();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">Logs de Auditoria do Sistema</h2>
          <p className="text-sm text-gray-500">
            Rastro de atividades e alterações de configuração realizadas no painel.
          </p>
        </div>
        <button
          onClick={carregarLogs}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
        >
          Atualizar Logs
        </button>
      </div>

      {erro && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
          {erro}
        </div>
      )}

      <div className="overflow-auto max-h-[600px] border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 sticky top-0 shadow-sm">
            <tr>
              <th className="text-left p-3 border-b">Data e Hora</th>
              <th className="text-left p-3 border-b">Ação</th>
              <th className="text-left p-3 border-b">Usuário ID</th>
              <th className="text-left p-3 border-b">IP</th>
              <th className="text-left p-3 border-b">Detalhes</th>
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="p-3 border-b whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="p-3 border-b font-medium text-gray-700">
                  {log.acao}
                </td>
                <td className="p-3 border-b">
                  {log.usuarioId || "Sistema"}
                </td>
                <td className="p-3 border-b">
                  {log.ip || "Desconhecido"}
                </td>
                <td className="p-3 border-b font-mono text-xs text-gray-600 bg-gray-50 rounded">
                  {log.detalhes ? JSON.stringify(log.detalhes) : "-"}
                </td>
              </tr>
            ))}

            {!carregando && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhum log encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
