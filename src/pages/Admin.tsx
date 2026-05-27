import { useState } from "react";
import { CSVUpload } from "../components/CSVUpload";
import { ImageSelector } from "../components/ImageSelector";
import { obterToken } from "../services/auth";
import {
  BoiaConfig,
  EnvironmentalData,
  SensorConfig,
  SensoresBoia,
} from "../types";

interface Props {
  boias: BoiaConfig[];
  setBoias: (boias: BoiaConfig[]) => void;
  data: EnvironmentalData[];
  addData: (data: EnvironmentalData[]) => void;
  clearDataByBoia: (boiaId: string) => void;
  onLogout: () => void;
  onResetBoias: () => void;
}

const API_URL = "http://localhost:3001/api";

const sensoresPadrao: SensoresBoia = {
  tempAgua: {
    ativo: true,
    nome: "Temperatura da água",
    unidade: "°C",
    maxAlerta: 30,
    maxCritico: 35,
  },
  phAgua: {
    ativo: true,
    nome: "pH da água",
    unidade: "pH",
    minAlerta: 6.5,
    maxAlerta: 8.5,
    minCritico: 6,
    maxCritico: 9,
  },
  turbidez: {
    ativo: true,
    nome: "Turbidez",
    unidade: "NTU",
    maxAlerta: 15,
    maxCritico: 30,
  },
  condutivEC: {
    ativo: true,
    nome: "Condutividade",
    unidade: "µS/cm",
  },
  tempAr: {
    ativo: true,
    nome: "Temperatura do ar",
    unidade: "°C",
  },
  umidAr: {
    ativo: true,
    nome: "Umidade do ar",
    unidade: "%",
  },
  pressao: {
    ativo: true,
    nome: "Pressão atmosférica",
    unidade: "hPa",
  },
  indiceUV: {
    ativo: true,
    nome: "Índice UV",
    unidade: "",
  },
  chuvaAcum: {
    ativo: true,
    nome: "Chuva acumulada",
    unidade: "mm",
  },
  ventoVel: {
    ativo: true,
    nome: "Velocidade do vento",
    unidade: "km/h",
  },
  ventoDir: {
    ativo: true,
    nome: "Direção do vento",
    unidade: "°",
  },
};

const listaSensores: {
  chave: keyof SensoresBoia;
  titulo: string;
}[] = [
    { chave: "tempAgua", titulo: "Temperatura da água" },
    { chave: "phAgua", titulo: "pH da água" },
    { chave: "turbidez", titulo: "Turbidez" },
    { chave: "condutivEC", titulo: "Condutividade" },
    { chave: "tempAr", titulo: "Temperatura do ar" },
    { chave: "umidAr", titulo: "Umidade do ar" },
    { chave: "pressao", titulo: "Pressão atmosférica" },
    { chave: "indiceUV", titulo: "Índice UV" },
    { chave: "chuvaAcum", titulo: "Chuva acumulada" },
    { chave: "ventoVel", titulo: "Velocidade do vento" },
    { chave: "ventoDir", titulo: "Direção do vento" },
  ];

