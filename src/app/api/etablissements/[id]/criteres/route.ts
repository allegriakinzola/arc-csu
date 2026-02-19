import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les critères cochés pour un établissement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Récupérer la dernière évaluation de cet établissement
    const evaluation = await prisma.evaluation.findFirst({
      where: { etablissementId: id },
      orderBy: { dateEvaluation: "desc" },
      include: {
        details: {
          include: {
            critere: true,
          },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json({
        evaluation: null,
        checkedCritereIds: [],
        pourcentage: 0,
        scoreTotal: 0,
        scoreMaximum: 0,
      });
    }

    const checkedCritereIds = evaluation.details
      .filter((d) => d.conforme)
      .map((d) => d.critereId);

    return NextResponse.json({
      evaluation: {
        id: evaluation.id,
        reference: evaluation.reference,
        dateEvaluation: evaluation.dateEvaluation,
        pourcentage: evaluation.pourcentage ? Number(evaluation.pourcentage) : 0,
        scoreTotal: evaluation.scoreTotal ? Number(evaluation.scoreTotal) : 0,
        scoreMaximum: evaluation.scoreMaximum ? Number(evaluation.scoreMaximum) : 0,
        conforme: evaluation.conforme,
      },
      checkedCritereIds,
      pourcentage: evaluation.pourcentage ? Number(evaluation.pourcentage) : 0,
      scoreTotal: evaluation.scoreTotal ? Number(evaluation.scoreTotal) : 0,
      scoreMaximum: evaluation.scoreMaximum ? Number(evaluation.scoreMaximum) : 0,
    });
  } catch (error) {
    console.error("Error fetching criteres for etablissement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des critères" },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder les critères cochés pour un établissement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { checkedCritereIds } = body as { checkedCritereIds: string[] };

    // Vérifier que l'établissement existe
    const etablissement = await prisma.etablissement.findUnique({
      where: { id },
    });

    if (!etablissement) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les critères actifs pour ce type d'établissement
    const criteres = await prisma.critereEvaluation.findMany({
      where: {
        actif: true,
        typeEtablissement: etablissement.type,
      },
    });

    // Calculer les scores
    const scoreMaximum = criteres.reduce((sum, c) => sum + c.ponderation, 0);
    const scoreTotal = criteres
      .filter((c) => checkedCritereIds.includes(c.id))
      .reduce((sum, c) => sum + c.ponderation, 0);
    const pourcentage = scoreMaximum > 0 ? (scoreTotal / scoreMaximum) * 100 : 0;

    // Vérifier si tous les critères obligatoires sont cochés
    const criteresObligatoires = criteres.filter((c) => c.obligatoire);
    const tousObligatoiresCoches = criteresObligatoires.every((c) =>
      checkedCritereIds.includes(c.id)
    );

    // Générer une référence unique
    const count = await prisma.evaluation.count({
      where: { etablissementId: id },
    });
    const reference = `EVAL-${etablissement.code}-${String(count + 1).padStart(3, "0")}`;

    // Supprimer l'évaluation précédente s'il y en a une (on garde la dernière)
    const existingEval = await prisma.evaluation.findFirst({
      where: { etablissementId: id },
      orderBy: { dateEvaluation: "desc" },
    });

    if (existingEval) {
      // Mettre à jour l'évaluation existante
      await prisma.evaluationDetail.deleteMany({
        where: { evaluationId: existingEval.id },
      });

      const evaluation = await prisma.evaluation.update({
        where: { id: existingEval.id },
        data: {
          dateEvaluation: new Date(),
          scoreTotal,
          scoreMaximum,
          pourcentage: Math.round(pourcentage * 100) / 100,
          conforme: tousObligatoiresCoches && pourcentage >= 80,
          observations: null,
          details: {
            create: criteres.map((critere) => ({
              critereId: critere.id,
              score: checkedCritereIds.includes(critere.id) ? critere.ponderation : 0,
              conforme: checkedCritereIds.includes(critere.id),
            })),
          },
        },
        include: {
          details: true,
        },
      });

      // Mettre à jour le statut d'accréditation de l'établissement
      const newStatut = tousObligatoiresCoches && pourcentage >= 80
        ? "ACCREDITE" as const
        : pourcentage > 0
        ? "EN_COURS" as const
        : "NON_ACCREDITE" as const;

      await prisma.etablissement.update({
        where: { id },
        data: { statutAccreditation: newStatut },
      });

      return NextResponse.json({
        evaluation,
        pourcentage: Math.round(pourcentage * 100) / 100,
        scoreTotal,
        scoreMaximum,
        conforme: tousObligatoiresCoches && pourcentage >= 80,
        statutAccreditation: newStatut,
      });
    } else {
      // Créer une nouvelle évaluation
      const evaluation = await prisma.evaluation.create({
        data: {
          reference,
          dateEvaluation: new Date(),
          scoreTotal,
          scoreMaximum,
          pourcentage: Math.round(pourcentage * 100) / 100,
          conforme: tousObligatoiresCoches && pourcentage >= 80,
          etablissementId: id,
          details: {
            create: criteres.map((critere) => ({
              critereId: critere.id,
              score: checkedCritereIds.includes(critere.id) ? critere.ponderation : 0,
              conforme: checkedCritereIds.includes(critere.id),
            })),
          },
        },
        include: {
          details: true,
        },
      });

      // Mettre à jour le statut d'accréditation
      const newStatut2 = tousObligatoiresCoches && pourcentage >= 80
        ? "ACCREDITE" as const
        : pourcentage > 0
        ? "EN_COURS" as const
        : "NON_ACCREDITE" as const;

      await prisma.etablissement.update({
        where: { id },
        data: { statutAccreditation: newStatut2 },
      });

      return NextResponse.json({
        evaluation,
        pourcentage: Math.round(pourcentage * 100) / 100,
        scoreTotal,
        scoreMaximum,
        conforme: tousObligatoiresCoches && pourcentage >= 80,
        statutAccreditation: newStatut2,
      });
    }
  } catch (error) {
    console.error("Error saving criteres for etablissement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des critères" },
      { status: 500 }
    );
  }
}
