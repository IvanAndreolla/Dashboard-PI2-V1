import mqtt from "mqtt";
import { Server } from "socket.io";
import { EnvironmentalData } from "./types";
import { prisma } from "./prisma";

function converterTimestamp(timestamp: string) {
  return new Date(timestamp.replace(" ", "T"));
}

async function garantirBoiaExiste(boiaId: string) {
  const boiaExistente = await prisma.boia.findUnique({
    where: {
      id: boiaId,
    },
  });

  if (boiaExistente) return boiaExistente;

  const sensoresPadrao = {
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

  const comunicacaoPadrao = {
    mqtt: true,
    mqttTopico: `Hydra/${boiaId}`,
    lora: false,
  };

  return prisma.boia.create({
    data: {
      id: boiaId,
      nome: boiaId,
      descricao: "Boia criada automaticamente a partir do MQTT.",
      instituicao: "Não informado",
      local: "Não informado",
      habilitada: true,

      mqtt: true,
      mqttTopico: `Hydra/${boiaId}`,
      lora: false,

      sensores: sensoresPadrao,
      comunicacao: comunicacaoPadrao,
    },
  });
}

async function salvarLeitura(dado: EnvironmentalData) {
  await garantirBoiaExiste(dado.boiaId);

  return prisma.leitura.create({
    data: {
      boiaId: dado.boiaId,
      timestamp: converterTimestamp(dado.timestamp),

      lat: dado.lat,
      lon: dado.lon,
      alt: dado.alt,

      tempAr: dado.tempAr,
      umidAr: dado.umidAr,
      pressao: dado.pressao,
      indiceUV: dado.indiceUV,

      chuvaAcum: dado.chuvaAcum,

      ventoVel: dado.ventoVel,
      ventoDir: dado.ventoDir,

      tempAgua: dado.tempAgua,
      phAgua: dado.phAgua,
      condutivEC: dado.condutivEC,
      turbidez: dado.turbidez,
    },
  });
}

export function iniciarMQTT(io: Server) {
  const host = process.env.MQTT_HOST;
  const port = process.env.MQTT_PORT;
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;
  const topic = process.env.MQTT_TOPIC || "Hydra/#";

  if (!host || !port || !username || !password) {
    console.error("Configurações MQTT ausentes no .env");
    return;
  }

  const client = mqtt.connect(`${host}:${port}`, {
    username,
    password,
    reconnectPeriod: 3000,
  });

  client.on("connect", () => {
    console.log("Conectado ao broker MQTT");

    client.subscribe(topic, (err) => {
      if (err) {
        console.error("Erro ao assinar tópico:", err.message);
        return;
      }

      console.log(`Inscrito no tópico: ${topic}`);
    });
  });

  client.on("message", async (topicRecebido, payload) => {
    try {
      const mensagem = payload.toString();
      const json = JSON.parse(mensagem);

      const partesTopico = topicRecebido.split("/");
      const boiaId = partesTopico[partesTopico.length - 1].toLowerCase();

      const dado: EnvironmentalData = {
        boiaId,
        timestamp: json.timestamp,

        lat: json.lat,
        lon: json.lon,
        alt: json.alt,

        tempAr: Number(json.tempAr),
        umidAr: Number(json.umidAr),
        pressao: Number(json.pressao),
        indiceUV: Number(json.indiceUV),

        chuvaAcum: Number(json.chuvaAcum),
        ventoVel: Number(json.ventoVel),
        ventoDir: Number(json.ventoDir),

        tempAgua: Number(json.tempAgua),
        phAgua: Number(json.phAgua),
        condutivEC: Number(json.condutivEC),
        turbidez: Number(json.turbidez),
      };

      await salvarLeitura(dado);

      console.log("Dado MQTT salvo no banco:", dado);

      io.emit("mqtt:data", dado);
    } catch (error) {
      console.error("Erro ao processar mensagem MQTT:", error);
    }
  });

  client.on("error", (err) => {
    console.error("Erro MQTT:", err.message);
  });

  client.on("reconnect", () => {
    console.log("Reconectando ao MQTT...");
  });
}