import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneSanteId = searchParams.get("zoneSanteId");

    const where = zoneSanteId ? { zoneSanteId } : {};

    const airesSante = await prisma.aireSante.findMany({
      where,
      include: {
        zoneSante: {
          include: {
            province: true,
          },
        },
        _count: {
          select: { etablissements: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(airesSante);
  } catch (error) {
    console.error("Error fetching aires de santé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des aires de santé" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, zoneSanteId } = body;

    if (!code || !name || !zoneSanteId) {
      return NextResponse.json(
        { error: "Le code, le nom et la zone de santé sont requis" },
        { status: 400 }
      );
    }

    const aireSante = await prisma.aireSante.create({
      data: {
        code,
        name,
        description,
        zoneSanteId,
      },
      include: {
        zoneSante: {
          include: {
            province: true,
          },
        },
      },
    });

    return NextResponse.json(aireSante, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating aire de santé:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Une aire de santé avec ce code existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création de l'aire de santé" },
      { status: 500 }
    );
  }
}
