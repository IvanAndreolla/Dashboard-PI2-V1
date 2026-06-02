/*
  Warnings:

  - A unique constraint covering the columns `[boiaId,timestamp]` on the table `Leitura` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Leitura_boiaId_timestamp_key" ON "Leitura"("boiaId", "timestamp");
