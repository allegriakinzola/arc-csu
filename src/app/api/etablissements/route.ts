import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const aireSanteId = searchParams.get("aireSanteId");
    const statut = searchParams.get("statut");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (aireSanteId) where.aireSanteId = aireSanteId;
    if (search) {
      where.OR = [
        { raisonSociale: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { numeroIdentifiantRSSP: { contains: search, mode: "insensitive" } },
      ];
    }

    if (statut) {
      where.statut = statut;
    }

    const [etablissements, total] = await Promise.all([
      prisma.etablissement.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.etablissement.count({ where }),
    ]);

    return NextResponse.json({
      data: etablissements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching etablissements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des établissements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      numeroRCCM,
      raisonSociale,
      sigle,
      type,
      sousTypeESS,
      sousTypeEPVG,
      aireSanteId,
      adresse,
      quartier,
      avenue,
      numero,
      coordonneesGPS,
      latitude,
      longitude,
      telephone,
      telephoneSecondaire,
      email,
      siteWeb,
      nomResponsable,
      fonctionResponsable,
      telephoneResponsable,
      emailResponsable,
      numeroIdNat,
      numeroImpot,
      dateCreation,
      dateOuverture,
      nombreLits,
      nombrePersonnel,
      descenteId,
    } = body;

    if (!numeroRCCM || !raisonSociale || !type || !aireSanteId) {
      return NextResponse.json(
        { error: "Le numéro RCCM, la raison sociale, le type et l'aire de santé sont requis" },
        { status: 400 }
      );
    }

    // Générer le code automatiquement à partir du RCCM ou séquentiellement
    const year = new Date().getFullYear();
    const count = await prisma.etablissement.count();
    const code = `${type}-${year}-${String(count + 1).padStart(6, "0")}`;

    // Générer le numéro identifiant ARC-CSU
    const numeroIdentifiantRSSP = `ARC-CSU-${code}`;

    // Déterminer le statut : EN_ATTENTE si créé via descente, ACTIF sinon
    const statut = descenteId ? "EN_ATTENTE" : "ACTIF";

    const etablissement = await prisma.etablissement.create({
      data: {
        code,
        raisonSociale,
        sigle,
        type,
        sousTypeESS: type === "ESS" ? sousTypeESS : null,
        sousTypeEPVG: type === "EPVG" ? sousTypeEPVG : null,
        statut,
        aireSanteId,
        descenteId: descenteId || null,
        adresse,
        quartier,
        avenue,
        numero,
        coordonneesGPS,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        telephone,
        telephoneSecondaire,
        email,
        siteWeb,
        nomResponsable,
        fonctionResponsable,
        telephoneResponsable,
        emailResponsable,
        numeroRCCM,
        numeroIdNat,
        numeroImpot,
        dateCreation: dateCreation ? new Date(dateCreation) : null,
        dateOuverture: dateOuverture ? new Date(dateOuverture) : null,
        nombreLits,
        nombrePersonnel,
        numeroIdentifiantRSSP,
        dateIdentificationRSSP: new Date(),
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

    return NextResponse.json(etablissement, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating etablissement:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Un établissement avec ce code existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création de l'établissement" },
      { status: 500 }
    );
  }
}
