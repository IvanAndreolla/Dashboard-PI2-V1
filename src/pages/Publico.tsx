import {
  Droplets,
  Wind,
  Waves,
  ShieldCheck,
  AlertTriangle,
  Radio
} from "lucide-react";
import clsx from "clsx";

import { BoiaConfig, EnvironmentalData } from "../types";

interface Props {
  boias: BoiaConfig[];
  data: EnvironmentalData[];
  theme?: "light" | "dark";
}

function getUltimaLeitura(data: EnvironmentalData[], boiaId: string) {
  if (!data || !Array.isArray(data)) return null;
  const dados = data.filter((d) => d && d.boiaId === boiaId);
  return dados.length > 0 ? dados[dados.length - 1] : null;
}

function calcularQualidadeGeral(boias: BoiaConfig[]) {
  const ativas = (boias || []).filter((b) => b.habilitada);

  if (ativas.length === 0) {
    return {
      titulo: "Hydra em Inicialização",
      descricao: "Aguardando conexão com as estações.",
      cor: "bg-sky-50 text-sky-400 border-sky-100 dark:bg-black dark:text-gold-500/50 dark:border-gold-500/20",
      icone: <Radio size={32} />,
    };
  }

  if (ativas.some((b) => b.status === "critico")) {
    return {
      titulo: "Atenção Crítica",
      descricao: "Detectadas leituras fora dos padrões.",
      cor: "bg-red-50 text-red-600 border-red-100 dark:bg-black dark:text-red-500 dark:border-red-500/50",
      icone: <AlertTriangle size={32} />,
    };
  }

  if (ativas.some((b) => b.status === "alerta")) {
    return {
      titulo: "Monitoramento em Atenção",
      descricao: "Algumas estações exigem verificação técnica.",
      cor: "bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-black dark:text-gold-600 dark:border-gold-600/50",
      icone: <AlertTriangle size={32} />,
    };
  }

  if (ativas.some((b) => b.status === "offline")) {
    return {
      titulo: "Rede Parcial",
      descricao: "Algumas estações estão sem transmissão.",
      cor: "bg-slate-50 text-slate-400 border-slate-100 dark:bg-black dark:text-gold-500/40 dark:border-gold-500/20",
      icone: <Radio size={32} />,
    };
  }

  return {
    titulo: "Águas Estáveis",
    descricao: "Todos os parâmetros dentro da normalidade.",
    cor: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-black dark:text-gold-500 dark:border-gold-500/50",
    icone: <ShieldCheck size={32} />,
  };
}

function mediaTemperaturaAgua(boias: BoiaConfig[], data: EnvironmentalData[]) {
  if (!boias || !data) return null;
  const valores = boias
    .map((boia) => getUltimaLeitura(data, boia.id))
    .filter((d) => d != null && d.tempAgua != null)
    .map((d) => d!.tempAgua);

  if (valores.length === 0) return null;
  return valores.reduce((acc, v) => acc + v, 0) / valores.length;
}

function mediaVento(boias: BoiaConfig[], data: EnvironmentalData[]) {
  if (!boias || !data) return null;
  const valores = boias
    .map((boia) => getUltimaLeitura(data, boia.id))
    .filter((d) => d != null && d.ventoVel != null)
    .map((d) => d!.ventoVel);

  if (valores.length === 0) return null;
  return valores.reduce((acc, v) => acc + v, 0) / valores.length;
}

function getWindDirection(degree: number) {
  if (degree == null) return "--";
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degree / 45) % 8];
}

