import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Droplets,
  MapPin,
  Radio,
  Waves,
} from "lucide-react";

import { BoiaConfig, EnvironmentalData } from "../types";

interface Props {
  data: EnvironmentalData[];
  boias: BoiaConfig[];
}

function getDadosDaBoia(data: EnvironmentalData[], boiaId: string) {
  return data.filter((leitura) => leitura.boiaId === boiaId);
}

function getUltimaLeitura(data: EnvironmentalData[]) {
  if (data.length === 0) return null;
  return data[data.length - 1];
}

function getStatusColor(status: string) {
  if (status === "critico") return "text-red-600 bg-red-100";
  if (status === "alerta") return "text-yellow-700 bg-yellow-100";
  if (status === "ok") return "text-green-700 bg-green-100";
  return "text-gray-600 bg-gray-100";
}

function getStatusTexto(status: string) {
  if (status === "critico") return "Crítico";
  if (status === "alerta") return "Atenção";
  if (status === "ok") return "Operando";
  return "Offline";
}

function calcularResumoAmbiental(boias: BoiaConfig[]) {
  const ativas = boias.filter((boia) => boia.habilitada);

  if (ativas.length === 0) {
    return {
      titulo: "Sistema inativo",
      descricao: "Nenhuma boia habilitada no momento.",
      classe: "bg-gray-100 text-gray-700",
    };
  }

  if (ativas.some((boia) => boia.status === "critico")) {
    return {
      titulo: "Atenção crítica",
      descricao: "Há pelo menos uma boia com condição crítica.",
      classe: "bg-red-100 text-red-700",
    };
  }

  if (ativas.some((boia) => boia.status === "alerta")) {
    return {
      titulo: "Monitoramento em atenção",
      descricao: "Algumas leituras estão fora da faixa ideal.",
      classe: "bg-yellow-100 text-yellow-700",
    };
  }

  if (ativas.some((boia) => boia.status === "ok")) {
    return {
      titulo: "Condições estáveis",
      descricao: "As boias com dados estão dentro dos limites configurados.",
      classe: "bg-green-100 text-green-700",
    };
  }

  return {
    titulo: "Aguardando dados",
    descricao: "As boias estão cadastradas, mas ainda não receberam leituras.",
    classe: "bg-blue-100 text-blue-700",
  };
}

