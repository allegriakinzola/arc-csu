import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const province = await prisma.province.findUnique({
      where: { id },
      include: {
        zonesSante: {
          include: {
            _count: {
              select: { airesSante: true },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!province) {
      return NextResponse.json(
        { error: "Province non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(province);
  } catch (error) {
    console.error("Error fetching province:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la province" },
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
    const { code, name, description } = body;

    const province = await prisma.province.update({
      where: { id },
      data: {
        code,
        name,
        description,
      },
    });

    return NextResponse.json(province);
  } catch (error: unknown) {
    console.error("Error updating province:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Province non trouvée" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la province" },
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
    await prisma.province.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Province supprimée avec succès" });
  } catch (error: unknown) {
    console.error("Error deleting province:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Province non trouvée" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la province" },
      { status: 500 }
    );
  }
}
