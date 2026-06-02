import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Droplets,
  MapPin,
  Radio,
  Waves,
  Activity,
  Wind,
  ShieldCheck
} from "lucide-react";

import { BoiaConfig, EnvironmentalData } from "../types";

interface Props {
  data: EnvironmentalData[];
  boias: BoiaConfig[];
}

function getDadosDaBoia(data: EnvironmentalData[], boiaId: string) {
  return (data || []).filter((leitura) => leitura.boiaId === boiaId);
}

function getUltimaLeitura(data: EnvironmentalData[]) {
  if (!data || data.length === 0) return null;
  return data[data.length - 1];
}

function calcularResumoAmbiental(boias: BoiaConfig[]) {
  const ativas = (boias || []).filter((boia) => boia.habilitada);

  if (ativas.length === 0) {
    return {
      titulo: "Rede Offline",
      descricao: "Aguardando ativação das estações.",
      classe: "bg-slate-100 text-slate-500",
    };
  }

  if (ativas.some((boia) => boia.status === "critico")) {
    return {
      titulo: "Estado Crítico",
      descricao: "Algumas boias detectaram anomalias graves.",
      classe: "bg-red-50 text-red-700 border border-red-200",
    };
  }

  return {
    titulo: "Saúde Estável",
    descricao: "Todos os sistemas operando nos conformes.",
    classe: "bg-blue-50 text-blue-700 border border-blue-200",
  };
}

export function Dashboard({ data, boias }: Props) {
  const boiasAtivas = (boias || []).filter((boia) => boia.habilitada);
  const boiasOffline = boiasAtivas.filter((boia) => boia.status === "offline");
  const boiasAlerta = boiasAtivas.filter((boia) => boia.status === "alerta");
  const boiasCriticas = boiasAtivas.filter((boia) => boia.status === "critico");

  const ultimaLeitura = getUltimaLeitura(data);
  const resumoAmbiental = calcularResumoAmbiental(boias);
  const ultimasBoias = boiasAtivas.slice(0, 4);

  const formatarHora = (ts?: string) => {
    if (!ts) return "--:--";
    try {
      const dateStr = ts.includes('T') ? ts : ts.replace(' ', 'T');
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? "--:--" : date.toLocaleTimeString("pt-BR");
    } catch { return "--:--"; }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 bg-sky-50/30 min-h-screen">
      
      {/* HERO SECTION - SIMPLIFIED */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-600 via-sky-600 to-blue-700 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
           <Waves size={300} />
        </div>

        <div className="relative z-10 p-12 lg:p-16 text-center lg:text-left">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full border border-white/30 backdrop-blur-md">
               <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  Projeto Águas Vivas
               </span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-black tracking-tight leading-none drop-shadow-lg uppercase">
               Monitoramento<br/>
               <span className="text-sky-200 italic">Ambiental</span>
            </h1>

            <p className="text-xl text-blue-50 max-w-xl font-medium leading-relaxed opacity-90">
               Acompanhe em tempo real os dados das estações de monitoramento ambiental do <strong>IFSC</strong>.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
               <div className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform cursor-default">
                  Estações Ativas
               </div>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="relative z-10 border-t border-white/10 bg-black/10 backdrop-blur-md p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { l: "Total de Boias", v: boiasAtivas.length, i: <Database size={16}/> },
             { l: "Leituras Salvas", v: (data || []).length, i: <Activity size={16}/> },
             { l: "Último Dado", v: formatarHora(ultimaLeitura?.timestamp), i: <Waves size={16}/> },
             { l: "Status", v: "ONLINE", i: <ShieldCheck size={16}/> }
           ].map((s, idx) => (
             <div key={idx} className="flex flex-col gap-1 border-l border-white/10 pl-8 first:border-0">
                <div className="flex items-center gap-2 text-sky-200">
                   {s.i}
                   <span className="text-[9px] font-black uppercase tracking-[0.2em]">{s.l}</span>
                </div>
                <p className="text-3xl font-black tracking-tighter">{s.v}</p>
             </div>
           ))}
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { l: "Boias Ativas", v: boias.length, i: <Database />, c: "blue" },
           { l: "Offline", v: boiasOffline.length, i: <Radio />, c: "slate" },
           { l: "Atenção", v: boiasAlerta.length, i: <AlertTriangle />, c: "yellow" },
           { l: "Alerta Crítico", v: boiasCriticas.length, i: <AlertTriangle />, c: "red" }
         ].map((m, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm hover:shadow-xl transition-all">
               <div className="flex justify-between items-center mb-6">
                  <div className="p-3 bg-sky-50 text-blue-600 rounded-2xl shadow-inner">{m.i}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.l}</span>
               </div>
               <p className="text-5xl font-black text-slate-800 tracking-tighter">{m.v}</p>
               <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Unidades</p>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
         <div className="xl:col-span-2 space-y-12">
            <div className="bg-white rounded-[3rem] p-12 border border-blue-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative z-10 space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Sobre o Projeto</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <p className="text-slate-600 font-medium leading-relaxed">
                           O projeto <strong>Águas Vivas</strong> da Engenharia Eletrônica monitora a qualidade da água e do ar usando sensores inteligentes.
                        </p>
                        <div className={`p-8 rounded-[2.5rem] border ${resumoAmbiental.classe}`}>
                           <p className="font-black text-xs uppercase mb-2 tracking-widest">{resumoAmbiental.titulo}</p>
                           <p className="text-sm font-medium opacity-80">{resumoAmbiental.descricao}</p>
                        </div>
                     </div>
                     <div className="bg-sky-50 rounded-[2.5rem] p-8 border border-sky-100 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Como funciona</h4>
                        <div className="space-y-4 text-xs font-bold text-slate-700">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Envio de dados via rádio e internet
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Armazenamento em banco de dados
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Visualização em tempo real
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white rounded-[3rem] p-10 border border-blue-100 shadow-sm">
               <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8 border-b border-sky-50 pb-4">Últimas Estações</h2>
               <div className="space-y-5">
                  {ultimasBoias.map(boia => (
                     <div key={boia.id} className="flex items-center gap-5 group">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl p-2.5 flex-shrink-0 shadow-lg group-hover:rotate-3 transition-transform">
                           <img src={boia.imagem} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black text-slate-800 truncate">{boia.nome}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{boia.local}</p>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${boia.status === 'ok' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-400'}`}></div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