export function Dashboard({ data, boias }: Props) {
  const boiasAtivas = boias.filter((boia) => boia.habilitada);
  const boiasOffline = boiasAtivas.filter((boia) => boia.status === "offline");
  const boiasAlerta = boiasAtivas.filter((boia) => boia.status === "alerta");
  const boiasCriticas = boiasAtivas.filter((boia) => boia.status === "critico");

  const ultimaLeitura = getUltimaLeitura(data);
  const resumoAmbiental = calcularResumoAmbiental(boias);

  const ultimasBoias = boiasAtivas.slice(0, 4);

  return (
    <div className="p-6 space-y-6">
      {/* HERO */}
      <div className="bg-gradient-to-r from-teal-700 via-blue-800 to-blue-950 text-white rounded-2xl p-8 shadow-lg overflow-hidden relative">
        <div className="absolute right-8 top-8 opacity-10">
          <Waves size={180} />
        </div>

        <div className="relative z-10 max-w-4xl">
          <p className="text-sm uppercase tracking-widest opacity-80 mb-2">
            Projeto Águas Vivas
          </p>

          <h1 className="text-4xl font-bold leading-tight">
            Monitoramento ambiental inteligente para boias de pesquisa
          </h1>

          <p className="text-blue-100 mt-4 max-w-2xl">
            Plataforma para coleta, visualização e análise de dados ambientais
            obtidos por boias instrumentadas, com suporte a CSV, sensores
            configuráveis, alertas e futura integração MQTT.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-sm text-blue-100">Boias ativas</p>
              <p className="text-2xl font-bold">{boiasAtivas.length}</p>
            </div>

            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-sm text-blue-100">Leituras armazenadas</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </div>

            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-sm text-blue-100">Última leitura</p>
              <p className="text-lg font-bold">
                {ultimaLeitura ? ultimaLeitura.timestamp : "Sem dados"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMO GERAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Boias cadastradas</p>
              <p className="text-3xl font-bold">{boias.length}</p>
            </div>
            <Database className="text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Boias offline</p>
              <p className="text-3xl font-bold">{boiasOffline.length}</p>
            </div>
            <Radio className="text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Em atenção</p>
              <p className="text-3xl font-bold text-yellow-600">
                {boiasAlerta.length}
              </p>
            </div>
            <AlertTriangle className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Críticas</p>
              <p className="text-3xl font-bold text-red-600">
                {boiasCriticas.length}
              </p>
            </div>
            <AlertTriangle className="text-red-600" />
          </div>
        </div>
      </div>

      {/* STATUS AMBIENTAL */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 xl:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="text-blue-700" />
            <h2 className="font-bold text-lg">Resumo ambiental</h2>
          </div>

          <div className={`rounded-xl p-5 ${resumoAmbiental.classe}`}>
            <h3 className="font-bold text-xl">{resumoAmbiental.titulo}</h3>
            <p className="mt-1">{resumoAmbiental.descricao}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Dados disponíveis</p>
              <p className="font-bold text-xl">
                {data.length > 0 ? "Sim" : "Não"}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Instituições</p>
              <p className="font-bold text-xl">
                {new Set(boias.map((b) => b.instituicao)).size}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Boias com GPS</p>
              <p className="font-bold text-xl">
                {boias.filter((b) => b.gpsIntegrado).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-lg mb-4">Status das boias</h2>

          <div className="space-y-3">
            {ultimasBoias.map((boia) => {
              const dadosBoia = getDadosDaBoia(data, boia.id);
              const ultima = dadosBoia[dadosBoia.length - 1];

              return (
                <div
                  key={boia.id}
                  className="border rounded-xl p-3 flex items-center gap-3"
                >
                  <img
                    src={boia.imagem}
                    alt={boia.nome}
                    className="w-12 h-12 object-contain bg-black rounded-lg"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{boia.nome}</p>
                    <p className="text-xs text-gray-500">
                      {ultima ? ultima.timestamp : "sem dados"}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      boia.status
                    )}`}
                  >
                    {getStatusTexto(boia.status)}
                  </span>
                </div>
              );
            })}

            {boiasAtivas.length === 0 && (
              <p className="text-gray-500 text-sm">
                Nenhuma boia habilitada no momento.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SOBRE O PROJETO */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-lg mb-3">Sobre o sistema</h2>

          <p className="text-gray-600 leading-relaxed">
            O dashboard Hydra — Projeto Águas Vivas foi desenvolvido para
            apoiar pesquisadores na análise de dados ambientais coletados por
            boias instrumentadas. A plataforma permite cadastrar boias,
            configurar sensores, carregar dados por CSV, visualizar gráficos,
            acompanhar alertas e consultar a posição geográfica dos dispositivos.
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <strong>Coleta:</strong> CSV e futura integração MQTT.
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <strong>Análise:</strong> gráficos, histórico e alertas.
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <strong>Escopo:</strong> hidrosfera e atmosfera.
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <strong>Uso:</strong> pesquisa, ensino e monitoramento.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-lg mb-3">Quem somos</h2>

          <p className="text-gray-600 leading-relaxed">
            O Projeto Águas Vivas reúne estudantes e pesquisadores interessados
            em monitoramento ambiental, instrumentação, eletrônica embarcada,
            sistemas web e análise de dados. A proposta é oferecer uma solução
            acessível, modular e expansível para apoiar estudos de qualidade da
            água e condições ambientais em diferentes pontos de interesse.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm">
              IFSC
            </span>

            <span className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
              Projeto Integrador
            </span>

            <span className="bg-cyan-100 text-cyan-700 px-3 py-2 rounded-lg text-sm">
              Monitoramento ambiental
            </span>

            <span className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm">
              IoT
            </span>
          </div>
        </div>
      </div>

      {/* LOCALIZAÇÃO */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="text-blue-700" />
          <h2 className="font-bold text-lg">Boias por localização</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boiasAtivas.map((boia) => (
            <div key={boia.id} className="border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <img
                  src={boia.imagem}
                  alt={boia.nome}
                  className="w-14 h-14 object-contain bg-black rounded-lg"
                />

                <div>
                  <p className="font-bold">{boia.nome}</p>
                  <p className="text-sm text-gray-500">{boia.local}</p>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-3">
                <p>Latitude: {boia.latitude}</p>
                <p>Longitude: {boia.longitude}</p>
              </div>
            </div>
          ))}
        </div>

        {boiasAtivas.length === 0 && (
          <p className="text-gray-500 text-sm">
            Nenhuma boia ativa para exibir localização.
          </p>
        )}
      </div>

      {/* PRÓXIMAS ETAPAS */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="text-green-400" />
          <h2 className="font-bold text-lg">Próximas integrações previstas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-4">
            MQTT em tempo real
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            Backend com banco de dados
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            Upload real de imagens
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            Visão pública simplificada
          </div>
        </div>
      </div>
    </div>
  );
}