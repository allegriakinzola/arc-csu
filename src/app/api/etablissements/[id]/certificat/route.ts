import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { CertificatAccreditation } from "@/lib/pdf/certificat-accreditation";
import * as React from "react";

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
      },
    });

    if (!etablissement) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    if (etablissement.statutAccreditation !== "ACCREDITE") {
      return NextResponse.json(
        { error: "Cet établissement n'est pas accrédité" },
        { status: 403 }
      );
    }

    const evaluation = await prisma.evaluation.findFirst({
      where: {
        etablissementId: id,
        conforme: true,
      },
      orderBy: {
        dateEvaluation: "desc",
      },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: "Aucune évaluation conforme trouvée" },
        { status: 404 }
      );
    }

    const dateAccreditation = evaluation.dateEvaluation.toISOString();
    const dateExpiration = new Date(evaluation.dateEvaluation);
    dateExpiration.setFullYear(dateExpiration.getFullYear() + 3);

    const numeroAccreditation = `ARC-CSU/${etablissement.type}/${new Date().getFullYear()}/${etablissement.code}`;

    const certificatData = {
      etablissement: {
        nom: etablissement.raisonSociale,
        code: etablissement.code,
        type: etablissement.type,
        sousType:
          etablissement.type === "ESS"
            ? etablissement.sousTypeESS || undefined
            : etablissement.sousTypeEPVG || undefined,
        adresse: etablissement.adresse || undefined,
        telephone: etablissement.telephone || undefined,
        email: etablissement.email || undefined,
        province: etablissement.aireSante.zoneSante.province.name,
        zoneSante: etablissement.aireSante.zoneSante.name,
        aireSante: etablissement.aireSante.name,
      },
      evaluation: {
        reference: evaluation.reference,
        dateEvaluation: evaluation.dateEvaluation.toISOString(),
        scoreTotal: Number(evaluation.scoreTotal || 0),
        scoreMaximum: Number(evaluation.scoreMaximum || 0),
        pourcentage: Number(evaluation.pourcentage || 0),
      },
      dateAccreditation,
      dateExpiration: dateExpiration.toISOString(),
      numeroAccreditation,
    };

    const doc = React.createElement(CertificatAccreditation, certificatData);
    const stream = await renderToStream(doc as any);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificat_Accreditation_${etablissement.code}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating certificat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du certificat" },
      { status: 500 }
    );
  }
}
