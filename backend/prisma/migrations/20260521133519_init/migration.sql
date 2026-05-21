-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');

-- CreateTable
CREATE TABLE "Boia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "instituicao" TEXT,
    "responsavel" TEXT,
    "imagem" TEXT,
    "local" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "gpsIntegrado" BOOLEAN NOT NULL DEFAULT false,
    "habilitada" BOOLEAN NOT NULL DEFAULT true,
    "mqtt" BOOLEAN NOT NULL DEFAULT false,
    "mqttTopico" TEXT,
    "lora" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leitura" (
    "id" TEXT NOT NULL,
    "boiaId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "alt" DOUBLE PRECISION,
    "tempAr" DOUBLE PRECISION,
    "umidAr" DOUBLE PRECISION,
    "pressao" DOUBLE PRECISION,
    "indiceUV" DOUBLE PRECISION,
    "chuvaAcum" DOUBLE PRECISION,
    "ventoVel" DOUBLE PRECISION,
    "ventoDir" DOUBLE PRECISION,
    "tempAgua" DOUBLE PRECISION,
    "phAgua" DOUBLE PRECISION,
    "condutivEC" DOUBLE PRECISION,
    "turbidez" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leitura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Leitura_boiaId_idx" ON "Leitura"("boiaId");

-- CreateIndex
CREATE INDEX "Leitura_timestamp_idx" ON "Leitura"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Leitura" ADD CONSTRAINT "Leitura_boiaId_fkey" FOREIGN KEY ("boiaId") REFERENCES "Boia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
