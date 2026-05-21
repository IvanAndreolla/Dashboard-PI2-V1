import { Router } from "express";
import { prisma } from "../prisma";

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

apiRoutes.get("/boias", async (_req, res) => {
  try {
    const boias = await prisma.boia.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(boias);
  } catch (error) {
    console.error("Erro ao buscar boias:", error);
    res.status(500).json({
      error: "Erro ao buscar boias",
    });
  }
});

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
    res.status(500).json({
      error: "Erro ao buscar leituras",
    });
  }
});

apiRoutes.get("/leituras/:boiaId", async (req, res) => {
  try {
    const { boiaId } = req.params;

    const limite = Number(req.query.limit || 500);
    const inicio = req.query.inicio as string | undefined;
    const fim = req.query.fim as string | undefined;

    const where: any = {
      boiaId,
    };

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
    res.status(500).json({
      error: "Erro ao buscar leituras da boia",
    });
  }
});