import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, requireAdmin } from "../middleware";

export const apiRoutes = Router();

// We need access to the IO instance. Express 5 allows us to get it from req.app.get('io') if set.
// Or we can just rely on the fact that the MQTT handler and App.tsx also listen.
// Let's modify the route to emit if IO is available.

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

    alertaAtivo: boia.alertaAtivo,
    alertaTipo: boia.alertaTipo,

    sensores: boia.sensores,
    comunicacao: boia.comunicacao,

    createdAt: boia.createdAt,
    updatedAt: boia.updatedAt,
  };
}

// =======================
// BOIAS
// =======================

apiRoutes.post("/boias/:id/acknowledge", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const boia = await prisma.boia.update({
      where: { id },
      data: {
        alertaAtivo: false,
        alertaTipo: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        usuarioId: (req as any).usuarioId || "SISTEMA",
        acao: "LIMPOU_ALERTA",
        ip: req.ip,
        detalhes: { boiaId: boia.id, nome: boia.nome },
      }
    });

    const io = req.app.get("io");
    if (io) io.emit("boia:update", converterBoia(boia));

    res.json(converterBoia(boia));
  } catch (error) {
    console.error("Erro ao limpar alerta:", error);
    res.status(500).json({ error: "Erro ao limpar alerta" });
  }
});

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

        alertaAtivo: body.alertaAtivo ?? false,
        alertaTipo: body.alertaTipo || null,

        sensores: body.sensores || {},
        comunicacao,
      },
    });

    await prisma.auditLog.create({
      data: {
        usuarioId: (req as any).usuarioId || "SISTEMA",
        acao: "CRIOU_BOIA",
        ip: req.ip,
        detalhes: { boiaId: boia.id, nome: boia.nome },
      }
    });

    const io = req.app.get("io");
    io.emit("boia:update", converterBoia(boia));

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

        alertaAtivo: body.alertaAtivo ?? false,
        alertaTipo: body.alertaTipo || null,

        sensores: body.sensores || {},
        comunicacao,
      },
    });

    await prisma.auditLog.create({
      data: {
        usuarioId: (req as any).usuarioId || "SISTEMA",
        acao: "ALTEROU_BOIA",
        ip: req.ip,
        detalhes: { boiaId: boia.id, nome: boia.nome },
      }
    });

    const io = req.app.get("io");
    io.emit("boia:update", converterBoia(boia));

    res.json(converterBoia(boia));
  } catch (error) {
    console.error("Erro ao atualizar boia:", error);
    res.status(500).json({ error: "Erro ao atualizar boia" });
  }
});

apiRoutes.delete("/boias/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.leitura.deleteMany({
      where: { boiaId: id },
    });

    await prisma.boia.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        usuarioId: (req as any).usuarioId || "SISTEMA",
        acao: "EXCLUIU_BOIA",
        ip: req.ip,
        detalhes: { boiaId: id },
      }
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir boia:", error);
    res.status(500).json({ error: "Erro ao excluir boia" });
  }
});

apiRoutes.delete("/leituras/:boiaId", authMiddleware, async (req, res) => {
  try {
    const { boiaId } = req.params;

    await prisma.leitura.deleteMany({
      where: {
        boiaId,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao apagar leituras da boia:", error);
    res.status(500).json({
      error: "Erro ao apagar leituras da boia",
    });
  }
});
apiRoutes.post("/leituras/lote", authMiddleware, async (req, res) => {
  try {
    const { boiaId, leituras } = req.body;

    if (!boiaId || !Array.isArray(leituras)) {
      return res.status(400).json({
        error: "boiaId e leituras são obrigatórios",
      });
    }

    // Using a transaction to perform multiple upserts
    const operacoes = leituras.map((leitura: any) => {
      const dadosLeitura = {
        lat: leitura.lat ?? null,
        lon: leitura.lon ?? null,
        alt: leitura.alt ?? null,
        tempAr: leitura.tempAr ?? null,
        umidAr: leitura.umidAr ?? null,
        pressao: leitura.pressao ?? null,
        indiceUV: leitura.indiceUV ?? null,
        chuvaAcum: leitura.chuvaAcum ?? null,
        ventoVel: leitura.ventoVel ?? null,
        ventoDir: leitura.ventoDir ?? null,
        tempAgua: leitura.tempAgua ?? null,
        phAgua: leitura.phAgua ?? null,
        condutivEC: leitura.condutivEC ?? null,
        turbidez: leitura.turbidez ?? null,
      };

      return prisma.leitura.upsert({
        where: {
          boiaId_timestamp: {
            boiaId,
            timestamp: new Date(leitura.timestamp),
          }
        },
        update: dadosLeitura,
        create: {
          boiaId,
          timestamp: new Date(leitura.timestamp),
          ...dadosLeitura,
        }
      });
    });

    await prisma.$transaction(operacoes);

    res.status(201).json({
      ok: true,
      count: leituras.length,
    });
  } catch (error) {
    console.error("Erro ao salvar leituras em lote:", error);
    res.status(500).json({
      error: "Erro ao salvar leituras em lote",
    });
  }
});

// =======================
// AUDIT LOGS
// =======================

apiRoutes.get("/audit", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Fetch the latest 100 logs
    });

    res.json(logs);
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    res.status(500).json({ error: "Erro ao buscar logs" });
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
        timestamp: "asc",
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