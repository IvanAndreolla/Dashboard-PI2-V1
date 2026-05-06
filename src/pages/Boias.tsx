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
}

function getStatusColor(status: string) {
  switch (status) {
    case "ok":
      return "bg-green-500";
    case "alerta":
      return "bg-yellow-400";
    case "critico":
      return "bg-red-500";
    case "offline":
      return "bg-gray-400";
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

export function Boias({ boias, setBoiaSelecionada, setPage }: Props) {
  const boiasHabilitadas = boias.filter((boia) => boia.habilitada);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Boias monitoradas</h1>

      {boiasHabilitadas.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Nenhuma boia habilitada</h2>
          <p className="text-gray-500">
            Vá até a aba Admin e habilite pelo menos uma boia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boiasHabilitadas.map((boia) => (
            <div
              key={boia.id}
              onClick={() => {
                setBoiaSelecionada(boia.id);
                setPage("boiaDetalhe");
              }}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
            >
              <div className="relative h-56 bg-black flex items-center justify-center">
                <img
                  src={boia.imagem}
                  alt={boia.nome}
                  className="max-h-full max-w-full object-contain"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(
                      boia.status
                    )}`}
                  />
                  <span className="text-white text-sm font-medium">
                    {getStatusText(boia.status)}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 text-white text-xl font-bold drop-shadow">
                  {boia.nome}
                </div>
              </div>

              <div className="p-4">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}