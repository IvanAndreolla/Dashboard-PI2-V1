import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { BoiaConfig, EnvironmentalData } from "../types";
import { AlertaTipo, gerarAlertasBoia } from "../utils/alertas";

interface Props {
  boias: BoiaConfig[];
  data: EnvironmentalData[];
  theme?: "light" | "dark";
}

function getCardClasses(tipo: AlertaTipo) {
  switch (tipo) {
    case "critico":
      return {
        border: "border-red-500 dark:border-gold-700",
        bg: "bg-red-50 dark:bg-black",
        icon: "text-red-600 dark:text-gold-700",
      };
    case "alerta":
      return {
        border: "border-yellow-500 dark:border-gold-600",
        bg: "bg-yellow-50 dark:bg-black",
        icon: "text-yellow-600 dark:text-gold-600",
      };
    case "ok":
      return {
        border: "border-green-500 dark:border-gold-500",
        bg: "bg-green-50 dark:bg-black",
        icon: "text-green-600 dark:text-gold-500",
      };
    default:
      return {
        border: "border-blue-500 dark:border-gold-900",
        bg: "bg-blue-50 dark:bg-black",
        icon: "text-blue-600 dark:text-gold-900",
      };
  }
}

function getIcon(tipo: AlertaTipo) {
  switch (tipo) {
    case "critico":
    case "alerta":
      return <AlertTriangle size={24} />;
    case "ok":
      return <CheckCircle2 size={24} />;
    default:
      return <Info size={24} />;
  }
}

export function Alertas({ boias, data, theme }: Props) {
  const alertas = (boias || [])
    .filter((boia) => boia.habilitada)
    .flatMap((boia) => gerarAlertasBoia(boia, data));

  const ordenados = [...alertas].sort((a, b) => {
    const prioridade: Record<AlertaTipo, number> = {
      critico: 0,
      alerta: 1,
      ok: 2,
      info: 3,
    };
    return prioridade[a.tipo] - prioridade[b.tipo];
  });

  return (
    <div className="p-8 lg:p-12 space-y-10 bg-slate-50 dark:bg-black min-h-screen transition-colors duration-500">
      <div className="border-b border-slate-200 dark:border-gold-500/20 pb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-gold-500 tracking-tight uppercase">Central de Alertas</h1>
        <p className="text-slate-500 dark:text-gold-500/50 font-medium">
          Monitoramento automatizado de limites críticos e conformidade ambiental.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {ordenados.map((alerta, index) => {
          const estilos = getCardClasses(alerta.tipo);

          return (
            <div
              key={index}
              className={`
                rounded-[2.5rem]
                border-l-[12px]
                shadow-xl
                dark:shadow-gold-500/5
                p-10
                transition-all
                duration-500
                hover:shadow-2xl
                dark:hover:shadow-[0_0_50px_rgba(212,175,55,0.2)]
                border-y border-r dark:border-gold-500/20
                ${estilos.border}
                ${estilos.bg}
              `}
            >
              <div className="flex items-start gap-8">
                <div className={`${estilos.icon} p-4 bg-white/50 dark:bg-gold-500/5 rounded-2xl shadow-inner`}>
                  {getIcon(alerta.tipo)}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <h2 className="font-black text-xl text-slate-900 dark:text-gold-500 uppercase tracking-tight">
                      {alerta.titulo}
                    </h2>

                    <span className="text-[10px] uppercase font-black bg-white dark:bg-gold-500/10 text-slate-900 dark:text-gold-500 px-4 py-1.5 rounded-full border border-slate-100 dark:border-gold-500/20 shadow-sm">
                      {alerta.tipo}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-gold-500/80 mt-4 leading-relaxed font-medium">
                    {alerta.descricao}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gold-500/40">
                    {alerta.timestamp && (
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gold-500/30"></div>
                        Stream: {alerta.timestamp}
                      </span>
                    )}

                    {alerta.sensor && (
                      <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gold-500/30"></div>
                        Métrica: {alerta.sensor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {ordenados.length === 0 && (
           <div className="col-span-full py-20 text-center text-slate-400 dark:text-gold-500/30 font-black uppercase tracking-widest italic">
              Nenhum alerta gerado pelas estações ativas.
           </div>
        )}
      </div>
    </div>
  );
}
