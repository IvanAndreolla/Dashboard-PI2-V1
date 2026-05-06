// ========================================
// Autor: ivan_junior
// Data: 14/10/2024
// ========================================

import { Calendar } from "lucide-react";
import { EnvironmentalData } from "../types";

interface Props {
  data: EnvironmentalData[];
}

export function Topbar({ data }: Props) {
  const latest = data[data.length - 1];

  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Projeto Águas Vivas</h2>
        <p className="text-sm text-gray-500">
          Dashboard de Monitoramento Ambiental
        </p>
      </div>

      {latest && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span className="font-medium">Última leitura:</span>
          <span>{latest.timestamp}</span>
        </div>
      )}
    </header>
  );
}