function gerarId(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function criarBoiaVazia(): BoiaConfig {
  return {
    id: "",
    nome: "",
    descricao: "",
    instituicao: "",
    responsavel: "",
    imagem: "/assets/boias/medusa.png",
    local: "",
    latitude: -27.603671,
    longitude: -48.552147,
    gpsIntegrado: false,
    habilitada: true,
    status: "offline",
    comunicacao: {
      mqtt: false,
      mqttTopico: "",
      lora: false,
    },
    sensores: sensoresPadrao,
  };
}

function getDadosDaBoia(data: EnvironmentalData[], boiaId: string) {
  return data.filter((leitura) => leitura.boiaId === boiaId);
}

function numeroOuUndefined(valor: string) {
  if (valor.trim() === "") return undefined;
  return Number(valor);
}

function normalizarBoiaResposta(boia: any): BoiaConfig {
  return {
    id: boia.id,
    nome: boia.nome || boia.id,
    descricao: boia.descricao || "",
    instituicao: boia.instituicao || "Não informado",
    responsavel: boia.responsavel || "",
    imagem: boia.imagem || "/assets/boias/medusa.png",
    local: boia.local || "Não informado",
    latitude: boia.latitude ?? -27.603671,
    longitude: boia.longitude ?? -48.552147,
    gpsIntegrado: boia.gpsIntegrado ?? false,
    habilitada: boia.habilitada ?? true,
    status: boia.status || "offline",
    comunicacao: boia.comunicacao || {
      mqtt: boia.mqtt ?? false,
      mqttTopico: boia.mqttTopico || "",
      lora: boia.lora ?? false,
    },
    sensores: boia.sensores || sensoresPadrao,
  };
}

export function Admin({
  boias,
  setBoias,
  data,
  addData,
  clearDataByBoia,
  onLogout,
  onResetBoias,
}: Props) {
  const [form, setForm] = useState<BoiaConfig>(criarBoiaVazia());
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const atualizarCampo = <K extends keyof BoiaConfig>(
    campo: K,
    valor: BoiaConfig[K]
  ) => {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  };

  const atualizarComunicacao = (
    campo: keyof BoiaConfig["comunicacao"],
    valor: boolean | string
  ) => {
    setForm((atual) => ({
      ...atual,
      comunicacao: {
        ...atual.comunicacao,
        [campo]: valor,
      },
    }));
  };

  const atualizarSensor = (
    chave: keyof SensoresBoia,
    campo: keyof SensorConfig,
    valor: boolean | string | number | undefined
  ) => {
    setForm((atual) => {
      const sensorAtual = atual.sensores[chave] || sensoresPadrao[chave];

      return {
        ...atual,
        sensores: {
          ...atual.sensores,
          [chave]: {
            ...sensorAtual,
            [campo]: valor,
          },
        },
      };
    });
  };

  const limparFormulario = () => {
    setForm(criarBoiaVazia());
    setEditandoId(null);
  };

  async function salvarBoiaBackend(boia: BoiaConfig) {
    try {
      const resposta = await fetch(`${API_URL}/boias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${obterToken()}`,
        },
        body: JSON.stringify(boia),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao salvar boia");
      }

      return normalizarBoiaResposta(await resposta.json());
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar boia no backend");
      return null;
    }
  }

  async function atualizarBoiaBackend(boia: BoiaConfig) {
    try {
      const resposta = await fetch(`${API_URL}/boias/${boia.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${obterToken()}`,
        },
        body: JSON.stringify(boia),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao atualizar boia");
      }

      return normalizarBoiaResposta(await resposta.json());
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar boia no backend");
      return null;
    }
  }

  async function excluirBoiaBackend(id: string) {
    try {
      const resposta = await fetch(`${API_URL}/boias/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${obterToken()}`,
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir boia");
      }

      return true;
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir boia no backend");
      return false;
    }
  }

  const salvarBoia = async () => {
    if (!form.nome.trim()) {
      alert("Informe o nome da boia.");
      return;
    }

    const idFinal = editandoId || gerarId(form.nome);

    if (!idFinal) {
      alert("Não foi possível gerar um ID para a boia.");
      return;
    }

    const boiaFinal: BoiaConfig = {
      ...form,
      id: idFinal,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      status: form.status || "offline",
    };

    if (editandoId) {
      const boiaAtualizada = await atualizarBoiaBackend(boiaFinal);

      if (!boiaAtualizada) return;

      setBoias(
        boias.map((boia) =>
          boia.id === boiaAtualizada.id ? boiaAtualizada : boia
        )
      );
    } else {
      const jaExiste = boias.some((boia) => boia.id === idFinal);

      if (jaExiste) {
        alert("Já existe uma boia com esse nome/ID.");
        return;
      }

      const boiaSalva = await salvarBoiaBackend(boiaFinal);

      if (!boiaSalva) return;

      setBoias([...boias, boiaSalva]);
    }

    limparFormulario();
  };

  const editarBoia = (boia: BoiaConfig) => {
    setForm({
      ...boia,
      sensores: {
        ...sensoresPadrao,
        ...boia.sensores,
      },
      comunicacao: {
        mqtt: false,
        mqttTopico: "",
        lora: false,
        ...boia.comunicacao,
      },
    });

    setEditandoId(boia.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const alternarBoia = async (id: string) => {
    const boiaAtual = boias.find((boia) => boia.id === id);

    if (!boiaAtual) return;

    const boiaAtualizada: BoiaConfig = {
      ...boiaAtual,
      habilitada: !boiaAtual.habilitada,
    };

    const resposta = await atualizarBoiaBackend(boiaAtualizada);

    if (!resposta) return;

    setBoias(
      boias.map((boia) => (boia.id === id ? resposta : boia))
    );
  };

  const excluirBoia = async (id: string) => {
    const confirmar = confirm(
      "Deseja realmente excluir esta boia? Os dados carregados dela também serão removidos."
    );

    if (!confirmar) return;

    const sucesso = await excluirBoiaBackend(id);

    if (!sucesso) return;

    setBoias(boias.filter((boia) => boia.id !== id));
    clearDataByBoia(id);

    if (editandoId === id) {
      limparFormulario();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Administração</h1>
          <p className="text-gray-500">
            Cadastro de boias, sensores, comunicação, localização, imagens e envio de dados.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onResetBoias}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Restaurar boias padrão
          </button>

          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-lg text-blue-900">
          Guia de integração e cadastro
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 text-sm text-blue-950">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold mb-2">1. Como cadastrar uma boia</h3>
            <p>
              Informe nome, instituição, responsável, local, latitude, longitude,
              imagem e os sensores instalados. Se a boia não tiver GPS integrado,
              mantenha a posição fixa configurada manualmente.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold mb-2">2. Sensores</h3>
            <p>
              Habilite apenas os sensores realmente existentes na boia. Os gráficos,
              alertas, histórico e visão pública usarão somente os sensores ativos.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold mb-2">3. Formato CSV esperado</h3>
            <pre className="bg-gray-900 text-green-300 p-3 rounded-lg overflow-auto text-xs mt-2">
              {`timestamp;tempAr;umidAr;pressao;indiceUV;chuvaAcum;ventoVel;ventoDir;tempAgua;phAgua;condutivEC;turbidez
2026-05-01 10:00;25.3;70;1012;5;0;12;180;22.1;7.2;980;12`}
            </pre>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold mb-2">4. Mensagem MQTT sugerida</h3>
            <pre className="bg-gray-900 text-green-300 p-3 rounded-lg overflow-auto text-xs mt-2">
              {`Tópico:
Hydra/ifsc-baia-sul

Payload JSON:
{
  "timestamp": "2026-05-01 10:00",
  "lat": -27.593708,
  "lon": -48.542835,
  "alt": 16.6,
  "tempAr": 25.3,
  "umidAr": 70,
  "pressao": 1012,
  "indiceUV": 5,
  "chuvaAcum": 0,
  "ventoVel": 12,
  "ventoDir": 180,
  "tempAgua": 22.1,
  "phAgua": 7.2,
  "condutivEC": 980,
  "turbidez": 12
}`}
            </pre>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
          <strong>Observação:</strong> se um sensor não existir em determinada boia,
          ele pode ficar desabilitado no cadastro. O CSV pode conter colunas extras,
          mas o sistema só exibirá os sensores ativos daquela boia.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div>
          <h2 className="font-bold text-lg">
            {editandoId ? "Editar boia" : "Cadastrar nova boia"}
          </h2>
          <p className="text-sm text-gray-500">
            Configure nome, instituição, posição, comunicação, imagem e sensores.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nome</label>
              <input
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Boia IFSC Baía Sul"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Instituição</label>
              <input
                value={form.instituicao}
                onChange={(e) => atualizarCampo("instituicao", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="IFSC, UFSC..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Responsável</label>
              <input
                value={form.responsavel || ""}
                onChange={(e) => atualizarCampo("responsavel", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Equipe, laboratório..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Local</label>
              <input
                value={form.local}
                onChange={(e) => atualizarCampo("local", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Baía Sul, Lagoa do Peri..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => atualizarCampo("latitude", Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => atualizarCampo("longitude", Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => atualizarCampo("descricao", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                rows={4}
                placeholder="Descrição da boia, finalidade e contexto de uso..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Imagem da boia</label>
            <ImageSelector
              value={form.imagem}
              onChange={(novaImagem) => atualizarCampo("imagem", novaImagem)}
            />
          </div>
        </div>

        <div className="border rounded-xl p-4 space-y-4">
          <h3 className="font-bold">Comunicação</h3>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.comunicacao.mqtt}
                onChange={(e) => atualizarComunicacao("mqtt", e.target.checked)}
              />
              MQTT
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.comunicacao.lora || false}
                onChange={(e) => atualizarComunicacao("lora", e.target.checked)}
              />
              LoRa
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.gpsIntegrado}
                onChange={(e) => atualizarCampo("gpsIntegrado", e.target.checked)}
              />
              GPS integrado
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Tópico MQTT</label>
            <input
              value={form.comunicacao.mqttTopico || ""}
              onChange={(e) => atualizarComunicacao("mqttTopico", e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Hydra/ifsc-baia-sul"
            />
          </div>
        </div>

        <div className="border rounded-xl p-4 space-y-4">
          <h3 className="font-bold">Sensores e limites</h3>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {listaSensores.map(({ chave, titulo }) => {
              const sensorAtual = form.sensores[chave] || sensoresPadrao[chave];

              return (
                <div key={chave} className="border rounded-lg p-4 space-y-3">
                  <label className="flex items-center gap-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={sensorAtual?.ativo || false}
                      onChange={(e) =>
                        atualizarSensor(chave, "ativo", e.target.checked)
                      }
                    />
                    {titulo}
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Nome exibido
                      </label>
                      <input
                        value={sensorAtual?.nome || ""}
                        onChange={(e) =>
                          atualizarSensor(chave, "nome", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Unidade</label>
                      <input
                        value={sensorAtual?.unidade || ""}
                        onChange={(e) =>
                          atualizarSensor(chave, "unidade", e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Mín. alerta
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={sensorAtual?.minAlerta ?? ""}
                        onChange={(e) =>
                          atualizarSensor(
                            chave,
                            "minAlerta",
                            numeroOuUndefined(e.target.value)
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Máx. alerta
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={sensorAtual?.maxAlerta ?? ""}
                        onChange={(e) =>
                          atualizarSensor(
                            chave,
                            "maxAlerta",
                            numeroOuUndefined(e.target.value)
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Mín. crítico
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={sensorAtual?.minCritico ?? ""}
                        onChange={(e) =>
                          atualizarSensor(
                            chave,
                            "minCritico",
                            numeroOuUndefined(e.target.value)
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Máx. crítico
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={sensorAtual?.maxCritico ?? ""}
                        onChange={(e) =>
                          atualizarSensor(
                            chave,
                            "maxCritico",
                            numeroOuUndefined(e.target.value)
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={salvarBoia}
            className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            {editandoId ? "Salvar alterações" : "Cadastrar boia"}
          </button>

          <button
            onClick={limparFormulario}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Limpar formulário
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-lg mb-4">Boias cadastradas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {boias.map((boia) => {
            const dadosBoia = getDadosDaBoia(data, boia.id);
            const ultima = dadosBoia[dadosBoia.length - 1];

            return (
              <div key={boia.id} className="border rounded-xl p-4 space-y-4">
                <div className="flex gap-4 items-center">
                  <img
                    src={boia.imagem}
                    alt={boia.nome}
                    className="w-20 h-20 object-contain bg-black rounded-lg"
                  />

                  <div className="flex-1">
                    <h3 className="font-bold">{boia.nome}</h3>

                    <p className="text-sm text-gray-500">
                      {boia.instituicao} — {boia.local}
                    </p>

                    <p className="text-xs text-gray-500">
                      Registros: {dadosBoia.length}
                    </p>

                    <p className="text-xs text-gray-500">
                      Última leitura: {ultima ? ultima.timestamp : "sem dados"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => alternarBoia(boia.id)}
                    className={
                      boia.habilitada
                        ? "bg-green-600 text-white px-3 py-2 rounded-lg"
                        : "bg-gray-300 text-gray-700 px-3 py-2 rounded-lg"
                    }
                  >
                    {boia.habilitada ? "ON" : "OFF"}
                  </button>

                  <button
                    onClick={() => editarBoia(boia)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => clearDataByBoia(boia.id)}
                    className="bg-orange-500 text-white px-3 py-2 rounded-lg"
                  >
                    Limpar dados
                  </button>

                  <button
                    onClick={() => excluirBoia(boia.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-lg mb-4">Upload de dados por boia</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {boias
            .filter((boia) => boia.habilitada)
            .map((boia) => {
              const dadosBoia = getDadosDaBoia(data, boia.id);

              return (
                <div key={boia.id} className="border rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={boia.imagem}
                      alt={boia.nome}
                      className="w-16 h-16 object-contain bg-black rounded-lg"
                    />

                    <div>
                      <h3 className="font-bold">{boia.nome}</h3>

                      <p className="text-sm text-gray-500">
                        {dadosBoia.length} registros carregados
                      </p>
                    </div>
                  </div>

                  <CSVUpload boiaId={boia.id} onDataLoaded={addData} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}