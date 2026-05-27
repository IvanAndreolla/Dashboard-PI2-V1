import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware } from "../middleware";

export const apiRoutes = Router();

function converterLeitura(leitura: any) {
  return {
    id: leitura.id,
    boiaId: leitura.boiaId,
    timestamp: leitura.timestamp.toISOString(),

    lat: leitura.lat,
    lon: leitura.lon,
    alt: leitura.alt,

    tempAr: leitura.tempAr,
    umidAr: leitura.umidAr,
    pressao: leitura.pressao,
    indiceUV: leitura.indiceUV,

    chuvaAcum: leitura.chuvaAcum,
    ventoVel: leitura.ventoVel,
    ventoDir: leitura.ventoDir,

    tempAgua: leitura.tempAgua,
    phAgua: leitura.phAgua,
    condutivEC: leitura.condutivEC,
    turbidez: leitura.turbidez,
  };
}

function converterBoia(boia: any) {
  return {
    id: boia.id,
    nome: boia.nome,
    descricao: boia.descricao,
    instituicao: boia.instituicao,
    responsavel: boia.responsavel,
    imagem: boia.imagem,
    local: boia.local,

    latitude: boia.latitude,
    longitude: boia.longitude,
    altitude: boia.altitude,

    gpsIntegrado: boia.gpsIntegrado,
    habilitada: boia.habilitada,

    mqtt: boia.mqtt,
    mqttTopico: boia.mqttTopico,
    lora: boia.lora,

    sensores: boia.sensores,
    comunicacao: boia.comunicacao,

    createdAt: boia.createdAt,
    updatedAt: boia.updatedAt,
  };
}

// =======================
// BOIAS
// =======================

apiRoutes.get("/boias", async (_req, res) => {
  try {
    const boias = await prisma.boia.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(boias.map(converterBoia));
  } catch (error) {
    console.error("Erro ao buscar boias:", error);
    res.status(500).json({ error: "Erro ao buscar boias" });
  }
});

apiRoutes.post("/boias", authMiddleware, async (req, res) => {
  try {
    const body = req.body;

    const comunicacao = body.comunicacao || {
      mqtt: body.mqtt ?? false,
      mqttTopico: body.mqttTopico || "",
      lora: body.lora ?? false,
    };

    const boia = await prisma.boia.create({
      data: {
        id: body.id,
        nome: body.nome,
        descricao: body.descricao || "",
        instituicao: body.instituicao || "",
        responsavel: body.responsavel || "",
        imagem: body.imagem || "",
        local: body.local || "",

        latitude: body.latitude,
        longitude: body.longitude,
        altitude: body.altitude,

        gpsIntegrado: body.gpsIntegrado ?? false,
        habilitada: body.habilitada ?? true,

        mqtt: comunicacao.mqtt ?? false,
        mqttTopico: comunicacao.mqttTopico || body.mqttTopico || "",
        lora: comunicacao.lora ?? false,

        sensores: body.sensores || {},
        comunicacao,
      },
    });

    res.status(201).json(converterBoia(boia));
  } catch (error) {
    console.error("Erro ao criar boia:", error);
    res.status(500).json({ error: "Erro ao criar boia" });
  }
});

apiRoutes.put("/boias/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const comunicacao = body.comunicacao || {
      mqtt: body.mqtt ?? false,
      mqttTopico: body.mqttTopico || "",
      lora: body.lora ?? false,
    };

    const boia = await prisma.boia.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao || "",
        instituicao: body.instituicao || "",
        responsavel: body.responsavel || "",
        imagem: body.imagem || "",
        local: body.local || "",

        latitude: body.latitude,
        longitude: body.longitude,
        altitude: body.altitude,

        gpsIntegrado: body.gpsIntegrado ?? false,
        habilitada: body.habilitada ?? true,

        mqtt: comunicacao.mqtt ?? false,
        mqttTopico: comunicacao.mqttTopico || body.mqttTopico || "",
        lora: comunicacao.lora ?? false,

        sensores: body.sensores || {},
        comunicacao,
      },
    });

    res.json(converterBoia(boia));
  } catch (error) {
    console.error("Erro ao atualizar boia:", error);
    res.status(500).json({ error: "Erro ao atualizar boia" });
  }
});

apiRoutes.delete("/boias/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.leitura.deleteMany({
      where: { boiaId: id },
    });

    await prisma.boia.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir boia:", error);
    res.status(500).json({ error: "Erro ao excluir boia" });
  }
});

// =======================
// LEITURAS
// =======================

apiRoutes.get("/leituras", async (req, res) => {
  try {
    const limite = Number(req.query.limit || 500);

    const leituras = await prisma.leitura.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: limite,
    });

    res.json(leituras.map(converterLeitura));
  } catch (error) {
    console.error("Erro ao buscar leituras:", error);
    res.status(500).json({ error: "Erro ao buscar leituras" });
  }
});

apiRoutes.get("/leituras/:boiaId", async (req, res) => {
  try {
    const { boiaId } = req.params;

    const limite = Number(req.query.limit || 500);
    const inicio = req.query.inicio as string | undefined;
    const fim = req.query.fim as string | undefined;

    const where: any = { boiaId };

    if (inicio || fim) {
      where.timestamp = {};

      if (inicio) {
        where.timestamp.gte = new Date(inicio);
      }

      if (fim) {
        where.timestamp.lte = new Date(fim);
      }
    }

    const leituras = await prisma.leitura.findMany({
      where,
      orderBy: {
        timestamp: "asc",
      },
      take: limite,
    });

    res.json(leituras.map(converterLeitura));
  } catch (error) {
    console.error("Erro ao buscar leituras da boia:", error);
    res.status(500).json({ error: "Erro ao buscar leituras da boia" });
  }
});