import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get("statut");

    const where: any = {};
    if (statut) {
      where.statut = statut;
    }

    const descentes = await prisma.descente.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { etablissements: true },
        },
      },
    });

    return NextResponse.json(descentes);
  } catch (error) {
    console.error("Error fetching descentes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des descentes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, nom, description, motDePasse, dateDebut, dateFin } = body;

    if (!code || !nom || !motDePasse || !dateDebut || !dateFin) {
      return NextResponse.json(
        { error: "Le code, le nom, le mot de passe et les dates sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si le code existe déjà
    const existing = await prisma.descente.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ce code de descente existe déjà" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Déterminer le statut basé sur les dates
    const now = new Date();
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    let statut: "ACTIVE" | "EXPIREE" = "ACTIVE";
    if (now > fin) {
      statut = "EXPIREE";
    }

    const descente = await prisma.descente.create({
      data: {
        code,
        nom,
        description,
        motDePasse: hashedPassword,
        dateDebut: debut,
        dateFin: fin,
        statut,
      },
      include: {
        _count: {
          select: { etablissements: true },
        },
      },
    });

    return NextResponse.json(descente, { status: 201 });
  } catch (error) {
    console.error("Error creating descente:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la descente" },
      { status: 500 }
    );
  }
}
