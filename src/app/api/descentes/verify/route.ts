import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, motDePasse } = body;

    if (!code || !motDePasse) {
      return NextResponse.json(
        { error: "Le code et le mot de passe sont requis" },
        { status: 400 }
      );
    }

    const descente = await prisma.descente.findUnique({
      where: { code },
    });

    if (!descente) {
      return NextResponse.json(
        { error: "Descente non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si la descente est active et non expirée
    const now = new Date();
    const dateFin = new Date(descente.dateFin);
    
    if (descente.statut === "ANNULEE") {
      return NextResponse.json(
        { error: "Cette descente a été annulée" },
        { status: 403 }
      );
    }

    if (now > dateFin || descente.statut === "EXPIREE") {
      return NextResponse.json(
        { error: "Cette descente a expiré" },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(motDePasse, descente.motDePasse);

    if (!isValid) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Retourner les infos de la descente sans le mot de passe
    const { motDePasse: _, ...descenteData } = descente;
    return NextResponse.json({ 
      valid: true, 
      descente: descenteData 
    });
  } catch (error) {
    console.error("Error verifying descente:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
