import mqtt from "mqtt";
import { Server } from "socket.io";
import { EnvironmentalData } from "./types";
import { prisma } from "./prisma";

function converterTimestamp(timestamp: string) {
  let ts = timestamp.replace(" ", "T");
  
  if (ts.length === 16) {
    ts += ":00";
  }
  
  if (!ts.includes("Z") && !ts.includes("-", 11) && !ts.includes("+", 11)) {
    ts += "-03:00";
  }
  
  return new Date(ts);
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
  const boia = await garantirBoiaExiste(dado.boiaId);
  const timestamp = converterTimestamp(dado.timestamp);

  const dadosLeitura = {
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
  };

  const leitura = await prisma.leitura.upsert({
    where: {
      boiaId_timestamp: {
        boiaId: dado.boiaId,
        timestamp: timestamp,
      }
    },
    update: dadosLeitura,
    create: {
      boiaId: dado.boiaId,
      timestamp: timestamp,
      ...dadosLeitura,
    },
  });

  // LOGICA DE ALERTA PERSISTENTE (STICKY)
  // Verificamos se algum dado novo ultrapassou os limites e travamos a boia em alerta
  const sensoresBoia = boia.sensores as any;
  let novoAlertaTipo: "critico" | "alerta" | null = null;

  if (sensoresBoia) {
    const keys = Object.keys(sensoresBoia);
    for (const key of keys) {
      const config = sensoresBoia[key];
      const valor = (dado as any)[key];
      
      if (config && config.ativo && valor != null) {
        // Críticos (prioridade)
        if ((config.minCritico !== undefined && valor < config.minCritico) || 
            (config.maxCritico !== undefined && valor > config.maxCritico)) {
          novoAlertaTipo = "critico";
          break; // Crítico tem prioridade máxima, pode parar de olhar
        }
        // Atenção (apenas se ainda não for crítico)
        if (!novoAlertaTipo && 
           ((config.minAlerta !== undefined && valor < config.minAlerta) || 
            (config.maxAlerta !== undefined && valor > config.maxAlerta))) {
          novoAlertaTipo = "alerta";
        }
      }
    }
  }

  const boiaUpdateData: any = {};
  if (dado.lat !== undefined && dado.lon !== undefined) {
    boiaUpdateData.latitude = dado.lat;
    boiaUpdateData.longitude = dado.lon;
    boiaUpdateData.altitude = dado.alt ?? null;
  }

  // Se detectou um novo problema, ou se já estava em alerta e queremos manter (Sticky)
  // Nota: Aqui só setamos para TRUE se detectado. Se o dado for bom, NÃO setamos para FALSE 
  // (quem seta para false é o botão Acknowledge no Admin)
  if (novoAlertaTipo) {
    boiaUpdateData.alertaAtivo = true;
    // Se o novo for critico e o antigo era alerta, sobe o nível.
    if (novoAlertaTipo === "critico" || !boia.alertaAtivo) {
        boiaUpdateData.alertaTipo = novoAlertaTipo;
    }
  }

  if (Object.keys(boiaUpdateData).length > 0) {
    await prisma.boia.update({
      where: { id: boia.id },
      data: boiaUpdateData,
    });
  }

  return leitura;
}

export function iniciarMQTT(io: Server) {
  const host = process.env.MQTT_HOST;
  const port = process.env.MQTT_PORT;
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;
  const topic = process.env.MQTT_TOPIC || "Hydra/#";

  if (!host || !port) {
    console.error("Configurações de HOST ou PORT do MQTT ausentes no .env");
    return;
  }

  const options: mqtt.IClientOptions = {
    reconnectPeriod: 3000,
  };

  if (username) options.username = username;
  if (password) options.password = password;

  const connectionUrl = `${host}:${port}`;
  console.log(`Tentando conectar ao broker MQTT em: ${connectionUrl}`);

  const client = mqtt.connect(connectionUrl, options);

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

      if (dado.lat !== undefined && dado.lon !== undefined) {
        io.emit("boia:update", {
          id: dado.boiaId,
          latitude: dado.lat,
          longitude: dado.lon,
          altitude: dado.alt ?? null,
        });
      }
    } catch (error) {
      console.error("Erro ao processar mensagem MQTT:", error);
    }
  });

  client.on("error", (err) => {
    console.error("Erro MQTT (detalhado):", err);
  });

  client.on("reconnect", () => {
    console.log("Reconectando ao MQTT...");
  });
}