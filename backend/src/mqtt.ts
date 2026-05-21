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
      const boiaId = partesTopico[partesTopico.length - 1];

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