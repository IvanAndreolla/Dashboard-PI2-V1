import { BoiaConfig } from "../types";

type Page =
  | "dashboard"
  | "boias"
  | "alertas"
  | "historico"
  | "boiaDetalhe"
  | "admin";

interface Props {
  boias: BoiaConfig[];
  setBoiaSelecionada: (id: string) => void;
  setPage: (page: Page) => void;
  theme?: "light" | "dark";
}

function getStatusColor(status: string) {
  switch (status) {
    case "ok":
      return "bg-green-500 dark:bg-gold-500";
    case "alerta":
      return "bg-yellow-400 dark:bg-gold-600";
    case "critico":
      return "bg-red-500 dark:bg-gold-700";
    case "offline":
      return "bg-gray-400 dark:bg-gold-900";
    default:
      return "bg-gray-400";
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "ok":
      return "Operando";
    case "alerta":
      return "Atenção";
    case "critico":
      return "Crítico";
    case "offline":
      return "Offline";
    default:
      return "Desconhecido";
  }
}

export function Boias({ boias, setBoiaSelecionada, setPage, theme }: Props) {
  const boiasHabilitadas = boias.filter((boia) => boia.habilitada);

  return (
    <div className="p-10 space-y-10 bg-slate-50 dark:bg-black min-h-screen transition-colors duration-500">
      <h1 className="text-4xl font-black text-slate-900 dark:text-gold-500 tracking-tight uppercase">Estações de Campo</h1>

      {boiasHabilitadas.length === 0 ? (
        <div className="bg-white dark:bg-black rounded-[3rem] shadow border border-slate-100 dark:border-gold-500/20 p-16 text-center">
          <h2 className="text-2xl font-black mb-4 text-slate-800 dark:text-gold-500">Nenhuma estação cadastrada</h2>
          <p className="text-slate-400 dark:text-gold-500/50">
            Utilize o painel de administração para configurar novas boias no sistema.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {boiasHabilitadas.map((boia) => (
            <div
              key={boia.id}
              onClick={() => {
                setBoiaSelecionada(boia.id);
                setPage("boiaDetalhe");
              }}
              className="bg-white dark:bg-black rounded-[2.5rem] shadow-xl dark:shadow-gold-500/5 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:hover:shadow-[0_0_60px_rgba(212,175,55,0.3)] border border-slate-100 dark:border-gold-500/30 group"
            >
              <div className="relative h-64 bg-slate-900 flex items-center justify-center p-8">
                <img
                  src={boia.imagem}
                  alt={boia.nome}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 dark:border-gold-500/20">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      boia.status
                    )} animate-pulse`}
                  />
                  <span className="text-white dark:text-gold-500 text-[10px] font-black uppercase tracking-widest">
                    {getStatusText(boia.status)}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 text-white dark:text-gold-500 text-2xl font-black tracking-tight drop-shadow-xl uppercase">
                  {boia.nome}
                </div>
              </div>

              <div className="p-8">
                <p className="text-[10px] font-black text-slate-400 dark:text-gold-500/40 uppercase tracking-widest mb-4">Localização: {boia.local}</p>
                <button className="w-full bg-slate-900 dark:bg-gold-500 text-white dark:text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 dark:hover:bg-gold-400 transition-all duration-300">
                  Analisar Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}