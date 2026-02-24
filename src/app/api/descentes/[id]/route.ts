import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const descente = await prisma.descente.findUnique({
      where: { id },
      include: {
        _count: {
          select: { etablissements: true },
        },
      },
    });

    if (!descente) {
      return NextResponse.json(
        { error: "Descente non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(descente);
  } catch (error) {
    console.error("Error fetching descente:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la descente" },
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
    const { nom, description, motDePasse, dateDebut, dateFin, statut } = body;

    const updateData: any = {};
    
    if (nom !== undefined) updateData.nom = nom;
    if (description !== undefined) updateData.description = description;
    if (dateDebut !== undefined) updateData.dateDebut = new Date(dateDebut);
    if (dateFin !== undefined) updateData.dateFin = new Date(dateFin);
    if (statut !== undefined) updateData.statut = statut;
    
    if (motDePasse) {
      updateData.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    const descente = await prisma.descente.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { etablissements: true },
        },
      },
    });

    return NextResponse.json(descente);
  } catch (error) {
    console.error("Error updating descente:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la descente" },
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

    await prisma.descente.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Descente supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting descente:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la descente" },
      { status: 500 }
    );
  }
}
