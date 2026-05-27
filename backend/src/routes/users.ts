import { Router } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../prisma";
import { authMiddleware, requireAdmin } from "../middleware";

export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.use(requireAdmin);

userRoutes.get("/", async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(usuarios);
});

userRoutes.post("/", async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Nome, email e senha são obrigatórios",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        role: role || "OPERATOR",
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
    });

    res.status(201).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao criar usuário",
    });
  }
});

userRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, role, ativo } = req.body;

    const data: any = {
      nome,
      email,
      role,
      ativo,
    };

    if (senha) {
      data.senhaHash = await bcrypt.hash(senha, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao atualizar usuário",
    });
  }
});

userRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.usuario.update({
      where: { id },
      data: {
        ativo: false,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao desativar usuário",
    });
  }
});