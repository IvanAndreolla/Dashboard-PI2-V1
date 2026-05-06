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
      return "bg-red-50 border-red-500";
    case "alerta":
      return "bg-yellow-50 border-yellow-500";
    case "ok":
      return "bg-green-50 border-green-500";
    default:
      return "bg-blue-50 border-blue-500";
  }
}

function getStatusColor(status: string) {
  if (status === "critico") return "bg-red-500";
  if (status === "alerta") return "bg-yellow-400";
  if (status === "ok") return "bg-green-500";
  return "bg-gray-400";
}

export function BoiaDetalhe({ boia, data, setPage }: Props) {
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
    <div className="p-6 space-y-6">
      <button
        onClick={() => setPage("boias")}
        className="text-blue-600 hover:underline"
      >
        ← Voltar
      </button>

      <div className="bg-gradient-to-r from-gray-950 to-black text-white rounded-2xl p-6 flex items-center gap-6 shadow-lg">
        <div className="w-28 h-28 bg-black rounded-xl flex items-center justify-center overflow-hidden">
          <img
            src={boia.imagem}
            alt={boia.nome}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{boia.nome}</h1>
          <p className="text-gray-300">{boia.descricao}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(boia.status)}`} />
              <span className="capitalize">{boia.status}</span>
            </div>

            <span className="text-gray-400">•</span>
            <span>{boia.instituicao}</span>

            <span className="text-gray-400">•</span>
            <span>{boia.local}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-bold text-lg mb-4">Alertas desta boia</h2>

        <div className="space-y-3">
          {alertasBoia.map((alerta, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getAlertaClass(alerta.tipo)}`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase">
                  {alerta.tipo}
                </span>

                {alerta.timestamp && (
                  <span className="text-xs text-gray-500">
                    {alerta.timestamp}
                  </span>
                )}
              </div>

              <p className="font-semibold">{alerta.titulo}</p>
              <p className="text-sm text-gray-600">{alerta.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {latest ? (
        <>
          <div className="bg-white p-5 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold">Escala dos gráficos</h2>
              <p className="text-sm text-gray-500">
                Valores reais, comparação normalizada ou multi-eixo para evitar
                achatamento visual.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setModoEscala("real")}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  modoEscala === "real"
                    ? "bg-blue-700 text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                Valores reais
              </button>

              <button
                onClick={() => setModoEscala("normalizada")}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  modoEscala === "normalizada"
                    ? "bg-blue-700 text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                Normalizada 0–100%
              </button>

              <button
                onClick={() => setModoEscala("multieixo")}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  modoEscala === "multieixo"
                    ? "bg-blue-700 text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                Multi-eixo
              </button>
            </div>
          </div>

          {todosParametros.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {todosParametros.slice(0, 4).map((parametro) => (
                <div
                  key={parametro.key}
                  className="bg-white p-6 rounded-xl shadow-md"
                >
                  <h2 className="text-sm text-gray-500">{parametro.label}</h2>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
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
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="mb-4">
                <h2 className="font-bold text-lg">Acima da água</h2>
                <p className="text-sm text-gray-500">
                  Parâmetros atmosféricos configurados para esta boia.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {parametrosAcima.map((parametro) => (
                  <label
                    key={parametro.key}
                    className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-lg cursor-pointer"
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
                    />
                    {parametro.label}
                  </label>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={360}>
                <LineChart
                  data={chartDataAcima}
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

                  <YAxis
                    yAxisId="left"
                    width={80}
                    domain={
                      modoEscala === "normalizada"
                        ? [0, 100]
                        : ["auto", "auto"]
                    }
                    label={{
                      value: yAxisLabel,
                      angle: -90,
                      position: "left",
                      dy: -80,
                    }}
                  />

                  {modoEscala === "multieixo" && (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      width={80}
                      domain={["auto", "auto"]}
                    />
                  )}

                  <Tooltip />
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
                        stroke={parametro.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {parametrosAbaixo.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="mb-4">
                <h2 className="font-bold text-lg">Abaixo da água</h2>
                <p className="text-sm text-gray-500">
                  Parâmetros da hidrosfera configurados para esta boia.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {parametrosAbaixo.map((parametro) => (
                  <label
                    key={parametro.key}
                    className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-lg cursor-pointer"
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
                    />
                    {parametro.label}
                  </label>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={360}>
                <LineChart
                  data={chartDataAbaixo}
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

                  <YAxis
                    yAxisId="left"
                    width={80}
                    domain={
                      modoEscala === "normalizada"
                        ? [0, 100]
                        : ["auto", "auto"]
                    }
                    label={{
                      value: yAxisLabel,
                      angle: -90,
                      position: "left",
                      dy: -80,
                    }}
                  />

                  {modoEscala === "multieixo" && (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      width={80}
                      domain={["auto", "auto"]}
                    />
                  )}

                  <Tooltip />
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
                        stroke={parametro.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="font-bold text-lg mb-4">Últimos valores</h2>

            {todosParametros.length === 0 ? (
              <p className="text-gray-500">
                Nenhum sensor ativo foi configurado para esta boia.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todosParametros.map((parametro) => (
                  <div
                    key={parametro.key}
                    className="border rounded-lg p-4 flex justify-between"
                  >
                    <span className="text-gray-500">{parametro.label}</span>
                    <strong>
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
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold mb-2">Nenhum dado carregado</h2>
          <p className="text-gray-500">
            Vá até a aba Admin e envie um CSV para esta boia.
          </p>
        </div>
      )}
    </div>
  );
}