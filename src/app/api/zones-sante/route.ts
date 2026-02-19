import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get("provinceId");

    const where = provinceId ? { provinceId } : {};

    const zonesSante = await prisma.zoneSante.findMany({
      where,
      include: {
        province: true,
        _count: {
          select: { airesSante: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(zonesSante);
  } catch (error) {
    console.error("Error fetching zones de santé:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des zones de santé" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, provinceId } = body;

    if (!code || !name || !provinceId) {
      return NextResponse.json(
        { error: "Le code, le nom et la province sont requis" },
        { status: 400 }
      );
    }

    const zoneSante = await prisma.zoneSante.create({
      data: {
        code,
        name,
        description,
        provinceId,
      },
      include: {
        province: true,
      },
    });

    return NextResponse.json(zoneSante, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating zone de santé:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Une zone de santé avec ce code existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création de la zone de santé" },
      { status: 500 }
    );
  }
}
