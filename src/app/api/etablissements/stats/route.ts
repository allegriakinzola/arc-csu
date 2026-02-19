import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalEtablissements,
      totalESS,
      totalEPVG,
      parStatut,
      parAccreditation,
      parProvince,
      totalEvaluations,
      evaluationsStats,
    ] = await Promise.all([
      prisma.etablissement.count(),
      prisma.etablissement.count({ where: { type: "ESS" } }),
      prisma.etablissement.count({ where: { type: "EPVG" } }),
      prisma.etablissement.groupBy({
        by: ["statut"],
        _count: { statut: true },
      }),
      prisma.etablissement.groupBy({
        by: ["statutAccreditation"],
        _count: { statutAccreditation: true },
      }),
      prisma.$queryRaw`
        SELECT 
          p.name as province,
          p.code as code,
          COUNT(e.id)::int as total
        FROM "Province" p
        LEFT JOIN "ZoneSante" zs ON zs."provinceId" = p.id
        LEFT JOIN "AireSante" as_ ON as_."zoneSanteId" = zs.id
        LEFT JOIN "Etablissement" e ON e."aireSanteId" = as_.id
        GROUP BY p.id, p.name, p.code
        ORDER BY total DESC
      `,
      // Nombre d'établissements avec au moins une évaluation
      prisma.evaluation.groupBy({
        by: ["etablissementId"],
        _count: true,
      }),
      // Statistiques des évaluations (moyenne de pourcentage)
      prisma.evaluation.aggregate({
        _avg: { pourcentage: true },
        _count: true,
      }),
    ]);

    // Récupérer les dernières évaluations par établissement pour calculer les tranches
    const latestEvaluations = await prisma.$queryRaw<
      { pourcentage: number }[]
    >`
      SELECT DISTINCT ON ("etablissementId") "pourcentage"
      FROM "Evaluation"
      ORDER BY "etablissementId", "dateEvaluation" DESC
    `;

    const tranches = {
      excellent: 0, // >= 80%
      bon: 0,       // 50-79%
      faible: 0,    // 1-49%
      nonEvalue: 0, // 0% ou pas d'évaluation
    };

    for (const ev of latestEvaluations) {
      const pct = Number(ev.pourcentage) || 0;
      if (pct >= 80) tranches.excellent++;
      else if (pct >= 50) tranches.bon++;
      else if (pct > 0) tranches.faible++;
      else tranches.nonEvalue++;
    }

    // Les établissements sans évaluation du tout
    const etablissementsEvalues = totalEvaluations.length;
    tranches.nonEvalue += totalEtablissements - etablissementsEvalues;

    // Évolution des accréditations sur les 12 derniers mois
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const evaluationsParMois = await prisma.$queryRaw<
      { mois: Date; total: number; score_moyen: number; accredites: number; en_cours: number; non_accredites: number }[]
    >`
      WITH monthly AS (
        SELECT
          DATE_TRUNC('month', e."dateEvaluation") AS mois,
          COUNT(*)::int AS total,
          ROUND(AVG(e."pourcentage")::numeric, 1) AS score_moyen,
          COUNT(*) FILTER (WHERE e."conforme" = true)::int AS accredites,
          COUNT(*) FILTER (WHERE e."conforme" = false AND e."pourcentage" > 0)::int AS en_cours,
          COUNT(*) FILTER (WHERE e."pourcentage" = 0 OR e."pourcentage" IS NULL)::int AS non_accredites
        FROM "Evaluation" e
        WHERE e."dateEvaluation" >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', e."dateEvaluation")
        ORDER BY mois ASC
      )
      SELECT * FROM monthly
    `;

    // Construire les 12 mois même s'il n'y a pas de données
    const evolutionAccreditation = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const moisLabel = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

      const found = evaluationsParMois.find((e) => {
        const d = new Date(e.mois);
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
      });

      evolutionAccreditation.push({
        mois: moisKey,
        label: moisLabel,
        evaluations: found ? Number(found.total) : 0,
        scoreMoyen: found ? Number(found.score_moyen) : 0,
        accredites: found ? Number(found.accredites) : 0,
        enCours: found ? Number(found.en_cours) : 0,
        nonAccredites: found ? Number(found.non_accredites) : 0,
      });
    }

    // Évolution cumulative des établissements créés par mois
    const etablissementsParMois = await prisma.$queryRaw<
      { mois: Date; total: number; ess: number; epvg: number }[]
    >`
      SELECT
        DATE_TRUNC('month', "createdAt") AS mois,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE "type" = 'ESS')::int AS ess,
        COUNT(*) FILTER (WHERE "type" = 'EPVG')::int AS epvg
      FROM "Etablissement"
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY mois ASC
    `;

    const evolutionEtablissements = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const moisLabel = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

      const found = etablissementsParMois.find((e) => {
        const d = new Date(e.mois);
        return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
      });

      evolutionEtablissements.push({
        mois: moisKey,
        label: moisLabel,
        total: found ? Number(found.total) : 0,
        ess: found ? Number(found.ess) : 0,
        epvg: found ? Number(found.epvg) : 0,
      });
    }

    return NextResponse.json({
      total: totalEtablissements,
      parType: {
        ESS: totalESS,
        EPVG: totalEPVG,
      },
      parStatut: parStatut.reduce((acc, item) => {
        acc[item.statut] = item._count.statut;
        return acc;
      }, {} as Record<string, number>),
      parAccreditation: parAccreditation.reduce((acc, item) => {
        acc[item.statutAccreditation] = item._count.statutAccreditation;
        return acc;
      }, {} as Record<string, number>),
      parProvince,
      accreditation: {
        totalEvalues: etablissementsEvalues,
        totalNonEvalues: totalEtablissements - etablissementsEvalues,
        pourcentageMoyen: evaluationsStats._avg.pourcentage
          ? Number(evaluationsStats._avg.pourcentage)
          : 0,
        totalEvaluations: evaluationsStats._count,
        tranches,
      },
      evolutionAccreditation,
      evolutionEtablissements,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
