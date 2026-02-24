import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateDebut = searchParams.get("dateDebut");
    const dateFin = searchParams.get("dateFin");

    // Construire les filtres de période
    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
    const evalDateFilter: { dateEvaluation?: { gte?: Date; lte?: Date } } = {};

    if (dateDebut) {
      dateFilter.createdAt = { ...dateFilter.createdAt, gte: new Date(dateDebut) };
      evalDateFilter.dateEvaluation = { ...evalDateFilter.dateEvaluation, gte: new Date(dateDebut) };
    }
    if (dateFin) {
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59, 999);
      dateFilter.createdAt = { ...dateFilter.createdAt, lte: fin };
      evalDateFilter.dateEvaluation = { ...evalDateFilter.dateEvaluation, lte: fin };
    }

    // Filtre pour exclure les établissements EN_ATTENTE
    const baseFilter = {
      statut: { not: "EN_ATTENTE" as const },
      ...dateFilter,
    };

    // 1. Comptages généraux par type
    const [totalESS, totalEPVG] = await Promise.all([
      prisma.etablissement.count({ where: { type: "ESS", ...baseFilter } }),
      prisma.etablissement.count({ where: { type: "EPVG", ...baseFilter } }),
    ]);

    // 2. Comptages par statut d'accréditation et type
    const accreditationParType = await prisma.etablissement.groupBy({
      by: ["type", "statutAccreditation"],
      where: baseFilter,
      _count: { id: true },
    });

    // Transformer en structure exploitable
    const accreditationESS: Record<string, number> = {};
    const accreditationEPVG: Record<string, number> = {};
    for (const row of accreditationParType) {
      if (row.type === "ESS") {
        accreditationESS[row.statutAccreditation] = row._count.id;
      } else {
        accreditationEPVG[row.statutAccreditation] = row._count.id;
      }
    }

    // 3. Provinces avec le plus d'établissements (ESS vs EPVG)
    const dateConditionEtab = dateDebut || dateFin
      ? `AND e."createdAt" >= ${dateDebut ? `'${dateDebut}'::timestamp` : "'1900-01-01'::timestamp"} AND e."createdAt" <= ${dateFin ? `'${dateFin}T23:59:59'::timestamp` : "'2100-01-01'::timestamp"}`
      : "";

    const provincesEtablissements = await prisma.$queryRawUnsafe<
      { province: string; code: string; total_ess: number; total_epvg: number; total: number }[]
    >(`
      SELECT
        p.name AS province,
        p.code AS code,
        COUNT(e.id) FILTER (WHERE e.type = 'ESS')::int AS total_ess,
        COUNT(e.id) FILTER (WHERE e.type = 'EPVG')::int AS total_epvg,
        COUNT(e.id)::int AS total
      FROM "Province" p
      LEFT JOIN "ZoneSante" zs ON zs."provinceId" = p.id
      LEFT JOIN "AireSante" as_ ON as_."zoneSanteId" = zs.id
      LEFT JOIN "Etablissement" e ON e."aireSanteId" = as_.id ${dateConditionEtab}
      GROUP BY p.id, p.name, p.code
      HAVING COUNT(e.id) > 0
      ORDER BY total DESC
    `);

    // 4. Provinces avec le plus d'établissements accrédités (ESS vs EPVG)
    const provincesAccredites = await prisma.$queryRawUnsafe<
      { province: string; code: string; accredites_ess: number; accredites_epvg: number; total_accredites: number }[]
    >(`
      SELECT
        p.name AS province,
        p.code AS code,
        COUNT(e.id) FILTER (WHERE e.type = 'ESS' AND e."statutAccreditation" = 'ACCREDITE')::int AS accredites_ess,
        COUNT(e.id) FILTER (WHERE e.type = 'EPVG' AND e."statutAccreditation" = 'ACCREDITE')::int AS accredites_epvg,
        COUNT(e.id) FILTER (WHERE e."statutAccreditation" = 'ACCREDITE')::int AS total_accredites
      FROM "Province" p
      LEFT JOIN "ZoneSante" zs ON zs."provinceId" = p.id
      LEFT JOIN "AireSante" as_ ON as_."zoneSanteId" = zs.id
      LEFT JOIN "Etablissement" e ON e."aireSanteId" = as_.id ${dateConditionEtab}
      GROUP BY p.id, p.name, p.code
      HAVING COUNT(e.id) FILTER (WHERE e."statutAccreditation" = 'ACCREDITE') > 0
      ORDER BY total_accredites DESC
    `);

    // 5. Évolution mensuelle des accréditations ESS vs EPVG
    const now = new Date();
    const startDate = dateDebut
      ? new Date(dateDebut)
      : new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const endDate = dateFin
      ? new Date(dateFin)
      : now;

    const evolutionMensuelle = await prisma.$queryRawUnsafe<
      {
        mois: Date;
        eval_ess: number;
        eval_epvg: number;
        accredites_ess: number;
        accredites_epvg: number;
        en_cours_ess: number;
        en_cours_epvg: number;
        score_moyen_ess: number;
        score_moyen_epvg: number;
      }[]
    >(`
      SELECT
        DATE_TRUNC('month', ev."dateEvaluation") AS mois,
        COUNT(ev.id) FILTER (WHERE et.type = 'ESS')::int AS eval_ess,
        COUNT(ev.id) FILTER (WHERE et.type = 'EPVG')::int AS eval_epvg,
        COUNT(ev.id) FILTER (WHERE et.type = 'ESS' AND ev.conforme = true)::int AS accredites_ess,
        COUNT(ev.id) FILTER (WHERE et.type = 'EPVG' AND ev.conforme = true)::int AS accredites_epvg,
        COUNT(ev.id) FILTER (WHERE et.type = 'ESS' AND ev.conforme = false AND ev.pourcentage > 0)::int AS en_cours_ess,
        COUNT(ev.id) FILTER (WHERE et.type = 'EPVG' AND ev.conforme = false AND ev.pourcentage > 0)::int AS en_cours_epvg,
        COALESCE(ROUND(AVG(ev.pourcentage) FILTER (WHERE et.type = 'ESS')::numeric, 1), 0) AS score_moyen_ess,
        COALESCE(ROUND(AVG(ev.pourcentage) FILTER (WHERE et.type = 'EPVG')::numeric, 1), 0) AS score_moyen_epvg
      FROM "Evaluation" ev
      JOIN "Etablissement" et ON et.id = ev."etablissementId"
      WHERE ev."dateEvaluation" >= '${startDate.toISOString()}'::timestamp
        AND ev."dateEvaluation" <= '${endDate.toISOString()}'::timestamp
      GROUP BY DATE_TRUNC('month', ev."dateEvaluation")
      ORDER BY mois ASC
    `);

    // Construire les mois complets
    const evolution = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= end) {
      const moisKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      const moisLabel = current.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

      const found = evolutionMensuelle.find((e) => {
        const d = new Date(e.mois);
        return d.getFullYear() === current.getFullYear() && d.getMonth() === current.getMonth();
      });

      evolution.push({
        mois: moisKey,
        label: moisLabel,
        evalESS: found ? Number(found.eval_ess) : 0,
        evalEPVG: found ? Number(found.eval_epvg) : 0,
        accreditesESS: found ? Number(found.accredites_ess) : 0,
        accreditesEPVG: found ? Number(found.accredites_epvg) : 0,
        enCoursESS: found ? Number(found.en_cours_ess) : 0,
        enCoursEPVG: found ? Number(found.en_cours_epvg) : 0,
        scoreMoyenESS: found ? Number(found.score_moyen_ess) : 0,
        scoreMoyenEPVG: found ? Number(found.score_moyen_epvg) : 0,
      });

      current.setMonth(current.getMonth() + 1);
    }

    // 6. Statistiques par statut et type pour le tableau récapitulatif
    const statutParType = await prisma.etablissement.groupBy({
      by: ["type", "statut"],
      where: dateFilter.createdAt ? dateFilter : undefined,
      _count: { id: true },
    });

    const tableauStatuts: Record<string, { ess: number; epvg: number }> = {};
    for (const row of statutParType) {
      if (!tableauStatuts[row.statut]) {
        tableauStatuts[row.statut] = { ess: 0, epvg: 0 };
      }
      if (row.type === "ESS") {
        tableauStatuts[row.statut].ess = row._count.id;
      } else {
        tableauStatuts[row.statut].epvg = row._count.id;
      }
    }

    return NextResponse.json({
      totaux: {
        ess: totalESS,
        epvg: totalEPVG,
        total: totalESS + totalEPVG,
      },
      accreditationParType: {
        ess: accreditationESS,
        epvg: accreditationEPVG,
      },
      provincesEtablissements,
      provincesAccredites,
      evolution,
      tableauStatuts,
    });
  } catch (error) {
    console.error("Error fetching statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
