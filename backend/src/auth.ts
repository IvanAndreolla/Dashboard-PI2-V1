import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "hydra_secret_dev";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function gerarToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verificarToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}