import {
  Droplets,
  Wind,
  Waves,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { BoiaConfig, EnvironmentalData } from "../types";

interface Props {
  boias: BoiaConfig[];
  data: EnvironmentalData[];
}

function getUltimaLeitura(
  data: EnvironmentalData[],
  boiaId: string
) {
  const dados = data.filter((d) => d.boiaId === boiaId);

  return dados[dados.length - 1];
}

function calcularQualidadeGeral(boias: BoiaConfig[]) {
  const ativas = boias.filter((b) => b.habilitada);

  if (ativas.some((b) => b.status === "critico")) {
    return {
      titulo: "Qualidade comprometida",
      descricao:
        "Foram detectadas leituras críticas em algumas regiões monitoradas.",
      cor: "bg-red-100 text-red-700",
      icone: <AlertTriangle size={36} />,
    };
  }

  if (ativas.some((b) => b.status === "alerta")) {
    return {
      titulo: "Monitoramento em atenção",
      descricao:
        "Alguns parâmetros ambientais estão fora da faixa ideal.",
      cor: "bg-yellow-100 text-yellow-700",
      icone: <AlertTriangle size={36} />,
    };
  }

  return {
    titulo: "Condições ambientais estáveis",
    descricao:
      "As regiões monitoradas apresentam condições adequadas no momento.",
    cor: "bg-green-100 text-green-700",
    icone: <ShieldCheck size={36} />,
  };
}

function mediaTemperaturaAgua(
  boias: BoiaConfig[],
  data: EnvironmentalData[]
) {
  const valores = boias
    .map((boia) => getUltimaLeitura(data, boia.id))
    .filter(Boolean)
    .map((d) => d!.tempAgua);

  if (valores.length === 0) return null;

  return (
    valores.reduce((acc, valor) => acc + valor, 0) /
    valores.length
  );
}

function mediaVento(
  boias: BoiaConfig[],
  data: EnvironmentalData[]
) {
  const valores = boias
    .map((boia) => getUltimaLeitura(data, boia.id))
    .filter(Boolean)
    .map((d) => d!.ventoVel);

  if (valores.length === 0) return null;

  return (
    valores.reduce((acc, valor) => acc + valor, 0) /
    valores.length
  );
}

export function Publico({ boias, data }: Props) {
  const boiasAtivas = boias.filter((b) => b.habilitada);

  const qualidade = calcularQualidadeGeral(boiasAtivas);

  const tempMedia = mediaTemperaturaAgua(boiasAtivas, data);
  const ventoMedio = mediaVento(boiasAtivas, data);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HERO */}
        <div className="bg-gradient-to-r from-cyan-700 to-blue-900 text-white rounded-3xl p-10 shadow-xl overflow-hidden relative">
          <div className="absolute right-10 top-10 opacity-10">
            <Waves size={220} />
          </div>

          <div className="relative z-10">
            <p className="uppercase tracking-widest text-cyan-100 text-sm mb-3">
              Projeto Águas Vivas
            </p>

            <h1 className="text-5xl font-bold max-w-4xl leading-tight">
              Monitoramento ambiental em tempo real
            </h1>

            <p className="mt-5 text-cyan-100 max-w-2xl text-lg">
              Plataforma pública para visualização das condições ambientais
              monitoradas pelas boias instrumentadas do projeto.
            </p>
          </div>
        </div>

        {/* STATUS GERAL */}
        <div
          className={`rounded-2xl p-8 shadow-md flex items-center gap-6 ${qualidade.cor}`}
        >
          <div>{qualidade.icone}</div>

          <div>
            <h2 className="text-3xl font-bold">
              {qualidade.titulo}
            </h2>

            <p className="mt-2 text-lg">
              {qualidade.descricao}
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <Droplets className="text-cyan-600" size={36} />

              <div>
                <p className="text-gray-500">
                  Temperatura média da água
                </p>

                <h2 className="text-4xl font-bold">
                  {tempMedia
                    ? `${tempMedia.toFixed(1)} °C`
                    : "--"}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <Wind className="text-blue-700" size={36} />

              <div>
                <p className="text-gray-500">
                  Velocidade média do vento
                </p>

                <h2 className="text-4xl font-bold">
                  {ventoMedio
                    ? `${ventoMedio.toFixed(1)} km/h`
                    : "--"}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="text-green-600" size={36} />

              <div>
                <p className="text-gray-500">
                  Boias em operação
                </p>

                <h2 className="text-4xl font-bold">
                  {
                    boiasAtivas.filter(
                      (b) => b.status === "ok"
                    ).length
                  }
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* BOIAS */}
        <div>
          <h2 className="text-2xl font-bold mb-5">
            Regiões monitoradas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {boiasAtivas.map((boia) => {
              const leitura = getUltimaLeitura(data, boia.id);

              return (
                <div
                  key={boia.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-gray-950 to-black p-5 flex items-center gap-4">
                    <img
                      src={boia.imagem}
                      alt={boia.nome}
                      className="w-20 h-20 object-contain"
                    />

                    <div className="text-white">
                      <h3 className="text-xl font-bold">
                        {boia.nome}
                      </h3>

                      <p className="text-gray-300 text-sm">
                        {boia.local}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Temperatura da água
                      </span>

                      <strong>
                        {leitura
                          ? `${leitura.tempAgua.toFixed(1)} °C`
                          : "--"}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        pH
                      </span>

                      <strong>
                        {leitura
                          ? leitura.phAgua.toFixed(2)
                          : "--"}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Turbidez
                      </span>

                      <strong>
                        {leitura
                          ? `${leitura.turbidez.toFixed(1)} NTU`
                          : "--"}
                      </strong>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Última atualização
                      </p>

                      <p className="font-semibold">
                        {leitura
                          ? leitura.timestamp
                          : "Sem dados"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SOBRE */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">
            Sobre o Projeto Águas Vivas
          </h2>

          <p className="text-gray-600 leading-relaxed text-lg">
            O Projeto Águas Vivas busca desenvolver soluções acessíveis e
            inteligentes para monitoramento ambiental utilizando boias
            instrumentadas, sensores e plataformas digitais de análise.
            O sistema permite acompanhar parâmetros da água e da atmosfera
            em diferentes regiões monitoradas.
          </p>
        </div>
      </div>
    </div>
  );
}