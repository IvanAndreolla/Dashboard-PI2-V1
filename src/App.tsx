import { useEffect, useState } from "react";
import { socket } from "./services/socket";

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

function sensorAtivo(boia: BoiaConfig, chave: keyof SensoresBoia) {
  return boia && boia.sensores && boia.sensores[chave]?.ativo === true;
}

function calcularStatusBoia(
  leitura: EnvironmentalData | undefined,
  boia: BoiaConfig
): StatusBoia {
  if (!leitura || !boia) return "offline";

  try {
    const agora = new Date();
    const timestampLeitura = new Date(leitura.timestamp.includes('T') ? leitura.timestamp : leitura.timestamp.replace(" ", "T"));

    if (isNaN(timestampLeitura.getTime())) return "offline";

    const diferencaMs = agora.getTime() - timestampLeitura.getTime();
    const diferencaMinutos = diferencaMs / 1000 / 60;

    if (diferencaMinutos > 15) {
      return "offline";
    }
  } catch (error) {
    return "offline";
  }

  // Critical checks
  if (
    sensorAtivo(boia, "phAgua") && leitura.phAgua != null &&
    ((boia.sensores.phAgua?.minCritico !== undefined && leitura.phAgua < boia.sensores.phAgua.minCritico) ||
      (boia.sensores.phAgua?.maxCritico !== undefined && leitura.phAgua > boia.sensores.phAgua.maxCritico))
  ) return "critico";

  if (sensorAtivo(boia, "turbidez") && leitura.turbidez != null && boia.sensores.turbidez?.maxCritico !== undefined && leitura.turbidez > boia.sensores.turbidez.maxCritico) return "critico";
  if (sensorAtivo(boia, "tempAgua") && leitura.tempAgua != null && boia.sensores.tempAgua?.maxCritico !== undefined && leitura.tempAgua > boia.sensores.tempAgua.maxCritico) return "critico";

  // Alerta checks
  if (
    sensorAtivo(boia, "phAgua") && leitura.phAgua != null &&
    ((boia.sensores.phAgua?.minAlerta !== undefined && leitura.phAgua < boia.sensores.phAgua.minAlerta) ||
      (boia.sensores.phAgua?.maxAlerta !== undefined && leitura.phAgua > boia.sensores.phAgua.maxAlerta))
  ) return "alerta";

  if (sensorAtivo(boia, "turbidez") && leitura.turbidez != null && boia.sensores.turbidez?.maxAlerta !== undefined && leitura.turbidez > boia.sensores.turbidez.maxAlerta) return "alerta";
  if (sensorAtivo(boia, "tempAgua") && leitura.tempAr != null && boia.sensores.tempAgua?.maxAlerta !== undefined && leitura.tempAgua > boia.sensores.tempAgua.maxAlerta) return "alerta";

  return "ok";
}

function converterBoiaBackendParaFrontend(boia: any): BoiaConfig {
  const latPadrao = -27.603671 + (Math.random() - 0.5) * 0.01;
  const lonPadrao = -48.552147 + (Math.random() - 0.5) * 0.01;

  return {
    id: boia.id || 'desconhecida',
    nome: boia.nome || boia.id || 'Boia sem Nome',
    descricao: boia.descricao || "",
    instituicao: boia.instituicao || "Não informado",
    responsavel: boia.responsavel || "",
    imagem: boia.imagem || "/assets/boias/medusa.png",
    local: boia.local || "Não informado",
    latitude: boia.latitude ?? latPadrao,
    longitude: boia.longitude ?? lonPadrao,
    gpsIntegrado: boia.gpsIntegrado ?? false,
    habilitada: boia.habilitada ?? true,
    status: "offline",
    comunicacao: boia.comunicacao || {
      mqtt: boia.mqtt ?? false,
      mqttTopico: boia.mqttTopico || "",
      lora: boia.lora ?? false,
    },
    sensores: boia.sensores || sensoresCompletos,
  };
}

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [data, setData] = useState<EnvironmentalData[]>([]);
  const [boias, setBoias] = useState<BoiaConfig[]>([]);
  const [adminLogado, setAdminLogado] = useState(() => !!localStorage.getItem("hydra_token"));
  const [boiaSelecionada, setBoiaSelecionada] = useState<string>("ifsc-baia-sul");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/leituras?limit=1000");
        if (res.ok) {
          const leituras = await res.json();
          if (Array.isArray(leituras)) setData(leituras);
        }
      } catch (e) { console.error(e); }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadBoias() {
      try {
        const res = await fetch("/api/boias");
        if (res.ok) {
          const bks = await res.json();
          if (Array.isArray(bks)) setBoias(bks.map(converterBoiaBackendParaFrontend));
        }
      } catch (e) { console.error(e); }
    }
    loadBoias();
  }, []);

  useEffect(() => {
    socket.on("mqtt:data", (novo: EnvironmentalData) => {
      setData(prev => [...prev, novo]);
      setBoias(prev => {
        const exists = prev.some(b => b.id === novo.boiaId);
        if (!exists) {
          fetch("/api/boias").then(r => r.json()).then(bks => {
            if (Array.isArray(bks)) setBoias(bks.map(converterBoiaBackendParaFrontend));
          });
          return prev;
        }
        return prev.map(b => b.id === novo.boiaId ? { ...b, latitude: novo.lat ?? b.latitude, longitude: novo.lon ?? b.longitude } : b);
      });
    });

    socket.on("boia:update", (up: any) => {
      setBoias(prev => prev.map(b => b.id === up.id ? { ...b, ...up } : b));
    });

    return () => {
      socket.off("mqtt:data");
      socket.off("boia:update");
    };
  }, []);

  const logoutAdmin = () => {
    localStorage.removeItem("hydra_token");
    localStorage.removeItem("hydra_usuario");
    setAdminLogado(false);
  };

  const boiasAtualizadas = boias.map(b => {
    const readings = data.filter(d => d.boiaId === b.id);
    return { ...b, status: calcularStatusBoia(readings[readings.length - 1], b) };
  });

  const boiaAtual = boiasAtualizadas.find(b => b.id === boiaSelecionada);
  const readingsAtual = data.filter(d => d.boiaId === boiaSelecionada);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {page !== "publico" && <Topbar data={data} />}
        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && <Dashboard data={data} boias={boiasAtualizadas} />}
          {page === "publico" && <Publico data={data} boias={boiasAtualizadas} />}
          {page === "boias" && <Boias boias={boiasAtualizadas} setBoiaSelecionada={setBoiaSelecionada} setPage={setPage} />}
          {page === "boiaDetalhe" && boiaAtual && <BoiaDetalhe boia={boiaAtual} data={readingsAtual} setPage={setPage} />}
          {page === "mapa" && <Mapa boias={boiasAtualizadas} data={data} setBoiaSelecionada={setBoiaSelecionada} setPage={setPage} />}
          {page === "alertas" && <Alertas boias={boiasAtualizadas} data={data} />}
          {page === "historico" && <Historico boias={boiasAtualizadas} data={data} />}
          {page === "admin" && (!adminLogado ? <LoginAdmin onLogin={() => setAdminLogado(true)} /> : <Admin boias={boiasAtualizadas} setBoias={setBoias} data={data} addData={d => setData(p => [...p, ...d])} clearDataByBoia={id => setData(p => p.filter(d => d.boiaId !== id))} onLogout={logoutAdmin} />)}
        </main>
      </div>
    </div>
  );
}

export default App;
