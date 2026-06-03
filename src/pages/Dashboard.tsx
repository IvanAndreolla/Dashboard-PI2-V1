import {
  AlertTriangle,
  Database,
  Radio,
  Waves,
  Activity,
  ShieldCheck
} from "lucide-react";

import { BoiaConfig, EnvironmentalData } from "../types";

interface Props {
  data: EnvironmentalData[];
  boias: BoiaConfig[];
  theme?: "light" | "dark";
  setPage: (p: any) => void;
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
    titulo: "Hydra Offline",
    descricao: "Aguardando ativação das estações.",
    classe: "bg-slate-100 text-slate-500 dark:bg-black dark:text-gold-500/50 dark:border-gold-500/20",
    };
  }

  if (ativas.some((boia) => boia.status === "critico")) {
    return {
      titulo: "Estado Crítico",
      descricao: "Anomalias graves detectadas em campo.",
      classe: "bg-red-50 text-red-700 border border-red-200 dark:bg-black dark:text-red-500 dark:border-red-500/50",
    };
  }

  if (ativas.some((boia) => boia.status === "alerta")) {
    return {
      titulo: "Atenção Operacional",
      descricao: "Algumas estações operando fora do padrão ideal.",
      classe: "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-black dark:text-gold-600 dark:border-gold-600/50",
    };
  }

  if (ativas.some((boia) => boia.status === "offline")) {
    return {
      titulo: "Estações Offline",
      descricao: "Parte da frota perdeu sincronia de dados.",
      classe: "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-black dark:text-gold-500/40 dark:border-gold-500/20",
    };
  }

  return {
    titulo: "Saúde Estável",
    descricao: "Todos os sistemas operando nos conformes.",
    classe: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-black dark:text-gold-500 dark:border-gold-500/50",
  };
}

