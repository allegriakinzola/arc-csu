import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const etablissement = await prisma.etablissement.findUnique({
      where: { id },
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
        declarations: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        evaluations: {
          orderBy: { dateEvaluation: "desc" },
          take: 5,
        },
        accreditations: {
          orderBy: { dateDemande: "desc" },
          take: 5,
        },
      },
    });

    if (!etablissement) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(etablissement);
  } catch (error) {
    console.error("Error fetching etablissement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'établissement" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const etablissement = await prisma.etablissement.update({
      where: { id },
      data: {
        ...body,
        dateCreation: body.dateCreation ? new Date(body.dateCreation) : undefined,
        dateOuverture: body.dateOuverture ? new Date(body.dateOuverture) : undefined,
      },
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

    return NextResponse.json(etablissement);
  } catch (error: unknown) {
    console.error("Error updating etablissement:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'établissement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.etablissement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Établissement supprimé avec succès" });
  } catch (error: unknown) {
    console.error("Error deleting etablissement:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'établissement" },
      { status: 500 }
    );
  }
}
