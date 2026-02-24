import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const etablissement = await prisma.etablissement.findUnique({
      where: { id },
    });

    if (!etablissement) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    if (etablissement.statut !== "EN_ATTENTE") {
      return NextResponse.json(
        { error: "Seuls les établissements en attente peuvent être approuvés" },
        { status: 400 }
      );
    }

    const updated = await prisma.etablissement.update({
      where: { id },
      data: { statut: "ACTIF" },
      include: {
        aireSante: {
          include: {
            zoneSante: {
              include: {
                province: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error approving etablissement:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'approbation de l'établissement" },
      { status: 500 }
    );
  }
}
