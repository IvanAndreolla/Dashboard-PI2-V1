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
  SensoresBoia,
  SensorConfig,
} from "../types";

import { AlertaTipo, gerarAlertasBoia } from "../utils/alertas";

type Page =
  | "dashboard"
  | "boias"
  | "alertas"
  | "historico"
  | "boiaDetalhe"
  | "admin"
  | "mapa";

interface Props {
  boia: BoiaConfig;
  data: EnvironmentalData[];
  setPage: (page: Page) => void;
  theme?: "light" | "dark";
}

type ModoEscala = "real" | "normalizada" | "multieixo";

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

const sensoresAcima: (keyof SensoresBoia)[] = [
  "tempAr",
  "umidAr",
  "pressao",
  "indiceUV",
  "chuvaAcum",
  "ventoVel",
  "ventoDir",
];

const sensoresAbaixo: (keyof SensoresBoia)[] = [
  "tempAgua",
  "phAgua",
  "condutivEC",
  "turbidez",
];

function sensorAtivo(sensor?: SensorConfig) {
  return sensor?.ativo === true;
}

function criarParametros(
  boia: BoiaConfig,
  lista: (keyof SensoresBoia)[]
): Parametro[] {
  return lista
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

function formatarValor(valor: number, unidade: string) {
  if (unidade === "µS/cm") return `${valor.toFixed(0)} ${unidade}`;
  if (unidade === "pH") return `${valor.toFixed(2)} pH`;
  if (unidade === "°") return `${valor.toFixed(0)}°`;
  if (unidade === "") return valor.toFixed(2);
  return `${valor.toFixed(1)} ${unidade}`;
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

function normalizarValor(valor: number, minimo: number, maximo: number): number {
  if (maximo === minimo) return 50;
  return ((valor - minimo) / (maximo - minimo)) * 100;
}

function gerarChartData(
  data: EnvironmentalData[],
  parametros: Parametro[],
  modoEscala: ModoEscala
) {
  const ultimosDados = data.slice(-40);

  const minMaxPorParametro = parametros.reduce((acc, parametro) => {
    const valores = ultimosDados.map((item) => Number(item[parametro.key]));

    acc[parametro.key] = {
      min: Math.min(...valores),
      max: Math.max(...valores),
    };

    return acc;
  }, {} as Record<string, { min: number; max: number }>);

  return ultimosDados.map((item) => {
    const linha: Record<string, string | number> = {
      name: formatarDataGrafico(item.timestamp),
      timestamp: item.timestamp,
    };

    parametros.forEach((parametro) => {
      const valorReal = Number(item[parametro.key]);

      linha[parametro.key] =
        modoEscala === "normalizada"
          ? normalizarValor(
              valorReal,
              minMaxPorParametro[parametro.key].min,
              minMaxPorParametro[parametro.key].max
            )
          : valorReal;

      linha[`${String(parametro.key)}_real`] = valorReal;
    });

    return linha;
  });
}

function getYAxisId(parametro: Parametro, index: number, modoEscala: ModoEscala) {
  if (modoEscala !== "multieixo") return "left";

  if (parametro.unidade === "µS/cm") return "right";
  if (index % 2 === 0) return "left";

  return "right";
}

function getYAxisLabel(modoEscala: ModoEscala) {
  if (modoEscala === "normalizada") return "Escala normalizada (%)";
  if (modoEscala === "multieixo") return "Escalas independentes";
  return "Valor real";
}

function getAlertaClass(tipo: AlertaTipo) {
  switch (tipo) {
    case "critico":
      return "bg-red-50 border-red-500 dark:bg-black dark:border-gold-800";
    case "alerta":
      return "bg-yellow-50 border-yellow-500 dark:bg-black dark:border-gold-600";
    case "ok":
      return "bg-green-50 border-green-500 dark:bg-black dark:border-gold-500";
    default:
      return "bg-blue-50 border-blue-500 dark:bg-black dark:border-gold-900";
  }
}

function getStatusColor(status: string) {
  if (status === "critico") return "bg-red-500 dark:bg-gold-800";
  if (status === "alerta") return "bg-yellow-400 dark:bg-gold-600";
  if (status === "ok") return "bg-green-500 dark:bg-gold-500";
  return "bg-gray-400 dark:bg-gold-950";
}

export function BoiaDetalhe({ boia, data, setPage, theme }: Props) {
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const alertasBoia = gerarAlertasBoia(boia, data);

  const parametrosAcima = criarParametros(boia, sensoresAcima);
  const parametrosAbaixo = criarParametros(boia, sensoresAbaixo);
  const todosParametros = [...parametrosAcima, ...parametrosAbaixo];

  const [modoEscala, setModoEscala] = useState<ModoEscala>("real");

  const [selecionadosAcima, setSelecionadosAcima] = useState<string[]>(
    parametrosAcima.slice(0, 3).map((p) => String(p.key))
  );

  const [selecionadosAbaixo, setSelecionadosAbaixo] = useState<string[]>(
    parametrosAbaixo.slice(0, 3).map((p) => String(p.key))
  );

  const chartDataAcima = gerarChartData(data, parametrosAcima, modoEscala);
  const chartDataAbaixo = gerarChartData(data, parametrosAbaixo, modoEscala);

  const toggleParametro = (
    key: string,
    selecionados: string[],
    setSelecionados: (value: string[]) => void
  ) => {
    if (selecionados.includes(key)) {
      setSelecionados(selecionados.filter((item) => item !== key));
    } else {
      setSelecionados([...selecionados, key]);
    }
  };

  const yAxisLabel = getYAxisLabel(modoEscala);

  return (
    <div className="p-8 lg:p-12 space-y-10 bg-slate-50 dark:bg-black min-h-screen transition-colors duration-500">
      <button
        onClick={() => setPage("boias")}
        className="flex items-center gap-2 text-slate-400 dark:text-gold-500/50 hover:text-slate-900 dark:hover:text-gold-500 font-black uppercase text-[10px] tracking-[0.2em] transition-all"
      >
        <div className="p-2 bg-white dark:bg-gold-500/5 rounded-lg border border-slate-200 dark:border-gold-500/20">
           ← 
        </div>
        Retornar à Frota
      </button>

      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black dark:from-black dark:to-slate-950 text-white dark:text-gold-500 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl border border-slate-800 dark:border-gold-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-gold-500/5 rounded-full -mr-32 -mt-32"></div>
        
        <div className="w-48 h-48 bg-white dark:bg-gold-500/10 rounded-[2.5rem] p-6 shadow-2xl border border-white/10 dark:border-gold-500/20 relative z-10">
          <img
            src={boia.imagem}
            alt={boia.nome}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
          <div className="space-y-2">
             <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <h1 className="text-5xl font-black tracking-tighter uppercase">{boia.nome}</h1>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 dark:border-gold-500/30 flex items-center gap-2 bg-black/40 backdrop-blur-md text-white dark:text-gold-500`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(boia.status)} shadow-[0_0_8px_rgba(212,175,55,0.4)]`} />
                   {boia.status}
                </div>
             </div>
             <p className="text-slate-400 dark:text-gold-500/60 text-lg font-medium max-w-2xl">{boia.descricao}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
            <div className="flex flex-col gap-1">
               <span className="text-slate-500 dark:text-gold-500/40">Instituição</span>
               <span className="text-white dark:text-gold-500">{boia.instituicao}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10 dark:bg-gold-500/20 hidden md:block"></div>
            <div className="flex flex-col gap-1">
               <span className="text-slate-500 dark:text-gold-500/40">Localização</span>
               <span className="text-white dark:text-gold-500">{boia.local}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10 dark:bg-gold-500/20 hidden md:block"></div>
            <div className="flex flex-col gap-1">
               <span className="text-slate-500 dark:text-gold-500/40">Geolocalização</span>
               <span className="text-white dark:text-gold-500">{boia.latitude.toFixed(4)}, {boia.longitude.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-black p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-gold-500/20">
        <h2 className="text-xl font-black text-slate-900 dark:text-gold-500 mb-8 uppercase tracking-tight">Registro de Alertas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alertasBoia.map((alerta, index) => (
            <div
              key={index}
              className={`p-6 rounded-[2rem] border-l-[8px] border dark:border-gold-500/10 shadow-sm ${getAlertaClass(alerta.tipo)}`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/50 dark:bg-gold-500/10 text-slate-900 dark:text-gold-500 rounded-full border border-black/5 dark:border-gold-500/20">
                  {alerta.tipo}
                </span>

                {alerta.timestamp && (
                  <span className="text-[9px] font-bold text-slate-400 dark:text-gold-500/40 uppercase">
                    Log: {alerta.timestamp}
                  </span>
                )}
              </div>

              <p className="font-black text-slate-800 dark:text-gold-500 uppercase text-sm tracking-tight">{alerta.titulo}</p>
              <p className="text-xs text-slate-600 dark:text-gold-500/70 mt-1 font-medium">{alerta.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {latest ? (
        <>
          <div className="bg-white dark:bg-black p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-gold-500/20 flex flex-col lg:flex-row items-center justify-between gap-8 transition-all">
            <div className="text-center lg:text-left">
              <h2 className="font-black text-xl text-slate-900 dark:text-gold-500 uppercase tracking-tight">Normalização Analítica</h2>
              <p className="text-sm text-slate-400 dark:text-gold-500/40 mt-1">
                Ajuste o plano cartesiano para análise comparativa de métricas heterogêneas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 bg-slate-50 dark:bg-gold-500/5 p-2 rounded-[2rem] border border-slate-200 dark:border-gold-500/20 shadow-inner">
              {[
                { id: "real", label: "Valores Brutos" },
                { id: "normalizada", label: "Normalizada (%)" },
                { id: "multieixo", label: "Multi-Eixo" }
              ].map((modo) => (
                <button
                  key={modo.id}
                  onClick={() => setModoEscala(modo.id as ModoEscala)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    modoEscala === modo.id
                      ? "bg-slate-900 dark:bg-gold-500 text-white dark:text-black shadow-lg"
                      : "text-slate-400 dark:text-gold-500/30 hover:text-slate-900 dark:hover:text-gold-500 hover:bg-white dark:hover:bg-gold-500/10"
                  }`}
                >
                  {modo.label}
                </button>
              ))}
            </div>
          </div>

          {todosParametros.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {todosParametros.slice(0, 4).map((parametro) => (
                <div
                  key={parametro.key}
                  className="bg-white dark:bg-black p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-gold-500/20 group hover:-translate-y-1 transition-all duration-300"
                >
                  <h2 className="text-[10px] font-black text-slate-400 dark:text-gold-500/40 uppercase tracking-widest mb-3">{parametro.label}</h2>
                  <p className="text-4xl font-black text-blue-600 dark:text-gold-500 tracking-tighter">
                    {formatarValor(
                      Number(latest[parametro.key]),
                      parametro.unidade
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          {parametrosAcima.length > 0 && (
            <div className="bg-white dark:bg-black p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-gold-500/20 overflow-hidden">
              <div className="mb-8">
                <h2 className="font-black text-xl text-slate-900 dark:text-gold-500 uppercase tracking-tight">Matriz Atmosférica</h2>
                <p className="text-sm text-slate-400 dark:text-gold-500/40 mt-1">
                  Telemetria ambiental coletada acima da superfície hídrica.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mb-10">
                {parametrosAcima.map((parametro) => (
                  <label
                    key={parametro.key}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border ${selecionadosAcima.includes(String(parametro.key)) ? 'bg-slate-900 text-white dark:bg-gold-500 dark:text-black border-slate-900 dark:border-gold-500' : 'bg-slate-50 dark:bg-gold-500/5 text-slate-400 dark:text-gold-500/30 border-slate-200 dark:border-gold-500/10'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selecionadosAcima.includes(String(parametro.key))}
                      onChange={() =>
                        toggleParametro(
                          String(parametro.key),
                          selecionadosAcima,
                          setSelecionadosAcima
                        )
                      }
                      className="hidden"
                    />
                    {parametro.label}
                  </label>
                ))}
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartDataAcima}
                    margin={{ top: 20, right: 30, left: 30, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#d4af3720" : "#e2e8f0"} />

                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      height={60}
                      stroke={theme === "dark" ? "#d4af3760" : "#64748b"}
                      tick={{ fontSize: 10, fontWeight: 700 }}
                    />

                    <YAxis
                      yAxisId="left"
                      width={80}
                      stroke={theme === "dark" ? "#d4af3760" : "#64748b"}
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      domain={modoEscala === "normalizada" ? [0, 100] : ["auto", "auto"]}
                    />

                    {modoEscala === "multieixo" && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        width={80}
                        stroke={theme === "dark" ? "#d4af3760" : "#64748b"}
                        tick={{ fontSize: 10, fontWeight: 700 }}
                        domain={["auto", "auto"]}
                      />
                    )}

                    <Tooltip 
                        contentStyle={{ backgroundColor: theme === "dark" ? "#000" : "#fff", borderColor: theme === "dark" ? "#d4af3740" : "#e2e8f0", borderRadius: "1rem", color: theme === "dark" ? "#d4af37" : "#000" }} 
                        itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <Legend />

                    {parametrosAcima
                      .filter((parametro) =>
                        selecionadosAcima.includes(String(parametro.key))
                      )
                      .map((parametro, index) => (
                        <Line
                          key={parametro.key}
                          type="monotone"
                          dataKey={parametro.key}
                          yAxisId={getYAxisId(parametro, index, modoEscala)}
                          name={`${parametro.label}${
                            parametro.unidade ? ` (${parametro.unidade})` : ""
                          }`}
                          stroke={theme === "dark" ? "#d4af37" : parametro.color}
                          strokeWidth={3}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {parametrosAbaixo.length > 0 && (
            <div className="bg-white dark:bg-black p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-gold-500/20 overflow-hidden">
              <div className="mb-8">
                <h2 className="font-black text-xl text-slate-900 dark:text-gold-500 uppercase tracking-tight">Matriz Hidrológica</h2>
                <p className="text-sm text-slate-400 dark:text-gold-500/40 mt-1">
                  Qualidade da água e parâmetros submersos de alta precisão.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mb-10">
                {parametrosAbaixo.map((parametro) => (
                  <label
                    key={parametro.key}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border ${selecionadosAbaixo.includes(String(parametro.key)) ? 'bg-slate-900 text-white dark:bg-gold-500 dark:text-black border-slate-900 dark:border-gold-500' : 'bg-slate-50 dark:bg-gold-500/5 text-slate-400 dark:text-gold-500/30 border-slate-200 dark:border-gold-500/10'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selecionadosAbaixo.includes(
                        String(parametro.key)
                      )}
                      onChange={() =>
                        toggleParametro(
                          String(parametro.key),
                          selecionadosAbaixo,
                          setSelecionadosAbaixo
                        )
                      }
                      className="hidden"
                    />
                    {parametro.label}
                  </label>
                ))}
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartDataAbaixo}
                    margin={{ top: 20, right: 30, left: 30, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#d4af3720" : "#e2e8f0"} />

                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      height={60}
                      stroke={theme === "dark" ? "#d4af3760" : "#64748b"}
                      tick={{ fontSize: 10, fontWeight: 700 }}
                    />

                    <YAxis
                      yAxisId="left"
                      width={80}
                      stroke={theme === "dark" ? "#d4af3760" : "#64748b"}
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      domain={modoEscala === "normalizada" ? [0, 100] : ["auto", "auto"]}
                    />

                    {modoEscala === "multieixo" && (
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        width={80}
                        stroke={theme === "dark" ? "#d4af3760" : "#64748b"}
                        tick={{ fontSize: 10, fontWeight: 700 }}
                        domain={["auto", "auto"]}
                      />
                    )}

                    <Tooltip 
                        contentStyle={{ backgroundColor: theme === "dark" ? "#000" : "#fff", borderColor: theme === "dark" ? "#d4af3740" : "#e2e8f0", borderRadius: "1rem", color: theme === "dark" ? "#d4af37" : "#000" }} 
                        itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <Legend />

                    {parametrosAbaixo
                      .filter((parametro) =>
                        selecionadosAbaixo.includes(String(parametro.key))
                      )
                      .map((parametro, index) => (
                        <Line
                          key={parametro.key}
                          type="monotone"
                          dataKey={parametro.key}
                          yAxisId={getYAxisId(parametro, index, modoEscala)}
                          name={`${parametro.label}${
                            parametro.unidade ? ` (${parametro.unidade})` : ""
                          }`}
                          stroke={theme === "dark" ? "#d4af37" : parametro.color}
                          strokeWidth={3}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-black p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-gold-500/20">
            <h2 className="text-xl font-black text-slate-900 dark:text-gold-500 mb-8 uppercase tracking-tight">Última Janela de Valores</h2>

            {todosParametros.length === 0 ? (
              <p className="text-slate-400 dark:text-gold-500/30 italic">
                Nenhum stream de sensor ativo configurado.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todosParametros.map((parametro) => (
                  <div
                    key={parametro.key}
                    className="bg-slate-50 dark:bg-gold-500/5 border border-slate-100 dark:border-gold-500/20 rounded-2xl p-6 flex justify-between items-center transition-colors"
                  >
                    <span className="text-[10px] font-black text-slate-400 dark:text-gold-500/50 uppercase tracking-widest">{parametro.label}</span>
                    <strong className="text-slate-900 dark:text-gold-500 font-black tracking-tight">
                      {formatarValor(
                        Number(latest[parametro.key]),
                        parametro.unidade
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-black p-16 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-gold-500/20 text-center">
          <h2 className="text-2xl font-black mb-4 text-slate-800 dark:text-gold-500 uppercase tracking-tight">Dataset Indisponível</h2>
          <p className="text-slate-400 dark:text-gold-500/40">
            Esta estação ainda não processou fluxos de dados ou o cache operacional foi limpo.
          </p>
        </div>
      )}
    </div>
  );
}