import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

async function main() {
  const nome = "Administrador Hydra";
  const email = "admin@hydra.local";
  const senha = "admin123";

  const senhaHash = await bcrypt.hash(senha, 10);

  const existente = await prisma.usuario.findUnique({
    where: {
      email,
    },
  });

  if (existente) {
    console.log("Usuário admin já existe:");
    console.log({
      email,
      senha,
    });
    return;
  }

  await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      role: "ADMIN",
      ativo: true,
    },
  });

  console.log("Admin criado com sucesso:");
  console.log({
    email,
    senha,
  });
}

main()
  .catch((error) => {
    console.error("Erro ao criar admin:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });