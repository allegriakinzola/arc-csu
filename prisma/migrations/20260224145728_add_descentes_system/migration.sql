-- CreateEnum
CREATE TYPE "StatutDescente" AS ENUM ('ACTIVE', 'EXPIREE', 'ANNULEE');

-- AlterEnum
ALTER TYPE "StatutEtablissement" ADD VALUE 'REJETE';

-- AlterTable
ALTER TABLE "Etablissement" ADD COLUMN     "descenteId" TEXT,
ALTER COLUMN "statut" SET DEFAULT 'ACTIF';

-- CreateTable
CREATE TABLE "Descente" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "motDePasse" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "statut" "StatutDescente" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Descente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Descente_code_key" ON "Descente"("code");

-- AddForeignKey
ALTER TABLE "Etablissement" ADD CONSTRAINT "Etablissement_descenteId_fkey" FOREIGN KEY ("descenteId") REFERENCES "Descente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
