import {
  Droplets,
  Wind,
  Waves,
  ShieldCheck,
  AlertTriangle,
  Radio
} from "lucide-react";

import { BoiaConfig, EnvironmentalData } from "../types";

interface Props {
  boias: BoiaConfig[];
  data: EnvironmentalData[];
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
      titulo: "Rede em Inicialização",
      descricao: "Aguardando conexão com as estações.",
      cor: "bg-sky-50 text-sky-400 border-sky-100",
      icone: <Radio size={32} />,
    };
  }

  if (ativas.some((b) => b.status === "critico")) {
    return {
      titulo: "Atenção Crítica",
      descricao: "Detectadas leituras fora dos padrões.",
      cor: "bg-red-50 text-red-600 border-red-100",
      icone: <AlertTriangle size={32} />,
    };
  }

  return {
    titulo: "Águas Estáveis",
    descricao: "Todos os parâmetros dentro da normalidade.",
    cor: "bg-blue-50 text-blue-600 border-blue-100",
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

export function Publico({ boias, data }: Props) {
  const boiasAtivas = (boias || []).filter((b) => b.habilitada);
  const qualidade = calcularQualidadeGeral(boiasAtivas);
  const tempMedia = mediaTemperaturaAgua(boiasAtivas, data);
  const ventoMedio = mediaVento(boiasAtivas, data);

  return (
    <div className="min-h-screen bg-sky-50/50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER - SEA THEME */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-sky-100 pb-12">
           <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white p-4 rounded-3xl shadow-xl border border-sky-100">
                 <img src="/assets/hydra.png" alt="Hydra" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-2 text-blue-600 font-black tracking-widest uppercase text-[10px]">
                    <span className="w-6 h-[2px] bg-blue-600"></span>
                    Portal Águas Vivas
                 </div>
                 <h1 className="text-5xl font-black text-blue-900 tracking-tight">
                    Monitoramento <span className="text-sky-500">Ambiental</span>
                 </h1>
                 <p className="text-blue-700/60 text-lg font-medium">
                    Dados hidrológicos em tempo real para a comunidade do IFSC.
                 </p>
              </div>
           </div>
           
           <div className={`px-10 py-6 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 flex items-center gap-6 border ${qualidade.cor}`}>
              <div className="p-4 bg-white/50 rounded-2xl">
                 {qualidade.icone}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Status Marinho</p>
                 <h2 className="text-2xl font-black leading-none tracking-tight">{qualidade.titulo}</h2>
              </div>
           </div>
        </div>

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-sky-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
              <div className="space-y-6">
                 <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Droplets size={32} />
                 </div>
                 <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Temperatura Água</h3>
                 <p className="text-6xl font-black text-blue-900 tracking-tighter">
                    {tempMedia != null ? tempMedia.toFixed(1) : "--"}
                    <span className="text-3xl text-sky-200 ml-1">°C</span>
                 </p>
              </div>
              <div className="mt-10 pt-6 border-t border-sky-50">
                 <p className="text-[10px] text-slate-400 font-black uppercase">Média em {boiasAtivas.length} estações</p>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-sky-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
              <div className="space-y-6">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Wind size={32} />
                 </div>
                 <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Rajada de Vento</h3>
                 <p className="text-6xl font-black text-blue-900 tracking-tighter">
                    {ventoMedio != null ? ventoMedio.toFixed(1) : "--"}
                    <span className="text-3xl text-sky-200 ml-1">km/h</span>
                 </p>
              </div>
              <div className="mt-10 pt-6 border-t border-sky-50 flex items-center gap-3">
                 <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                 <p className="text-[10px] text-sky-500 font-black uppercase">Telemetria Sincronizada</p>
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-600 to-sky-700 p-10 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Waves size={160} />
              </div>
              <div className="space-y-6 relative z-10">
                 <div className="w-16 h-16 bg-white/20 text-white rounded-[1.5rem] flex items-center justify-center">
                    <ShieldCheck size={32} />
                 </div>
                 <h3 className="text-blue-100 font-black uppercase text-[10px] tracking-widest opacity-80">Rede Operacional</h3>
                 <p className="text-6xl font-black tracking-tighter">
                    100<span className="text-3xl text-blue-300 ml-1">%</span>
                 </p>
              </div>
              <p className="text-xs text-blue-100 mt-10 font-bold uppercase tracking-widest">Sistemas Ativos</p>
           </div>
        </div>

        {/* ESTAÇÕES */}
        <div className="space-y-10">
          <div className="flex items-center gap-6">
             <h2 className="text-3xl font-black text-blue-900 tracking-tight">Estações de Campo</h2>
             <div className="h-[2px] flex-1 bg-sky-100"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {boiasAtivas.map((boia) => {
              const leitura = getUltimaLeitura(data, boia.id);

              return (
                <div key={boia.id} className="bg-white rounded-[3rem] shadow-sm border border-sky-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                  <div className="p-10 pb-6">
                     <div className="flex justify-between items-start mb-8">
                        <div className="w-20 h-20 bg-slate-900 rounded-[2rem] p-3 shadow-2xl ring-8 ring-sky-50 group-hover:scale-105 transition-transform">
                           <img src={boia.imagem} alt={boia.nome} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${leitura ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {leitura ? 'ONLINE' : 'OFFLINE'}
                           </span>
                           <p className="text-[10px] text-slate-400 font-black mt-3 uppercase tracking-widest">{boia.local}</p>
                        </div>
                     </div>
                     <h3 className="text-3xl font-black text-blue-900 group-hover:text-sky-600 transition-colors tracking-tight">{boia.nome}</h3>
                  </div>

                  <div className="p-10 pt-4 grid grid-cols-2 gap-5">
                     <div className="bg-sky-50/50 rounded-[2rem] p-6 border border-sky-100/50 hover:bg-white transition-colors">
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Água</p>
                        <p className="text-3xl font-black text-blue-800 tracking-tighter">
                          {leitura && leitura.tempAgua != null ? `${leitura.tempAgua.toFixed(1)}°` : '--'}
                        </p>
                     </div>
                     <div className="bg-sky-50/50 rounded-[2rem] p-6 border border-sky-100/50 hover:bg-white transition-colors">
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Vento</p>
                        <div className="flex items-center gap-2">
                           <p className="text-3xl font-black text-blue-800 tracking-tighter">
                             {leitura && leitura.ventoDir != null ? getWindDirection(leitura.ventoDir) : '--'}
                           </p>
                           <span className="text-[10px] font-black text-sky-300 mt-2">
                             {leitura && leitura.ventoVel != null ? `${leitura.ventoVel.toFixed(0)}km/h` : ''}
                           </span>
                        </div>
                     </div>
                     <div className="bg-sky-50/50 rounded-[2rem] p-6 border border-sky-100/50 hover:bg-white transition-colors">
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">pH</p>
                        <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                          {leitura && leitura.phAgua != null ? leitura.phAgua.toFixed(1) : '--'}
                        </p>
                     </div>
                     <div className="bg-sky-50/50 rounded-[2rem] p-6 border border-sky-100/50 hover:bg-white transition-colors">
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">NTU</p>
                        <p className="text-3xl font-black text-blue-800 tracking-tighter">
                          {leitura && leitura.turbidez != null ? leitura.turbidez.toFixed(0) : '--'}
                        </p>
                     </div>
                  </div>

                  <div className="px-10 py-6 bg-sky-50/30 flex justify-between items-center border-t border-sky-100/50">
                     <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${leitura ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                           {leitura && leitura.timestamp ? `Sinc: ${new Date(leitura.timestamp.includes('T') ? leitura.timestamp : leitura.timestamp.replace(' ', 'T')).toLocaleTimeString()}` : 'Aguardando'}
                        </p>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INSTITUCIONAL */}
        <div className="bg-white rounded-[4rem] p-16 border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sky-50 to-transparent"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-8">
                <div className="w-20 h-20">
                   <img src="/assets/logoifscvertical.jpeg" alt="IFSC" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-5xl font-black text-blue-900 tracking-tighter leading-tight">Compromisso com a Ciência Aberta</h2>
                <p className="text-slate-500 text-xl leading-relaxed font-medium">
                   O Projeto <strong>Águas Vivas</strong> democratiza o monitoramento ambiental, transformando sensores complexos em informações acessíveis para toda a sociedade.
                </p>
                <div className="flex gap-4">
                   <div className="px-8 py-4 bg-sky-100 text-sky-700 rounded-2xl text-xs font-black uppercase tracking-widest">Pesquisa</div>
                   <div className="px-8 py-4 bg-blue-100 text-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest">IFSC</div>
                </div>
             </div>
             <div className="bg-sky-50 rounded-[3rem] p-10 border border-sky-100 shadow-inner">
                <div className="w-12 h-1 bg-sky-400 mb-8 rounded-full"></div>
                <h4 className="text-2xl font-bold text-blue-900 tracking-tight italic opacity-90">"A transparência dos dados é o primeiro passo para a mudança ambiental definitiva."</h4>
                <p className="text-sky-600 mt-8 font-black uppercase text-[10px] tracking-widest">Equipe de Desenvolvimento Hydra / IFSC</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
