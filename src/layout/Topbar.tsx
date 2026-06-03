// ========================================
// Autor: ivan_junior
// Data: 14/10/2024
// ========================================

import { Calendar } from "lucide-react";
import { EnvironmentalData } from "../types";

interface Props {
  data: EnvironmentalData[];
  theme?: "light" | "dark";
}

export function Topbar({ data, theme }: Props) {
  const latest = data[data.length - 1];

  return (
    <header className="bg-slate-50/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-gold-500/20 px-10 py-5 flex items-center justify-between sticky top-0 z-20 transition-colors duration-500">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-gold-500 tracking-tight uppercase">Dashboard <span className="text-sky-600 dark:text-gold-400">Hydra</span></h2>
        <p className="text-[10px] font-bold text-slate-400 dark:text-gold-500/50 uppercase tracking-widest">
          Projeto Hydra / IFSC Florianópolis - Monitoramento da Saúde das Águas
        </p>
      </div>

      {latest && (
        <div className="flex items-center gap-4 bg-white dark:bg-black px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-gold-500/30 shadow-sm transition-all duration-500">
          <div className="p-1.5 bg-sky-50 dark:bg-gold-500/10 text-sky-600 dark:text-gold-500 rounded-lg">
             <Calendar size={14} />
          </div>
          <div className="flex flex-col">
             <span className="text-[9px] font-black text-slate-400 dark:text-gold-500/40 uppercase tracking-widest">Sincronização</span>
             <span className="text-xs font-bold text-slate-700 dark:text-gold-500">{latest.timestamp}</span>
          </div>
        </div>
      )}
    </header>
  );
}