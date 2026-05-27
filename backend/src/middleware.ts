import { Request, Response, NextFunction } from "express";
import { verificarToken } from "./auth";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Token não informado",
      });
    }

    const [, token] = authHeader.split(" ");

    const payload = verificarToken(token);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido",
    });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      error: "Não autenticado",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Acesso negado",
    });
  }

  next();
}