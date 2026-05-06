import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  BoiaConfig,
  EnvironmentalData,
  SensorConfig,
  SensoresBoia,
} from "../types";

interface Props {
  boias: BoiaConfig[];
  data: EnvironmentalData[];
}

type Parametro = {
  key: keyof EnvironmentalData;
  label: string;
  unidade: string;
  color: string;
};

const cores: Record<string, string> = {
  tempAr: "#2563eb",
  umidAr: "#16a34a",
  pressao: "#9333ea",
  indiceUV: "#f59e0b",
  chuvaAcum: "#0ea5e9",
  ventoVel: "#dc2626",
  ventoDir: "#64748b",

  tempAgua: "#0891b2",
  phAgua: "#16a34a",
  condutivEC: "#7c3aed",
  turbidez: "#f59e0b",
};

const ordemSensores: (keyof SensoresBoia)[] = [
  "tempAgua",
  "phAgua",
  "turbidez",
  "condutivEC",
  "tempAr",
  "umidAr",
  "pressao",
  "indiceUV",
  "chuvaAcum",
  "ventoVel",
  "ventoDir",
];

function sensorAtivo(sensor?: SensorConfig) {
  return sensor?.ativo === true;
}

function criarParametrosDaBoia(boia?: BoiaConfig): Parametro[] {
  if (!boia) return [];

  return ordemSensores
    .filter((chave) => sensorAtivo(boia.sensores[chave]))
    .map((chave) => {
      const sensor = boia.sensores[chave];

      return {
        key: chave as keyof EnvironmentalData,
        label: sensor?.nome || String(chave),
        unidade: sensor?.unidade || "",
        color: cores[String(chave)] || "#2563eb",
      };
    });
}

function converterData(timestamp: string) {
  return new Date(timestamp.replace(" ", "T"));
}