export function Dashboard({ data, boias, theme, setPage }: Props) {
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
    <div className="p-8 lg:p-12 space-y-12 bg-slate-50 dark:bg-black min-h-screen transition-colors duration-500">
      
      {/* HERO SECTION - SIMPLIFIED */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 dark:from-black dark:via-slate-950 dark:to-black text-white dark:text-gold-500 shadow-2xl dark:border dark:border-gold-500/20">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
           <Waves size={300} />
        </div>

        <div className="relative z-10 p-12 lg:p-16 text-center lg:text-left">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 dark:bg-gold-500/10 rounded-full border border-white/20 dark:border-gold-500/30 backdrop-blur-md">
               <div className="w-1.5 h-1.5 bg-sky-400 dark:bg-gold-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-sky-100 dark:text-gold-400">
                  Sistema de Monitoramento Hidrológico
               </span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-black tracking-tight leading-none drop-shadow-lg uppercase">
               Projeto<br/>
               <span className="text-sky-400 dark:text-gold-500 italic">Águas Vivas</span>
            </h1>

            <p className="text-xl text-blue-100/80 dark:text-gold-500/80 max-w-2xl font-medium leading-relaxed">
               Desenvolvido por alunos da <strong>Engenharia Eletrônica do IFSC Florianópolis</strong>, o Hydra é uma plataforma aberta para acompanhamento em tempo real da saúde das águas, integrando dados de diversas instituições parceiras.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
               <div className="px-8 py-4 bg-sky-500 dark:bg-gold-500 text-white dark:text-black rounded-2xl font-black uppercase text-xs shadow-xl shadow-sky-500/20 dark:shadow-gold-500/20 hover:scale-105 transition-all cursor-default">
                  Plataforma Ativa
               </div>
               <div className="px-8 py-4 bg-white/10 dark:bg-gold-500/5 text-white dark:text-gold-500 border border-white/20 dark:border-gold-500/30 rounded-2xl font-black uppercase text-xs backdrop-blur-sm hover:bg-white/20 transition-all cursor-default">
                  IFSC - Florianópolis
               </div>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="relative z-10 border-t border-white/10 dark:border-gold-500/20 bg-black/20 dark:bg-black/40 backdrop-blur-md p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { l: "Total de Boias", v: boiasAtivas.length, i: <Database size={16}/> },
             { l: "Leituras Salvas", v: (data || []).length, i: <Activity size={16}/> },
             { l: "Último Dado", v: formatarHora(ultimaLeitura?.timestamp), i: <Waves size={16}/> },
             { l: "Status Geral", v: "HYDRA ONLINE", i: <ShieldCheck size={16}/> }
           ].map((s, idx) => (
             <div key={idx} className="flex flex-col gap-1 border-l border-white/10 dark:border-gold-500/20 pl-8 first:border-0">
                <div className="flex items-center gap-2 text-sky-300 dark:text-gold-500">
                   {s.i}
                   <span className="text-[9px] font-black uppercase tracking-[0.2em]">{s.l}</span>
                </div>
                <p className="text-3xl font-black tracking-tighter text-white dark:text-gold-500">{s.v}</p>
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
            <div key={i} className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-slate-200 dark:border-gold-500/30 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300">
               <div className="flex justify-between items-center mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-gold-500/10 text-blue-600 dark:text-gold-500 rounded-2xl shadow-inner border border-slate-100 dark:border-gold-500/20">{m.i}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gold-500/50">{m.l}</span>
               </div>
               <p className="text-5xl font-black text-slate-800 dark:text-gold-500 tracking-tighter">{m.v}</p>
               <p className="text-[10px] font-bold text-slate-400 dark:text-gold-500/30 mt-2 uppercase tracking-widest">Unidades</p>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
         <div className="xl:col-span-2 space-y-12">
            <div className="bg-white dark:bg-black rounded-[3rem] p-12 border border-slate-200 dark:border-gold-500/30 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-gold-500/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative z-10 space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-gold-500 tracking-tight uppercase border-b-4 border-sky-500 dark:border-gold-500 pb-2 inline-block">Sobre o Projeto</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <p className="text-slate-600 dark:text-gold-400 font-medium leading-relaxed text-justify">
                           O projeto <strong>Águas Vivas</strong> é uma iniciativa colaborativa do curso de <strong>Engenharia Eletrônica do IFSC Florianópolis</strong>. O objetivo central é fornecer uma ferramenta acessível para que a sociedade e a comunidade acadêmica possam acompanhar de perto a saúde dos nossos recursos hídricos.
                        </p>
                        <p className="text-slate-600 dark:text-gold-400 font-medium leading-relaxed text-justify">
                           A plataforma Hydra foi desenhada para ser universal: <strong>diversas instituições</strong>, órgãos ambientais e laboratórios de pesquisa podem utilizar este dashboard para cadastrar e monitorar suas próprias boias, independentemente da tecnologia de comunicação utilizada em cada estação.
                        </p>
                        <div className={`p-8 rounded-[2.5rem] border ${resumoAmbiental.classe} shadow-inner`}>
                           <p className="font-black text-xs uppercase mb-2 tracking-widest">{resumoAmbiental.titulo}</p>
                           <p className="text-sm font-medium opacity-80">{resumoAmbiental.descricao}</p>
                        </div>
                     </div>
                     <div className="bg-slate-900 dark:bg-gold-500/5 rounded-[2.5rem] p-8 border border-slate-800 dark:border-gold-500/30 space-y-8 text-white dark:text-gold-500">
                        <div>
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400 dark:text-gold-400 mb-4">Recursos do Portal</h4>
                           <div className="space-y-4 text-sm font-medium text-slate-300 dark:text-gold-500/80">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-sky-500 dark:bg-gold-500 rounded-full"></div> Cadastro de Novas Instituições
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-sky-500 dark:bg-gold-500 rounded-full"></div> Monitoramento em Tempo Real
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-sky-500 dark:bg-gold-500 rounded-full"></div> Histórico de Dados Exportáveis
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-sky-500 dark:bg-gold-500 rounded-full"></div> Alertas e Notificações de Saúde
                              </div>
                           </div>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-800 dark:border-gold-500/20">
                           <p className="text-xs text-slate-400 dark:text-gold-500/50 italic">
                              "Integrando instituições e democratizando o acesso aos dados ambientais de Santa Catarina."
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white dark:bg-black rounded-[3rem] p-10 border border-slate-200 dark:border-gold-500/30 shadow-sm">
               <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-gold-500 mb-8 border-b border-slate-100 dark:border-gold-500/20 pb-4">Últimas Estações</h2>
               <div className="space-y-5">
                  {ultimasBoias.map(boia => (
                     <div key={boia.id} className="flex items-center gap-5 group p-2 hover:bg-slate-50 dark:hover:bg-gold-500/5 rounded-2xl transition-colors">
                        <div className="w-14 h-14 bg-slate-900 dark:bg-gold-950 rounded-2xl p-2.5 flex-shrink-0 shadow-lg group-hover:rotate-3 transition-transform">
                           <img src={boia.imagem} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black text-slate-800 dark:text-gold-500 truncate">{boia.nome}</p>
                           <p className="text-[10px] text-slate-400 dark:text-gold-500/50 font-bold uppercase">{boia.local}</p>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${boia.status === 'ok' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-400'}`}></div>
                     </div>
                  ))}
               </div>
               <button 
                  onClick={() => setPage("boias")}
                  className="w-full mt-8 py-4 bg-slate-50 dark:bg-gold-500/10 text-slate-400 dark:text-gold-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-gold-500/20 transition-colors"
               >
                  Ver Todas as Estações
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
