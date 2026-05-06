import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import {
  BoiaConfig,
  EnvironmentalData,
  SensorConfig,
  SensoresBoia,
} from "../types";

export type AlertaTipo = "ok" | "alerta" | "critico" | "info";

export interface AlertaGerado {
  tipo: AlertaTipo;

  titulo: string;
  descricao: string;

  timestamp?: string;

  sensor?: string;
}

interface Props {
  boias: BoiaConfig[];
  data: EnvironmentalData[];
}

function sensorAtivo(sensor?: SensorConfig) {
  return sensor?.ativo === true;
}

function verificarSensor(
  nomeBoia: string,
  sensorKey: keyof SensoresBoia,
  sensor: SensorConfig | undefined,
  valor: number,
  timestamp: string
): AlertaGerado[] {
  if (!sensorAtivo(sensor)) return [];

  const alertas: AlertaGerado[] = [];

  if (
    sensor?.minCritico !== undefined &&
    valor < sensor.minCritico
  ) {
    alertas.push({
      tipo: "critico",
      titulo: `${sensor.nome} em nível crítico`,
      descricao: `${nomeBoia}: valor abaixo do crítico (${valor.toFixed(
        2
      )} ${sensor.unidade})`,
      timestamp,
      sensor: String(sensorKey),
    });
  }

  if (
    sensor?.maxCritico !== undefined &&
    valor > sensor.maxCritico
  ) {
    alertas.push({
      tipo: "critico",
      titulo: `${sensor.nome} em nível crítico`,
      descricao: `${nomeBoia}: valor acima do crítico (${valor.toFixed(
        2
      )} ${sensor.unidade})`,
      timestamp,
      sensor: String(sensorKey),
    });
  }

  if (
    sensor?.minAlerta !== undefined &&
    valor < sensor.minAlerta
  ) {
    alertas.push({
      tipo: "alerta",
      titulo: `${sensor.nome} em atenção`,
      descricao: `${nomeBoia}: valor abaixo do alerta (${valor.toFixed(
        2
      )} ${sensor.unidade})`,
      timestamp,
      sensor: String(sensorKey),
    });
  }

  if (
    sensor?.maxAlerta !== undefined &&
    valor > sensor.maxAlerta
  ) {
    alertas.push({
      tipo: "alerta",
      titulo: `${sensor.nome} em atenção`,
      descricao: `${nomeBoia}: valor acima do alerta (${valor.toFixed(
        2
      )} ${sensor.unidade})`,
      timestamp,
      sensor: String(sensorKey),
    });
  }

  return alertas;
}

function gerarAlertasBoia(
  boia: BoiaConfig,
  data: EnvironmentalData[]
): AlertaGerado[] {
  const dadosBoia = data.filter((item) => item.boiaId === boia.id);

  if (dadosBoia.length === 0) {
    return [
      {
        tipo: "info",
        titulo: "Sem dados",
        descricao: `${boia.nome} ainda não recebeu dados.`,
      },
    ];
  }

  const ultima = dadosBoia[dadosBoia.length - 1];

  const alertas: AlertaGerado[] = [];

  const sensores = boia.sensores;

  const mapaSensores: {
    key: keyof SensoresBoia;
    valor: number;
  }[] = [
    {
      key: "tempAgua",
      valor: ultima.tempAgua,
    },
    {
      key: "phAgua",
      valor: ultima.phAgua,
    },
    {
      key: "turbidez",
      valor: ultima.turbidez,
    },
    {
      key: "condutivEC",
      valor: ultima.condutivEC,
    },
    {
      key: "tempAr",
      valor: ultima.tempAr,
    },
    {
      key: "umidAr",
      valor: ultima.umidAr,
    },
    {
      key: "pressao",
      valor: ultima.pressao,
    },
    {
      key: "indiceUV",
      valor: ultima.indiceUV,
    },
    {
      key: "chuvaAcum",
      valor: ultima.chuvaAcum,
    },
    {
      key: "ventoVel",
      valor: ultima.ventoVel,
    },
    {
      key: "ventoDir",
      valor: ultima.ventoDir,
    },
  ];

  mapaSensores.forEach(({ key, valor }) => {
    const sensor = sensores[key];

    alertas.push(
      ...verificarSensor(
        boia.nome,
        key,
        sensor,
        valor,
        ultima.timestamp
      )
    );
  });

  if (alertas.length === 0) {
    alertas.push({
      tipo: "ok",
      titulo: "Operação normal",
      descricao: `${boia.nome} operando dentro dos limites configurados.`,
      timestamp: ultima.timestamp,
    });
  }

  return alertas;
}

function getCardClasses(tipo: AlertaTipo) {
  switch (tipo) {
    case "critico":
      return {
        border: "border-red-500",
        bg: "bg-red-50",
        icon: "text-red-600",
      };

    case "alerta":
      return {
        border: "border-yellow-500",
        bg: "bg-yellow-50",
        icon: "text-yellow-600",
      };

    case "ok":
      return {
        border: "border-green-500",
        bg: "bg-green-50",
        icon: "text-green-600",
      };

    default:
      return {
        border: "border-blue-500",
        bg: "bg-blue-50",
        icon: "text-blue-600",
      };
  }
}

function getIcon(tipo: AlertaTipo) {
  switch (tipo) {
    case "critico":
      return <AlertTriangle size={24} />;

    case "alerta":
      return <AlertTriangle size={24} />;

    case "ok":
      return <CheckCircle2 size={24} />;

    default:
      return <Info size={24} />;
  }
}

export function Alertas({ boias, data }: Props) {
  const alertas = boias
    .filter((boia) => boia.habilitada)
    .flatMap((boia) => gerarAlertasBoia(boia, data));

  const ordenados = [...alertas].sort((a, b) => {
    const prioridade: Record<AlertaTipo, number> = {
      critico: 0,
      alerta: 1,
      ok: 2,
      info: 3,
    };

    return prioridade[a.tipo] - prioridade[b.tipo];
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertas ambientais</h1>

        <p className="text-gray-500">
          Eventos gerados automaticamente com base nos sensores ativos e limites
          configurados no painel administrativo.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ordenados.map((alerta, index) => {
          const estilos = getCardClasses(alerta.tipo);

          return (
            <div
              key={index}
              className={`
                rounded-xl
                border-l-4
                shadow-md
                p-5
                ${estilos.border}
                ${estilos.bg}
              `}
            >
              <div className="flex items-start gap-4">
                <div className={estilos.icon}>
                  {getIcon(alerta.tipo)}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-lg">
                      {alerta.titulo}
                    </h2>

                    <span className="text-xs uppercase font-semibold bg-white px-2 py-1 rounded-full">
                      {alerta.tipo}
                    </span>
                  </div>

                  <p className="text-gray-700 mt-2">
                    {alerta.descricao}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    {alerta.timestamp && (
                      <span>
                        Timestamp: {alerta.timestamp}
                      </span>
                    )}

                    {alerta.sensor && (
                      <span>
                        Sensor: {alerta.sensor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}