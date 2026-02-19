-- CreateEnum
CREATE TYPE "TypeEtablissement" AS ENUM ('ESS', 'EPVG');

-- CreateEnum
CREATE TYPE "StatutEtablissement" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU', 'EN_ATTENTE');

-- CreateEnum
CREATE TYPE "StatutAccreditation" AS ENUM ('NON_ACCREDITE', 'EN_COURS', 'ACCREDITE', 'EXPIRE', 'REFUSE');

-- CreateEnum
CREATE TYPE "SousTypeESS" AS ENUM ('HOPITAL_GENERAL', 'HOPITAL_SPECIALISE', 'CLINIQUE', 'CENTRE_SANTE', 'CENTRE_SANTE_REFERENCE', 'POSTE_SANTE', 'DISPENSAIRE', 'CABINET_MEDICAL', 'LABORATOIRE', 'CENTRE_IMAGERIE', 'AUTRE');

-- CreateEnum
CREATE TYPE "SousTypeEPVG" AS ENUM ('GROSSISTE_REPARTITEUR', 'DISTRIBUTEUR', 'IMPORTATEUR', 'FABRICANT', 'DEPOT_PHARMACEUTIQUE', 'CENTRALE_ACHAT', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeDeclaration" AS ENUM ('MENSUELLE', 'TRIMESTRIELLE');

-- CreateEnum
CREATE TYPE "StatutDeclaration" AS ENUM ('BROUILLON', 'SOUMISE', 'VALIDEE', 'REJETEE', 'EN_REVISION');

-- CreateEnum
CREATE TYPE "StatutDemandeAccreditation" AS ENUM ('SOUMISE', 'EN_EXAMEN', 'INSPECTION_PLANIFIEE', 'INSPECTION_EFFECTUEE', 'EN_DELIBERATION', 'APPROUVEE', 'REJETEE', 'ANNULEE');

-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZoneSante" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZoneSante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AireSante" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "zoneSanteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AireSante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etablissement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "sigle" TEXT,
    "type" "TypeEtablissement" NOT NULL,
    "sousTypeESS" "SousTypeESS",
    "sousTypeEPVG" "SousTypeEPVG",
    "statut" "StatutEtablissement" NOT NULL DEFAULT 'EN_ATTENTE',
    "statutAccreditation" "StatutAccreditation" NOT NULL DEFAULT 'NON_ACCREDITE',
    "aireSanteId" TEXT NOT NULL,
    "adresse" TEXT,
    "quartier" TEXT,
    "avenue" TEXT,
    "numero" TEXT,
    "coordonneesGPS" TEXT,
    "telephone" TEXT,
    "telephoneSecondaire" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "nomResponsable" TEXT,
    "fonctionResponsable" TEXT,
    "telephoneResponsable" TEXT,
    "emailResponsable" TEXT,
    "numeroRCCM" TEXT,
    "numeroIdNat" TEXT,
    "numeroImpot" TEXT,
    "dateCreation" TIMESTAMP(3),
    "dateOuverture" TIMESTAMP(3),
    "nombreLits" INTEGER,
    "nombrePersonnel" INTEGER,
    "numeroIdentifiantRSSP" TEXT,
    "dateIdentificationRSSP" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Etablissement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Declaration" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "TypeDeclaration" NOT NULL,
    "statut" "StatutDeclaration" NOT NULL DEFAULT 'BROUILLON',
    "mois" INTEGER,
    "trimestre" INTEGER,
    "annee" INTEGER NOT NULL,
    "montantRecettes" DECIMAL(18,2),
    "montantRSSP" DECIMAL(18,2),
    "tauxRSSP" DECIMAL(5,4),
    "dateDeclaration" TIMESTAMP(3),
    "dateSoumission" TIMESTAMP(3),
    "dateValidation" TIMESTAMP(3),
    "datePaiement" TIMESTAMP(3),
    "montantPaye" DECIMAL(18,2),
    "referencePaiement" TEXT,
    "observations" TEXT,
    "motifRejet" TEXT,
    "etablissementId" TEXT NOT NULL,
    "validePar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneStock" (
    "id" TEXT NOT NULL,
    "declarationId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "categorie" TEXT,
    "unite" TEXT,
    "quantiteInitiale" INTEGER,
    "quantiteEntree" INTEGER,
    "quantiteSortie" INTEGER,
    "quantiteFinale" INTEGER,
    "valeurUnitaire" DECIMAL(18,2),
    "valeurTotale" DECIMAL(18,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LigneStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CritereEvaluation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "description" TEXT,
    "categorie" TEXT NOT NULL,
    "ponderation" INTEGER NOT NULL DEFAULT 1,
    "obligatoire" BOOLEAN NOT NULL DEFAULT false,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "typeEtablissement" "TypeEtablissement",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CritereEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "dateEvaluation" TIMESTAMP(3) NOT NULL,
    "scoreTotal" DECIMAL(5,2),
    "scoreMaximum" DECIMAL(5,2),
    "pourcentage" DECIMAL(5,2),
    "conforme" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "recommandations" TEXT,
    "etablissementId" TEXT NOT NULL,
    "evaluateurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationDetail" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "critereId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "conforme" BOOLEAN NOT NULL DEFAULT false,
    "observation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accreditation" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "dateDemande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExamen" TIMESTAMP(3),
    "dateInspection" TIMESTAMP(3),
    "dateDeliberation" TIMESTAMP(3),
    "dateDecision" TIMESTAMP(3),
    "dateExpiration" TIMESTAMP(3),
    "statut" "StatutDemandeAccreditation" NOT NULL DEFAULT 'SOUMISE',
    "decision" TEXT,
    "motifRejet" TEXT,
    "conditions" TEXT,
    "dureeValidite" INTEGER,
    "documentsJoints" TEXT,
    "etablissementId" TEXT NOT NULL,
    "evaluationId" TEXT,
    "traitePar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accreditation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Province_code_key" ON "Province"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ZoneSante_code_key" ON "ZoneSante"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AireSante_code_key" ON "AireSante"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Etablissement_code_key" ON "Etablissement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Etablissement_numeroIdentifiantRSSP_key" ON "Etablissement"("numeroIdentifiantRSSP");

-- CreateIndex
CREATE UNIQUE INDEX "Declaration_reference_key" ON "Declaration"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "CritereEvaluation_code_key" ON "CritereEvaluation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_reference_key" ON "Evaluation"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Accreditation_reference_key" ON "Accreditation"("reference");

-- AddForeignKey
ALTER TABLE "ZoneSante" ADD CONSTRAINT "ZoneSante_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AireSante" ADD CONSTRAINT "AireSante_zoneSanteId_fkey" FOREIGN KEY ("zoneSanteId") REFERENCES "ZoneSante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etablissement" ADD CONSTRAINT "Etablissement_aireSanteId_fkey" FOREIGN KEY ("aireSanteId") REFERENCES "AireSante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneStock" ADD CONSTRAINT "LigneStock_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "Declaration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationDetail" ADD CONSTRAINT "EvaluationDetail_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationDetail" ADD CONSTRAINT "EvaluationDetail_critereId_fkey" FOREIGN KEY ("critereId") REFERENCES "CritereEvaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accreditation" ADD CONSTRAINT "Accreditation_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
