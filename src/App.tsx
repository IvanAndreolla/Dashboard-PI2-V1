import { useEffect, useState } from "react";

import { Sidebar } from "./layout/Sidebar";
import { Topbar } from "./layout/Topbar";

import { Dashboard } from "./pages/Dashboard";
import { Boias } from "./pages/Boias";
import { BoiaDetalhe } from "./pages/BoiaDetalhe";
import { Admin } from "./pages/Admin";
import { LoginAdmin } from "./pages/LoginAdmin";
import { Alertas } from "./pages/Alertas";
import { Historico } from "./pages/Historico";
import { Mapa } from "./pages/Mapa";
import { Publico } from "./pages/Publico";

import {
  BoiaConfig,
  EnvironmentalData,
  SensorConfig,
  SensoresBoia,
  StatusBoia,
} from "./types";

type Page =
  | "dashboard"
  | "boias"
  | "alertas"
  | "historico"
  | "boiaDetalhe"
  | "admin"
  | "mapa"
  | "publico";

function sensor(
  ativo: boolean,
  nome: string,
  unidade: string,
  minAlerta?: number,
  maxAlerta?: number,
  minCritico?: number,
  maxCritico?: number
): SensorConfig {
  return {
    ativo,
    nome,
    unidade,
    minAlerta,
    maxAlerta,
    minCritico,
    maxCritico,
  };
}

const sensoresCompletos: SensoresBoia = {
  tempAgua: sensor(true, "Temperatura da água", "°C", undefined, 30, undefined, 35),
  phAgua: sensor(true, "pH da água", "pH", 6.5, 8.5, 6.0, 9.0),
  turbidez: sensor(true, "Turbidez", "NTU", undefined, 15, undefined, 30),
  condutivEC: sensor(true, "Condutividade", "µS/cm"),

  tempAr: sensor(true, "Temperatura do ar", "°C"),
  umidAr: sensor(true, "Umidade do ar", "%"),
  pressao: sensor(true, "Pressão atmosférica", "hPa"),

  indiceUV: sensor(true, "Índice UV", ""),

  chuvaAcum: sensor(true, "Chuva acumulada", "mm"),

  ventoVel: sensor(true, "Velocidade do vento", "km/h"),
  ventoDir: sensor(true, "Direção do vento", "°"),
};

const sensoresAguaBasicos: SensoresBoia = {
  tempAgua: sensoresCompletos.tempAgua,
  phAgua: sensoresCompletos.phAgua,
  turbidez: sensoresCompletos.turbidez,
  condutivEC: sensoresCompletos.condutivEC,
};

const boiasIniciais: BoiaConfig[] = [
  {
    id: "ifsc-baia-sul",
    nome: "Boia IFSC Baía Sul",
    descricao: "Boia de monitoramento ambiental do IFSC para operação na Baía Sul.",
    instituicao: "IFSC",
    responsavel: "Equipe do Projeto Integrador 2",
    imagem: "/assets/boias/medusa.png",
    local: "Baía Sul",
    latitude: -27.603671,
    longitude: -48.552147,
    gpsIntegrado: false,
    habilitada: true,
    status: "offline",
    comunicacao: {
      mqtt: true,
      mqttTopico: "hydra/boias/ifsc-baia-sul/dados",
      lora: true,
    },
    sensores: sensoresCompletos,
  },
  {
    id: "ufsc-lagoa-peri",
    nome: "Boia UFSC Lagoa do Peri",
    descricao: "Boia de monitoramento ambiental localizada na Lagoa do Peri.",
    instituicao: "UFSC",
    responsavel: "UFSC",
    imagem: "/assets/boias/netuno.png",
    local: "Lagoa do Peri",
    latitude: -27.725,
    longitude: -48.508,
    gpsIntegrado: false,
    habilitada: true,
    status: "offline",
    comunicacao: {
      mqtt: false,
    },
    sensores: sensoresAguaBasicos,
  },
];

function sensorAtivo(boia: BoiaConfig, chave: keyof SensoresBoia) {
  return boia.sensores[chave]?.ativo === true;
}

function calcularStatusBoia(
  leitura: EnvironmentalData | undefined,
  boia: BoiaConfig
): StatusBoia {
  if (!leitura) return "offline";

  if (
    sensorAtivo(boia, "phAgua") &&
    ((boia.sensores.phAgua?.minCritico !== undefined &&
      leitura.phAgua < boia.sensores.phAgua.minCritico) ||
      (boia.sensores.phAgua?.maxCritico !== undefined &&
        leitura.phAgua > boia.sensores.phAgua.maxCritico))
  ) {
    return "critico";
  }

  if (
    sensorAtivo(boia, "turbidez") &&
    boia.sensores.turbidez?.maxCritico !== undefined &&
    leitura.turbidez > boia.sensores.turbidez.maxCritico
  ) {
    return "critico";
  }

  if (
    sensorAtivo(boia, "tempAgua") &&
    boia.sensores.tempAgua?.maxCritico !== undefined &&
    leitura.tempAgua > boia.sensores.tempAgua.maxCritico
  ) {
    return "critico";
  }

  if (
    sensorAtivo(boia, "phAgua") &&
    ((boia.sensores.phAgua?.minAlerta !== undefined &&
      leitura.phAgua < boia.sensores.phAgua.minAlerta) ||
      (boia.sensores.phAgua?.maxAlerta !== undefined &&
        leitura.phAgua > boia.sensores.phAgua.maxAlerta))
  ) {
    return "alerta";
  }

  if (
    sensorAtivo(boia, "turbidez") &&
    boia.sensores.turbidez?.maxAlerta !== undefined &&
    leitura.turbidez > boia.sensores.turbidez.maxAlerta
  ) {
    return "alerta";
  }

  if (
    sensorAtivo(boia, "tempAgua") &&
    boia.sensores.tempAgua?.maxAlerta !== undefined &&
    leitura.tempAgua > boia.sensores.tempAgua.maxAlerta
  ) {
    return "alerta";
  }

  return "ok";
}

