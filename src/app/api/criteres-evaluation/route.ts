import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // ESS ou EPVG
    const categorie = searchParams.get("categorie");
    const obligatoire = searchParams.get("obligatoire");

    const where: Record<string, unknown> = { actif: true };

    if (type) where.typeEtablissement = type;
    if (categorie) where.categorie = categorie;
    if (obligatoire === "true") where.obligatoire = true;
    if (obligatoire === "false") where.obligatoire = false;

    const criteres = await prisma.critereEvaluation.findMany({
      where,
      orderBy: [
        { categorie: "asc" },
        { obligatoire: "desc" },
        { ponderation: "desc" },
      ],
    });

    // Grouper par catégorie
    const grouped = criteres.reduce(
      (acc, critere) => {
        if (!acc[critere.categorie]) {
          acc[critere.categorie] = [];
        }
        acc[critere.categorie].push(critere);
        return acc;
      },
      {} as Record<string, typeof criteres>
    );

    return NextResponse.json({
      data: criteres,
      grouped,
      total: criteres.length,
      totalObligatoires: criteres.filter((c) => c.obligatoire).length,
    });
  } catch (error) {
    console.error("Error fetching criteres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des critères" },
      { status: 500 }
    );
  }
}
