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
  Page
} from "./types";

import { calcularStatusBoia } from "./utils/alertas";

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
  tempAr: sensor(true, "Temperatura do ar", "°C"),
  umidAr: sensor(true, "Umidade do ar", "%"),
  pressao: sensor(true, "Pressão atmosférica", "hPa"),
  indiceUV: sensor(true, "Índice UV", ""),
  chuvaAcum: sensor(true, "Chuva acumulada", "mm"),
  ventoVel: sensor(true, "Velocidade do vento", "km/h"),
  ventoDir: sensor(true, "Direção do vento", "°"),
  tempAgua: sensor(true, "Temperatura da água", "°C", undefined, 30, undefined, 35),
  phAgua: sensor(true, "pH da água", "pH", 6.5, 8.5, 6.0, 9.0),
  turbidez: sensor(true, "Turbidez", "NTU", undefined, 15, undefined, 30),
  condutivEC: sensor(true, "Condutividade", "µS/cm"),
};

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

    alertaAtivo: boia.alertaAtivo ?? false,
    alertaTipo: boia.alertaTipo || null,

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
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("hydra_theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    localStorage.setItem("hydra_theme", theme);
  }, [theme]);

  useEffect(() => {
    async function loadData() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiUrl}/api/leituras?limit=1000`);
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
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiUrl}/api/boias`);
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
          const apiUrl = import.meta.env.VITE_API_URL || "";
          fetch(`${apiUrl}/api/boias`).then(r => r.json()).then(bks => {
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
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-black font-sans transition-colors duration-500">
        <Sidebar page={page} setPage={setPage} theme={theme} setTheme={setTheme} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {page !== "publico" && <Topbar data={data} theme={theme} />}
          <main className="flex-1 overflow-y-auto">
            {page === "dashboard" && <Dashboard data={data} boias={boiasAtualizadas} theme={theme} setPage={setPage} />}
            {page === "publico" && <Publico data={data} boias={boiasAtualizadas} theme={theme} />}
            {page === "boias" && <Boias boias={boiasAtualizadas} setBoiaSelecionada={setBoiaSelecionada} setPage={setPage} theme={theme} />}
            {page === "boiaDetalhe" && boiaAtual && <BoiaDetalhe boia={boiaAtual} data={readingsAtual} setPage={setPage} theme={theme} />}
            {page === "mapa" && <Mapa boias={boiasAtualizadas} data={data} setBoiaSelecionada={setBoiaSelecionada} setPage={setPage} theme={theme} />}
            {page === "alertas" && <Alertas boias={boiasAtualizadas} data={data} theme={theme} />}
            {page === "historico" && <Historico boias={boiasAtualizadas} data={data} theme={theme} />}
            {page === "admin" && (!adminLogado ? <LoginAdmin onLogin={() => setAdminLogado(true)} /> : <Admin boias={boiasAtualizadas} setBoias={setBoias} data={data} addData={d => setData(p => [...p, ...d])} clearDataByBoia={id => setData(p => p.filter(d => d.boiaId !== id))} onLogout={logoutAdmin} theme={theme} />)}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
