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
  theme?: "light" | "dark";
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
  link.download = `historico_${boiaNome.toLowerCase().split(" ").join("_")}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

export function Historico({ boias, data, theme }: Props) {
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
    <div className="p-8 lg:p-12 space-y-12 bg-slate-50 dark:bg-black min-h-screen transition-colors duration-500">
      <div className="border-b border-slate-200 dark:border-gold-500/20 pb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-gold-500 tracking-tight uppercase">Histórico de Dados</h1>
        <p className="text-slate-500 dark:text-gold-500/50 font-medium">
          Análise retroativa e exportação de logs hidrológicos processados.
        </p>
      </div>

      <div className="bg-white dark:bg-black rounded-[3rem] shadow-xl dark:shadow-gold-500/5 border border-slate-100 dark:border-gold-500/20 p-10 space-y-8">
        <h2 className="font-black text-xl text-slate-900 dark:text-gold-500 uppercase tracking-tight">Filtros Avançados</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gold-500/50">Estação de Origem</label>
            <select
              value={boiaId}
              onChange={(e) => trocarBoia(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-gold-500/20 rounded-xl px-4 py-3 text-slate-700 dark:text-gold-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-gold-500 outline-none transition-all"
            >
              {boiasHabilitadas.map((boia) => (
                <option key={boia.id} value={boia.id}>
                  {boia.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gold-500/50">
              Marco Inicial
            </label>
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-gold-500/20 rounded-xl px-4 py-3 text-slate-700 dark:text-gold-500 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-gold-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gold-500/50">
              Marco Final
            </label>
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-gold-500/20 rounded-xl px-4 py-3 text-slate-700 dark:text-gold-500 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-gold-500"
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
              className="w-full bg-slate-900 dark:bg-gold-500 text-white dark:text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] disabled:opacity-30 transition-all"
            >
              Extrair Dataset (CSV)
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/50 uppercase tracking-widest mb-4">
            Matriz de Sensores Disponíveis
          </p>

          {parametrosDisponiveis.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-gold-500/30">
              A estação selecionada não possui sensores ativos configurados.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {parametrosDisponiveis.map((parametro) => (
                <label
                  key={parametro.key}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border ${parametrosAtivos.includes(String(parametro.key)) ? 'bg-slate-900 text-white border-slate-900 dark:bg-gold-500 dark:text-black dark:border-gold-500' : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-black dark:text-gold-500/40 dark:border-gold-500/10 hover:border-slate-300 dark:hover:border-gold-500/30'}`}
                >
                  <input
                    type="checkbox"
                    checked={parametrosAtivos.includes(String(parametro.key))}
                    onChange={() => toggleParametro(String(parametro.key))}
                    className="hidden"
                  />
                  {parametro.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { l: "Estação Alvo", v: boiaSelecionada?.nome || "-", i: "Sensor Node" },
          { l: "Amostras Sincronizadas", v: dadosFiltrados.length, i: "Time Series" },
          { l: "Parâmetros Ativos", v: parametrosAtivos.length, i: "Data Streams" }
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-black rounded-[2.5rem] shadow-lg border border-slate-100 dark:border-gold-500/20 p-8">
            <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/40 uppercase tracking-widest mb-2">{m.l}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-gold-500 tracking-tight truncate">{m.v}</p>
            <p className="text-[9px] font-bold text-slate-300 dark:text-gold-500/20 uppercase tracking-widest mt-2">{m.i}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-black rounded-[3rem] shadow-xl dark:shadow-gold-500/5 border border-slate-100 dark:border-gold-500/20 p-10 overflow-hidden">
        <h2 className="font-black text-2xl text-slate-900 dark:text-gold-500 mb-10 uppercase tracking-tight">Visualização de Tendências</h2>

        {dadosFiltrados.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-slate-400 dark:text-gold-500/30 font-black uppercase text-xs tracking-widest bg-slate-50 dark:bg-gold-500/5 rounded-[2rem] border border-dashed border-slate-200 dark:border-gold-500/10">
            Nenhum dado encontrado para o período especificado.
          </div>
        ) : (
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 40, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#d4af3720" : "#e2e8f0"} />

                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  height={80}
                  stroke={theme === "dark" ? "#d4af3760" : "#64748b"}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                />

                <YAxis width={80} stroke={theme === "dark" ? "#d4af3760" : "#64748b"} tick={{ fontSize: 10, fontWeight: 700 }} />

                <Tooltip 
                  contentStyle={{ backgroundColor: theme === "dark" ? "#000" : "#fff", borderColor: theme === "dark" ? "#d4af3740" : "#e2e8f0", borderRadius: "1rem", color: theme === "dark" ? "#d4af37" : "#000" }} 
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />

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
                      stroke={theme === "dark" ? "#d4af37" : parametro.color}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, stroke: "#000", strokeWidth: 2 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-black rounded-[3rem] shadow-xl dark:shadow-gold-500/5 border border-slate-100 dark:border-gold-500/20 p-10">
        <h2 className="font-black text-2xl text-slate-900 dark:text-gold-500 mb-10 uppercase tracking-tight">Logs Brutos</h2>

        {parametrosDisponiveis.length === 0 ? (
          <p className="text-slate-400 dark:text-gold-500/30 text-center py-10">
            Nenhum log operacional disponível para esta estação.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-gold-500/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-gold-500/10 text-slate-400 dark:text-gold-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-gold-500/20">
                  <th className="py-5 px-6">Timestamp Operacional</th>

                  {parametrosDisponiveis.map((parametro) => (
                    <th key={parametro.key} className="py-5 px-6">
                      {parametro.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-gold-500/10 text-slate-700 dark:text-gold-500/80">
                {dadosFiltrados.slice(-50).map((leitura, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-gold-500/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-xs">{leitura.timestamp}</td>

                    {parametrosDisponiveis.map((parametro) => (
                      <td key={parametro.key} className="py-4 px-6 font-medium text-xs">
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
          <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/30 mt-6 uppercase tracking-widest text-center">
            Dataset truncado: exibindo as últimas 50 amostras do período.
          </p>
        )}
      </div>
    </div>
  );
}