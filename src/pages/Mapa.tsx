import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import { BoiaConfig, EnvironmentalData } from "../types";

type Page =
  | "dashboard"
  | "boias"
  | "alertas"
  | "historico"
  | "boiaDetalhe"
  | "admin"
  | "mapa";

interface Props {
  boias: BoiaConfig[];
  data: EnvironmentalData[];
  setBoiaSelecionada: (id: string) => void;
  setPage: (page: Page) => void;
  theme?: "light" | "dark";
}

function getCorStatus(status: string, theme?: string) {
  if (status === "critico") return theme === "dark" ? "#916408" : "#dc2626";
  if (status === "alerta") return theme === "dark" ? "#b8860b" : "#f59e0b";
  if (status === "ok") return theme === "dark" ? "#d4af37" : "#16a34a";
  return "#6b7280";
}

function getTextoStatus(status: string) {
  if (status === "critico") return "Crítico";
  if (status === "alerta") return "Atenção";
  if (status === "ok") return "Operando";
  return "Offline";
}

function criarIcone(status: string, theme?: string) {
  const cor = getCorStatus(status, theme);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: ${cor};
        border: 3px solid ${theme === 'dark' ? 'black' : 'white'};
        box-shadow: 0 0 16px ${cor};
      "></div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function getUltimaLeitura(data: EnvironmentalData[], boiaId: string) {
  const dados = data.filter((leitura) => leitura.boiaId === boiaId);
  return dados[dados.length - 1];
}

export function Mapa({ boias, data, setBoiaSelecionada, setPage, theme }: Props) {
  const boiasAtivas = boias.filter((boia) => boia.habilitada);

  return (
    <div className="p-8 lg:p-12 space-y-10 bg-slate-50 dark:bg-black min-h-screen transition-colors duration-500">
      <div className="border-b border-slate-200 dark:border-gold-500/20 pb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-gold-500 tracking-tight uppercase">Geomonitoramento</h1>
        <p className="text-slate-500 dark:text-gold-500/50 font-medium">
          Mapeamento espacial das estações e telemetria georreferenciada.
        </p>
      </div>

      <div className="bg-white dark:bg-black rounded-[3rem] shadow-2xl dark:shadow-gold-500/5 overflow-hidden relative border border-slate-100 dark:border-gold-500/20">
        <div className="absolute z-[500] bottom-8 left-8 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 text-sm space-y-4 border border-slate-200 dark:border-gold-500/30">
          <h3 className="font-black uppercase text-[10px] tracking-widest text-slate-400 dark:text-gold-500/50">Legenda Operacional</h3>

          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 dark:bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
            <span className="font-bold text-slate-700 dark:text-gold-500/80">Operando</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-gold-600" />
            <span className="font-bold text-slate-700 dark:text-gold-500/80">Atenção</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-600 dark:bg-gold-800" />
            <span className="font-bold text-slate-700 dark:text-gold-500/80">Crítico</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-gray-500 dark:bg-gold-950" />
            <span className="font-bold text-slate-700 dark:text-gold-500/80">Offline</span>
          </div>
        </div>

        <div className="h-[650px]">
          <MapContainer
            center={[-27.5969, -48.4673]}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full"
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Cartográfico">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url={theme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satélite">
                <TileLayer
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {boiasAtivas.map((boia) => {
              const ultima = getUltimaLeitura(data, boia.id);
              const corStatus = getCorStatus(boia.status, theme);

              if (boia.latitude == null || boia.longitude == null) return null;

              return (
                <Marker
                  key={`${boia.id}-${boia.latitude}-${boia.longitude}`}
                  position={[boia.latitude, boia.longitude]}
                  icon={criarIcone(boia.status, theme)}
                >
                  <Popup>
                    <div className={`min-w-64 p-2 space-y-4 ${theme === 'dark' ? 'text-gold-500' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl p-2 shadow-lg">
                            <img
                              src={boia.imagem}
                              alt={boia.nome}
                              className="w-full h-full object-contain"
                            />
                        </div>

                        <div>
                          <p className="text-sm font-black uppercase tracking-tight">{boia.nome}</p>

                          <div
                            className="mt-1 inline-block text-white dark:text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg"
                            style={{ backgroundColor: corStatus }}
                          >
                            {getTextoStatus(boia.status)}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] space-y-2 border-t border-slate-100 dark:border-gold-500/10 pt-4">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-400 dark:text-gold-500/40 uppercase">Última Telemetria</span>
                          <span className="font-black">{ultima ? ultima.timestamp : "sem dados"}</span>
                        </div>

                        {ultima ? (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-slate-50 dark:bg-gold-500/5 p-2 rounded-lg">
                                <p className="text-[8px] font-black text-slate-400 dark:text-gold-500/40 uppercase">Água</p>
                                <p className="text-xs font-black">{ultima.tempAgua.toFixed(1)} °C</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-gold-500/5 p-2 rounded-lg">
                                <p className="text-[8px] font-black text-slate-400 dark:text-gold-500/40 uppercase">pH</p>
                                <p className="text-xs font-black">{ultima.phAgua.toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-gold-500/5 p-2 rounded-lg">
                                <p className="text-[8px] font-black text-slate-400 dark:text-gold-500/40 uppercase">Turbidez</p>
                                <p className="text-xs font-black">{ultima.turbidez.toFixed(1)}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-gold-500/5 p-2 rounded-lg">
                                <p className="text-[8px] font-black text-slate-400 dark:text-gold-500/40 uppercase">Condutiv.</p>
                                <p className="text-xs font-black">{ultima.condutivEC.toFixed(0)}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">
                            Aguardando stream de dados...
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setBoiaSelecionada(boia.id);
                          setPage("boiaDetalhe");
                        }}
                        className="w-full bg-slate-900 dark:bg-gold-500 text-white dark:text-black py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 dark:hover:bg-gold-400 transition-all"
                      >
                        Perfil da Estação
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}