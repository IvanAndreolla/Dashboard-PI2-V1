/*
  Warnings:

  - The `role` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'OPERATOR';
