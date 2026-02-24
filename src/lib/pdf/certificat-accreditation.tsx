import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 15,
    borderBottom: "2px solid #2563eb",
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 35,
    height: 35,
    backgroundColor: "#2563eb",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1e40af",
  },
  headerTitle: {
    fontSize: 8,
    color: "#64748b",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 7,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: "center",
    color: "#1e293b",
    marginTop: 15,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    color: "#64748b",
    marginBottom: 15,
  },
  content: {
    marginTop: 10,
    marginBottom: 15,
  },
  introText: {
    fontSize: 9,
    lineHeight: 1.4,
    textAlign: "center",
    color: "#475569",
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: "#475569",
    width: "35%",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 9,
    color: "#1e293b",
    width: "65%",
    fontWeight: 500,
  },
  accreditationBox: {
    backgroundColor: "#dbeafe",
    border: "2px solid #3b82f6",
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  accreditationTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 6,
  },
  accreditationText: {
    fontSize: 8,
    color: "#1e40af",
    textAlign: "center",
    lineHeight: 1.3,
  },
  scoreBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    marginBottom: 8,
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 7,
    color: "#64748b",
    marginBottom: 3,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#16a34a",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 30,
    right: 30,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  footerLabel: {
    fontSize: 7,
    color: "#64748b",
  },
  footerValue: {
    fontSize: 7,
    color: "#1e293b",
    fontWeight: 500,
  },
  signature: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  signatureBlock: {
    alignItems: "center",
    width: "40%",
  },
  signatureLine: {
    borderTop: "1px solid #94a3b8",
    width: "100%",
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 7,
    color: "#64748b",
    textAlign: "center",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 60,
    color: "#f1f5f9",
    opacity: 0.2,
    fontWeight: 700,
  },
});

interface CertificatAccreditationProps {
  etablissement: {
    nom: string;
    code: string;
    type: string;
    sousType?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    province: string;
    zoneSante: string;
    aireSante: string;
  };
  evaluation: {
    reference: string;
    dateEvaluation: string;
    scoreTotal: number;
    scoreMaximum: number;
    pourcentage: number;
  };
  dateAccreditation: string;
  dateExpiration?: string;
  numeroAccreditation: string;
}

export const CertificatAccreditation: React.FC<CertificatAccreditationProps> = ({
  etablissement,
  evaluation,
  dateAccreditation,
  dateExpiration,
  numeroAccreditation,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>ACCRÉDITÉ</Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Text style={{ color: "#ffffff", fontSize: 20 }}>★</Text>
              </View>
              <Text style={styles.logoText}>ARC-CSU</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>
                RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
              </Text>
              <Text style={styles.headerTitle}>
                Autorité de Régulation et Contrôle
              </Text>
              <Text style={styles.headerTitle}>
                de la Couverture Santé Universelle
              </Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            "Ensemble pour garantir un accès équitable aux soins de santé de
            qualité sans barrière financière"
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Certificat d'Accréditation</Text>
        <Text style={styles.subtitle}>
          Délivré conformément aux normes de qualité et de sécurité en vigueur
        </Text>

        {/* Intro */}
        <View style={styles.content}>
          <Text style={styles.introText}>
            L'Autorité de Régulation et Contrôle de la Couverture Santé
            Universelle (ARC-CSU) certifie que l'établissement ci-dessous a
            satisfait aux exigences réglementaires et aux normes de qualité
            requises pour l'accréditation dans le cadre de la Couverture Santé
            Universelle en République Démocratique du Congo.
          </Text>

          {/* Établissement Info */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Établissement :</Text>
              <Text style={styles.infoValue}>{etablissement.nom}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Code :</Text>
              <Text style={styles.infoValue}>{etablissement.code}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type :</Text>
              <Text style={styles.infoValue}>
                {etablissement.type}
                {etablissement.sousType ? ` - ${etablissement.sousType}` : ""}
              </Text>
            </View>
            {etablissement.adresse && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Adresse :</Text>
                <Text style={styles.infoValue}>{etablissement.adresse}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Localisation :</Text>
              <Text style={styles.infoValue}>
                {etablissement.aireSante}, {etablissement.zoneSante},{" "}
                {etablissement.province}
              </Text>
            </View>
            {etablissement.telephone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Téléphone :</Text>
                <Text style={styles.infoValue}>{etablissement.telephone}</Text>
              </View>
            )}
            {etablissement.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email :</Text>
                <Text style={styles.infoValue}>{etablissement.email}</Text>
              </View>
            )}
          </View>

          {/* Accréditation Box */}
          <View style={styles.accreditationBox}>
            <Text style={styles.accreditationTitle}>
              STATUT D'ACCRÉDITATION
            </Text>
            <Text style={styles.accreditationText}>
              Cet établissement est officiellement ACCRÉDITÉ pour fournir des
              services de santé dans le cadre de la Couverture Santé
              Universelle.
            </Text>

            <View style={styles.scoreBox}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Score obtenu</Text>
                <Text style={styles.scoreValue}>
                  {evaluation.scoreTotal}/{evaluation.scoreMaximum}
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Pourcentage</Text>
                <Text style={styles.scoreValue}>
                  {evaluation.pourcentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Accréditation Details */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>N° Accréditation :</Text>
              <Text style={styles.infoValue}>{numeroAccreditation}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Référence Évaluation :</Text>
              <Text style={styles.infoValue}>{evaluation.reference}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date d'Accréditation :</Text>
              <Text style={styles.infoValue}>
                {formatDate(dateAccreditation)}
              </Text>
            </View>
            {dateExpiration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date d'Expiration :</Text>
                <Text style={styles.infoValue}>
                  {formatDate(dateExpiration)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>
              Date d'émission du certificat :
            </Text>
            <Text style={styles.footerValue}>
              {formatDate(new Date().toISOString())}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Document officiel ARC-CSU</Text>
            <Text style={styles.footerValue}>
              Certificat N° {numeroAccreditation}
            </Text>
          </View>

          <View style={styles.signature}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>
                Le Directeur Général de l'ARC-CSU
              </Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>
                Le Responsable de l'Accréditation
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
