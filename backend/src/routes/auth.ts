import { Router } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../prisma";
import { gerarToken } from "../auth";

export const authRoutes = Router();

authRoutes.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        error: "Usuário ou senha inválidos",
      });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        error: "Usuário desativado",
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senhaHash
    );

    if (!senhaValida) {
      return res.status(401).json({
        error: "Usuário ou senha inválidos",
      });
    }

    const token = gerarToken({
      userId: usuario.id,
      email: usuario.email,
      role: usuario.role,
    });

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erro interno",
    });
  }
});