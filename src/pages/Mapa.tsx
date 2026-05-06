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
}

const posicoesBoias: Record<string, { lat: number; lng: number }> = {
  medusa: { lat: -27.603671, lng: -48.552147 },
  netuno: { lat: -27.599, lng: -48.464 },
  hipocampo: { lat: -27.594, lng: -48.462 },
  nautilus: { lat: -27.601, lng: -48.469 },
  kraken: { lat: -27.592, lng: -48.466 },
  ostradamus: { lat: -27.598, lng: -48.471 },
};

function getCorStatus(status: string) {
  if (status === "critico") return "#dc2626";
  if (status === "alerta") return "#f59e0b";
  if (status === "ok") return "#16a34a";
  return "#6b7280";
}

function getTextoStatus(status: string) {
  if (status === "critico") return "Crítico";
  if (status === "alerta") return "Atenção";
  if (status === "ok") return "Operando";
  return "Offline";
}

function criarIcone(status: string) {
  const cor = getCorStatus(status);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: ${cor};
        border: 3px solid white;
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

export function Mapa({ boias, data, setBoiaSelecionada, setPage }: Props) {
  const boiasAtivas = boias.filter((boia) => boia.habilitada);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mapa das boias</h1>
        <p className="text-gray-500">
          Visualização geográfica das boias monitoradas.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
        <div className="absolute z-[500] bottom-4 left-4 bg-white/95 rounded-xl shadow-md p-4 text-sm space-y-2">
          <h3 className="font-bold mb-2">Legenda</h3>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600" />
            <span>Operando</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Atenção</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span>Crítico</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Offline</span>
          </div>
        </div>

        <div className="h-[620px]">
          <MapContainer
            center={[-27.5969, -48.4673]}
            zoom={14}
            scrollWheelZoom
            className="h-full w-full"
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Mapa">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              const pos = posicoesBoias[boia.id];
              const ultima = getUltimaLeitura(data, boia.id);
              const corStatus = getCorStatus(boia.status);

              if (!pos) return null;

              return (
                <Marker
                  key={boia.id}
                  position={[pos.lat, pos.lng]}
                  icon={criarIcone(boia.status)}
                >
                  <Popup>
                    <div className="min-w-56 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={boia.imagem}
                          alt={boia.nome}
                          className="w-14 h-14 object-contain bg-black rounded-lg"
                        />

                        <div>
                          <strong className="text-base">{boia.nome}</strong>

                          <div
                            className="mt-1 inline-block text-white text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: corStatus }}
                          >
                            {getTextoStatus(boia.status)}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Última leitura:</strong>{" "}
                          {ultima ? ultima.timestamp : "sem dados"}
                        </div>

                        {ultima ? (
                          <>
                            <div>
                              <strong>Temp. água:</strong>{" "}
                              {ultima.tempAgua.toFixed(1)} °C
                            </div>

                            <div>
                              <strong>pH:</strong>{" "}
                              {ultima.phAgua.toFixed(2)}
                            </div>

                            <div>
                              <strong>Turbidez:</strong>{" "}
                              {ultima.turbidez.toFixed(1)} NTU
                            </div>

                            <div>
                              <strong>Condutividade:</strong>{" "}
                              {ultima.condutivEC.toFixed(0)} µS/cm
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500">
                            Nenhum dado enviado para esta boia.
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setBoiaSelecionada(boia.id);
                          setPage("boiaDetalhe");
                        }}
                        className="w-full bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition"
                      >
                        Ver detalhes
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