function formatarDataGrafico(timestamp: string) {
  const data = new Date(timestamp.replace(" ", "T"));

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarValor(valor: number, unidade: string) {
  if (unidade === "µS/cm") return `${valor.toFixed(0)} ${unidade}`;
  if (unidade === "pH") return `${valor.toFixed(2)} pH`;
  if (unidade === "°") return `${valor.toFixed(0)}°`;
  if (unidade === "") return valor.toFixed(2);
  return `${valor.toFixed(1)} ${unidade}`;
}

function baixarCSV(
  dados: EnvironmentalData[],
  boiaNome: string,
  parametros: Parametro[]
) {
  const cabecalho = [
    "boiaId",
    "timestamp",
    ...parametros.map((parametro) => String(parametro.key)),
  ].join(";");

  const linhas = dados.map((dado) =>
    [
      dado.boiaId,
      dado.timestamp,
      ...parametros.map((parametro) => dado[parametro.key]),
    ].join(";")
  );

  const conteudo = [cabecalho, ...linhas].join("\n");
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `historico_${boiaNome.toLowerCase().replaceAll(" ", "_")}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

export function Historico({ boias, data }: Props) {
  const boiasHabilitadas = boias.filter((boia) => boia.habilitada);

  const [boiaId, setBoiaId] = useState(boiasHabilitadas[0]?.id || "");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const boiaSelecionada = boias.find((boia) => boia.id === boiaId);
  const parametrosDisponiveis = criarParametrosDaBoia(boiaSelecionada);

  const [parametrosSelecionados, setParametrosSelecionados] = useState<
    string[]
  >([]);

  const parametrosAtivos =
    parametrosSelecionados.length > 0
      ? parametrosSelecionados
      : parametrosDisponiveis.slice(0, 3).map((p) => String(p.key));

  const dadosFiltrados = data.filter((leitura) => {
    if (leitura.boiaId !== boiaId) return false;

    const dataLeitura = converterData(leitura.timestamp);

    if (dataInicial) {
      const inicio = new Date(`${dataInicial}T00:00:00`);
      if (dataLeitura < inicio) return false;
    }

    if (dataFinal) {
      const fim = new Date(`${dataFinal}T23:59:59`);
      if (dataLeitura > fim) return false;
    }

    return true;
  });

  const chartData = dadosFiltrados.map((leitura) => ({
    name: formatarDataGrafico(leitura.timestamp),
    timestamp: leitura.timestamp,
    ...leitura,
  }));

  const toggleParametro = (key: string) => {
    setParametrosSelecionados((atual) => {
      const base =
        atual.length > 0
          ? atual
          : parametrosDisponiveis.slice(0, 3).map((p) => String(p.key));

      return base.includes(key)
        ? base.filter((item) => item !== key)
        : [...base, key];
    });
  };

  const trocarBoia = (novoId: string) => {
    setBoiaId(novoId);
    setParametrosSelecionados([]);
  };

  const parametrosParaExportar = parametrosDisponiveis.filter((parametro) =>
    parametrosAtivos.includes(String(parametro.key))
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico</h1>
        <p className="text-gray-500">
          Filtre leituras por boia, período e sensores configurados.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h2 className="font-bold text-lg">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Boia</label>
            <select
              value={boiaId}
              onChange={(e) => trocarBoia(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {boiasHabilitadas.map((boia) => (
                <option key={boia.id} value={boia.id}>
                  {boia.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Data inicial
            </label>
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Data final
            </label>
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                baixarCSV(
                  dadosFiltrados,
                  boiaSelecionada?.nome || "boia",
                  parametrosParaExportar
                )
              }
              disabled={dadosFiltrados.length === 0}
              className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 disabled:bg-gray-300"
            >
              Baixar CSV filtrado
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">
            Sensores disponíveis nesta boia
          </p>

          {parametrosDisponiveis.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum sensor ativo configurado para esta boia.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {parametrosDisponiveis.map((parametro) => (
                <label
                  key={parametro.key}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={parametrosAtivos.includes(String(parametro.key))}
                    onChange={() => toggleParametro(String(parametro.key))}
                  />
                  {parametro.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Boia selecionada</p>
          <p className="text-2xl font-bold">{boiaSelecionada?.nome || "-"}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Leituras filtradas</p>
          <p className="text-2xl font-bold">{dadosFiltrados.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Sensores selecionados</p>
          <p className="text-2xl font-bold">{parametrosAtivos.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-lg mb-4">Gráfico histórico</h2>

        {dadosFiltrados.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-500">
            Nenhuma leitura encontrada para os filtros selecionados.
          </div>
        ) : parametrosAtivos.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-500">
            Nenhum sensor selecionado para exibição.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 30, bottom: 45 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
                minTickGap={35}
              />

              <YAxis width={80} />

              <Tooltip />
              <Legend />

              {parametrosDisponiveis
                .filter((parametro) =>
                  parametrosAtivos.includes(String(parametro.key))
                )
                .map((parametro) => (
                  <Line
                    key={parametro.key}
                    type="monotone"
                    dataKey={parametro.key}
                    name={`${parametro.label}${
                      parametro.unidade ? ` (${parametro.unidade})` : ""
                    }`}
                    stroke={parametro.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-lg mb-4">Tabela de leituras</h2>

        {parametrosDisponiveis.length === 0 ? (
          <p className="text-gray-500">
            Nenhum sensor ativo configurado para esta boia.
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-3">Timestamp</th>

                  {parametrosDisponiveis.map((parametro) => (
                    <th key={parametro.key} className="py-2 px-3">
                      {parametro.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {dadosFiltrados.slice(-50).map((leitura, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-3">{leitura.timestamp}</td>

                    {parametrosDisponiveis.map((parametro) => (
                      <td key={parametro.key} className="py-2 px-3">
                        {formatarValor(
                          Number(leitura[parametro.key]),
                          parametro.unidade
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {dadosFiltrados.length > 50 && (
          <p className="text-xs text-gray-500 mt-3">
            Exibindo apenas as últimas 50 leituras filtradas.
          </p>
        )}
      </div>
    </div>
  );
}