function carregarLocalStorage<T>(chave: string, fallback: T): T {
  try {
    const valor = localStorage.getItem(chave);
    if (!valor) return fallback;
    return JSON.parse(valor);
  } catch {
    return fallback;
  }
}

function normalizarBoiasSalvas(boiasSalvas: BoiaConfig[]): BoiaConfig[] {
  return boiasSalvas.map((boia) => ({
    ...boia,
    descricao: boia.descricao || "",
    instituicao: boia.instituicao || "Não informado",
    responsavel: boia.responsavel || "",
    local: boia.local || "Não informado",
    imagem: boia.imagem || "/assets/boias/medusa.png",
    latitude: boia.latitude ?? -27.603671,
    longitude: boia.longitude ?? -48.552147,
    gpsIntegrado: boia.gpsIntegrado ?? false,
    comunicacao: boia.comunicacao || { mqtt: false },
    sensores: boia.sensores || sensoresCompletos,
  }));
}

function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const [data, setData] = useState<EnvironmentalData[]>(() =>
    carregarLocalStorage("hydra_data", [])
  );

  const [boias, setBoias] = useState<BoiaConfig[]>(() =>
    normalizarBoiasSalvas(carregarLocalStorage("hydra_boias", boiasIniciais))
  );

  const [adminLogado, setAdminLogado] = useState<boolean>(() =>
    carregarLocalStorage("hydra_admin", false)
  );

  const [boiaSelecionada, setBoiaSelecionada] =
    useState<string>("ifsc-baia-sul");

  useEffect(() => {
    localStorage.setItem("hydra_data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("hydra_boias", JSON.stringify(boias));
  }, [boias]);

  useEffect(() => {
    localStorage.setItem("hydra_admin", JSON.stringify(adminLogado));
  }, [adminLogado]);

  const addData = (newData: EnvironmentalData[]) => {
    setData((oldData) => [...oldData, ...newData]);
  };

  const clearDataByBoia = (boiaId: string) => {
    setData((oldData) =>
      oldData.filter((leitura) => leitura.boiaId !== boiaId)
    );
  };

  const logoutAdmin = () => {
    setAdminLogado(false);
  };

  const resetBoias = () => {
    setBoias(boiasIniciais);
  };

  const boiasAtualizadas: BoiaConfig[] = boias.map((boia) => {
    const dadosDaBoia = data.filter((leitura) => leitura.boiaId === boia.id);
    const ultimaLeitura = dadosDaBoia[dadosDaBoia.length - 1];

    return {
      ...boia,
      status: calcularStatusBoia(ultimaLeitura, boia),
    };
  });

  const boiaAtual = boiasAtualizadas.find(
    (boia) => boia.id === boiaSelecionada
  );

  const dadosBoiaAtual = data.filter(
    (leitura) => leitura.boiaId === boiaSelecionada
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar page={page} setPage={setPage} />

      <div className="flex-1 flex flex-col">
        {page !== "publico" && <Topbar data={data} />}

        {page === "dashboard" && (
          <Dashboard data={data} boias={boiasAtualizadas} />
        )}

        {page === "publico" && (
          <Publico data={data} boias={boiasAtualizadas} />
        )}

        {page === "boias" && (
          <Boias
            boias={boiasAtualizadas}
            setBoiaSelecionada={setBoiaSelecionada}
            setPage={setPage}
          />
        )}

        {page === "boiaDetalhe" && boiaAtual && (
          <BoiaDetalhe
            boia={boiaAtual}
            data={dadosBoiaAtual}
            setPage={setPage}
          />
        )}

        {page === "mapa" && (
          <Mapa
            boias={boiasAtualizadas}
            data={data}
            setBoiaSelecionada={setBoiaSelecionada}
            setPage={setPage}
          />
        )}

        {page === "alertas" && (
          <Alertas boias={boiasAtualizadas} data={data} />
        )}

        {page === "historico" && (
          <Historico boias={boiasAtualizadas} data={data} />
        )}

        {page === "admin" && !adminLogado && (
          <LoginAdmin onLogin={() => setAdminLogado(true)} />
        )}

        {page === "admin" && adminLogado && (
          <Admin
            boias={boiasAtualizadas}
            setBoias={setBoias}
            data={data}
            addData={addData}
            clearDataByBoia={clearDataByBoia}
            onLogout={logoutAdmin}
            onResetBoias={resetBoias}
          />
        )}
      </div>
    </div>
  );
}

export default App;