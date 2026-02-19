import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      include: {
        _count: {
          select: { zonesSante: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(provinces);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des provinces" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Le code et le nom sont requis" },
        { status: 400 }
      );
    }

    const province = await prisma.province.create({
      data: {
        code,
        name,
        description,
      },
    });

    return NextResponse.json(province, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating province:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Une province avec ce code existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création de la province" },
      { status: 500 }
    );
  }
}