export function Publico({ boias, data, theme }: Props) {
  const boiasAtivas = (boias || []).filter((b) => b.habilitada);
  const qualidade = calcularQualidadeGeral(boiasAtivas);
  const tempMedia = mediaTemperaturaAgua(boiasAtivas, data);
  const ventoMedio = mediaVento(boiasAtivas, data);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6 lg:p-12 text-slate-900 dark:text-gold-500 selection:bg-sky-500 dark:selection:bg-gold-500 selection:text-white dark:selection:text-black transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* HEADER - MODERN THEME */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-slate-200 dark:border-gold-500/20 pb-16">
           <div className="flex items-center gap-8">
              <div className="w-28 h-28 bg-white dark:bg-gold-500/10 p-5 rounded-[2.5rem] shadow-xl dark:shadow-gold-500/5 border border-slate-200 dark:border-gold-500/30">
                 <img src="/assets/hydra.png" alt="Hydra" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-sky-600 dark:text-gold-400 font-black tracking-[0.3em] uppercase text-[10px]">
                    <span className="w-8 h-[2px] bg-sky-600 dark:bg-gold-500"></span>
                    Monitoramento Ambiental IFSC Florianópolis
                 </div>
                 <h1 className="text-6xl font-black text-slate-900 dark:text-gold-500 tracking-tighter leading-none">
                    Portal <span className="text-sky-600 dark:text-gold-600 italic">Águas Vivas</span>
                 </h1>
                 <p className="text-slate-500 dark:text-gold-500/60 text-xl font-medium max-w-xl">
                    Saúde das águas e transparência de dados para toda a sociedade.
                 </p>
              </div>
           </div>
           
           <div className={`px-12 py-8 rounded-[3rem] shadow-2xl flex items-center gap-8 border transition-all duration-500 ${theme === 'dark' ? qualidade.cor.replace('bg-sky-50', 'bg-slate-900/50').replace('bg-red-50', 'bg-red-950/30').replace('bg-blue-50', 'bg-blue-950/30').replace('border-sky-100', 'border-slate-800').replace('border-red-100', 'border-red-900/50').replace('border-blue-100', 'border-blue-900/50') : qualidade.cor}`}>
              <div className="p-5 bg-slate-100 dark:bg-gold-500/10 rounded-2xl border border-slate-200 dark:border-gold-500/20 shadow-inner text-slate-900 dark:text-gold-500">
                 {qualidade.icone}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gold-500/50 mb-2">Status do Portal</p>
                 <h2 className="text-3xl font-black leading-none tracking-tight text-slate-900 dark:text-gold-500">{qualidade.titulo}</h2>
              </div>
           </div>
        </div>

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="bg-white dark:bg-black p-12 rounded-[3.5rem] border border-slate-200 dark:border-gold-500/30 flex flex-col justify-between group hover:shadow-2xl dark:hover:shadow-[0_0_60px_rgba(212,175,55,0.25)] transition-all duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 dark:bg-gold-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="space-y-8 relative z-10">
                 <div className="w-20 h-20 bg-sky-50 dark:bg-gold-500/10 text-sky-600 dark:text-gold-500 rounded-[1.8rem] flex items-center justify-center border border-sky-100 dark:border-gold-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <Droplets size={40} />
                 </div>
                 <div>
                    <h3 className="text-slate-400 dark:text-gold-500/50 font-black uppercase text-[10px] tracking-[0.2em] mb-2">Temperatura Água</h3>
                    <p className="text-7xl font-black text-slate-900 dark:text-gold-500 tracking-tighter">
                       {tempMedia != null ? tempMedia.toFixed(1) : "--"}
                       <span className="text-3xl text-sky-300 dark:text-gold-500/30 ml-2">°C</span>
                    </p>
                 </div>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-gold-500/10">
                 <p className="text-[10px] text-slate-400 dark:text-gold-500/40 font-black uppercase tracking-widest">Média consolidada</p>
              </div>
           </div>

           <div className="bg-white dark:bg-black p-12 rounded-[3.5rem] border border-slate-200 dark:border-gold-500/30 flex flex-col justify-between group hover:shadow-2xl dark:hover:shadow-[0_0_60px_rgba(212,175,55,0.25)] transition-all duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-gold-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="space-y-8 relative z-10">
                 <div className="w-20 h-20 bg-blue-50 dark:bg-gold-500/10 text-blue-600 dark:text-gold-500 rounded-[1.8rem] flex items-center justify-center border border-blue-100 dark:border-gold-500/20 group-hover:-rotate-12 transition-all">
                    <Wind size={40} />
                 </div>
                 <div>
                    <h3 className="text-slate-400 dark:text-gold-500/50 font-black uppercase text-[10px] tracking-[0.2em] mb-2">Velocidade Vento</h3>
                    <p className="text-7xl font-black text-slate-900 dark:text-gold-500 tracking-tighter">
                       {ventoMedio != null ? ventoMedio.toFixed(1) : "--"}
                       <span className="text-3xl text-blue-200 dark:text-gold-500/30 ml-2">km/h</span>
                    </p>
                 </div>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-gold-500/10 flex items-center gap-4">
                 <div className="w-3 h-3 bg-sky-500 dark:bg-gold-500 rounded-full animate-ping shadow-[0_0_15px_rgba(14,165,233,0.8)]"></div>
                 <p className="text-[10px] text-sky-500 dark:text-gold-400 font-black uppercase tracking-widest">Transmissão Ativa</p>
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-sky-800 dark:from-black dark:to-slate-950 p-12 rounded-[3.5rem] shadow-2xl dark:border dark:border-gold-500/30 text-white dark:text-gold-500 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                 <Waves size={200} />
              </div>
              <div className="space-y-8 relative z-10">
                 <div className="w-20 h-20 bg-white/10 dark:bg-gold-500/10 text-white dark:text-gold-500 rounded-[1.8rem] flex items-center justify-center border border-white/20 dark:border-gold-500/20 backdrop-blur-md">
                    <ShieldCheck size={40} />
                 </div>
                 <div>
                    <h3 className="text-blue-100 dark:text-gold-400 font-black uppercase text-[10px] tracking-[0.2em] mb-2 opacity-80">Confiabilidade</h3>
                    <p className="text-7xl font-black tracking-tighter">
                       100<span className="text-3xl text-blue-300/50 dark:text-gold-500/30 ml-2">%</span>
                    </p>
                 </div>
              </div>
              <p className="text-xs text-blue-100/60 dark:text-gold-500/40 mt-12 font-bold uppercase tracking-[0.3em]">Sistemas Verificados</p>
           </div>
        </div>

        {/* ESTAÇÕES */}
        <div className="space-y-12">
          <div className="flex items-center gap-8">
             <h2 className="text-4xl font-black text-slate-900 dark:text-gold-500 tracking-tighter">Estações de Monitoramento</h2>
             <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 dark:from-gold-500/30 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {boiasAtivas.map((boia) => {
              const leitura = getUltimaLeitura(data, boia.id);

              return (
                <div key={boia.id} className="bg-white dark:bg-black rounded-[3.5rem] border border-slate-200 dark:border-gold-500/20 overflow-hidden hover:border-slate-300 dark:hover:border-gold-500 hover:shadow-2xl dark:hover:shadow-[0_0_60px_rgba(212,175,55,0.25)] transition-all duration-500 group">
                  <div className="p-12 pb-8">
                     <div className="flex justify-between items-start mb-10">
                        <div className="w-24 h-24 bg-white dark:bg-gold-500/10 rounded-[2.5rem] p-4 shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-gold-500/20">
                           <img src={boia.imagem} alt={boia.nome} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg ${leitura ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-gold-500/10 dark:text-gold-400 dark:border-gold-500/30' : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-black dark:text-gold-900 dark:border-gold-900/30'}`}>
                              {leitura ? 'SISTEMA ONLINE' : 'SISTEMA OFFLINE'}
                           </span>
                           <p className="text-[10px] text-slate-400 dark:text-gold-500/40 font-black mt-5 uppercase tracking-[0.2em]">{boia.local}</p>
                        </div>
                     </div>
                     <h3 className="text-4xl font-black text-slate-900 dark:text-gold-500 group-hover:text-sky-600 dark:group-hover:text-gold-400 transition-colors tracking-tighter">{boia.nome}</h3>
                  </div>

                  <div className="p-12 pt-4 grid grid-cols-2 gap-6">
                     <div className="bg-slate-50/50 dark:bg-black rounded-[2.5rem] p-8 border border-slate-200 dark:border-gold-500/20 group-hover:border-slate-300 dark:group-hover:border-gold-500 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/40 uppercase tracking-widest mb-3">Água</p>
                        <p className="text-4xl font-black text-sky-600 dark:text-gold-500 tracking-tighter">
                          {leitura && leitura.tempAgua != null ? `${leitura.tempAgua.toFixed(1)}°` : '--'}
                        </p>
                     </div>
                     <div className="bg-slate-50/50 dark:bg-black rounded-[2.5rem] p-8 border border-slate-200 dark:border-gold-500/20 group-hover:border-slate-300 dark:group-hover:border-gold-500 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/40 uppercase tracking-widest mb-3">Vento</p>
                        <div className="flex items-center gap-3">
                           <p className="text-4xl font-black text-blue-600 dark:text-gold-400 tracking-tighter">
                             {leitura && leitura.ventoDir != null ? getWindDirection(leitura.ventoDir) : '--'}
                           </p>
                           <span className="text-[10px] font-black text-slate-300 dark:text-gold-500/30 mt-2">
                             {leitura && leitura.ventoVel != null ? `${leitura.ventoVel.toFixed(0)}km` : ''}
                           </span>
                        </div>
                     </div>
                     <div className="bg-slate-50/50 dark:bg-black rounded-[2.5rem] p-8 border border-slate-200 dark:border-gold-500/20 group-hover:border-slate-300 dark:group-hover:border-gold-500 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/40 uppercase tracking-widest mb-3">pH</p>
                        <p className="text-4xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter">
                          {leitura && leitura.phAgua != null ? leitura.phAgua.toFixed(1) : '--'}
                        </p>
                     </div>
                     <div className="bg-slate-50/50 dark:bg-black rounded-[2.5rem] p-8 border border-slate-200 dark:border-gold-500/20 group-hover:border-slate-300 dark:group-hover:border-gold-500 transition-colors">
                        <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/40 uppercase tracking-widest mb-3">Turbidez</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-gold-200 tracking-tighter">
                          {leitura && leitura.turbidez != null ? leitura.turbidez.toFixed(0) : '--'}
                        </p>
                     </div>
                  </div>

                  <div className="px-12 py-8 bg-slate-50/30 dark:bg-gold-500/5 flex justify-between items-center border-t border-slate-200 dark:border-gold-500/20">
                     <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${leitura ? 'bg-emerald-500 dark:bg-gold-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] dark:shadow-gold-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/30 uppercase tracking-[0.2em]">
                           {leitura && leitura.timestamp ? `SINC: ${new Date(leitura.timestamp.includes('T') ? leitura.timestamp : leitura.timestamp.replace(' ', 'T')).toLocaleTimeString()}` : 'AGUARDANDO CONEXÃO'}
                        </p>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INSTITUCIONAL */}
        <div className="bg-white dark:bg-black rounded-[4.5rem] p-20 border border-slate-200 dark:border-gold-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sky-50 dark:from-gold-500/5 to-transparent"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-10">
                <div className="w-24 h-24 bg-white dark:bg-gold-500/10 p-4 rounded-3xl border border-slate-100 dark:border-gold-500/20 shadow-xl">
                   <img src="/assets/logoifscvertical.jpeg" alt="IFSC" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-6xl font-black text-slate-900 dark:text-gold-500 tracking-tighter leading-tight">Ciência Aberta e Integração</h2>
                <p className="text-slate-500 dark:text-gold-500/60 text-2xl leading-relaxed font-medium">
                   O Projeto <strong>Águas Vivas</strong> é uma plataforma aberta onde <strong>instituições parceiras</strong> podem integrar seus próprios dados, democratizando o acesso à saúde ambiental catarinense.
                </p>
                <div className="flex gap-6">
                   <div className="px-10 py-5 bg-slate-100 dark:bg-gold-500/10 text-slate-600 dark:text-gold-500 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border border-slate-200 dark:border-gold-500/30">Colaboração Acadêmica</div>
                   <div className="px-10 py-5 bg-sky-600 dark:bg-gold-600 text-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-sky-600/20 dark:shadow-gold-600/20">IFSC / Campus Florianópolis</div>
                </div>
             </div>
             <div className="bg-slate-50 dark:bg-black rounded-[4rem] p-12 border border-slate-200 dark:border-gold-500/20 shadow-inner relative">
                <div className="w-16 h-1.5 bg-sky-500 dark:bg-gold-500 mb-10 rounded-full"></div>
                <h4 className="text-3xl font-bold text-slate-800 dark:text-gold-500 tracking-tight italic opacity-90 leading-snug">"O monitoramento compartilhado é a chave para a preservação definitiva dos nossos ecossistemas."</h4>
                <div className="mt-12 flex items-center gap-4">
                   <div className="w-8 h-[1px] bg-slate-300 dark:bg-gold-500/30"></div>
                   <p className="text-sky-600 dark:text-gold-400 font-black uppercase text-[10px] tracking-[0.3em]">Desenvolvido por Alunos da Eletrônica / Hydra</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
