"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Building2,
  Hospital,
  Pill,
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  FileText,
  Shield,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BedDouble,
  Users,
} from "lucide-react";
import {
  Etablissement,
  CritereEvaluation,
  CriteresResponse,
  SOUS_TYPES_ESS,
  SOUS_TYPES_EPVG,
  STATUTS_ETABLISSEMENT,
  STATUTS_ACCREDITATION,
  SousTypeESS,
  SousTypeEPVG,
} from "@/lib/types";

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case "ACTIF":
      return { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
    case "INACTIF":
      return { color: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle };
    case "SUSPENDU":
      return { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle };
    case "EN_ATTENTE":
      return { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock };
    default:
      return { color: "bg-gray-100 text-gray-500 border-gray-200", icon: Clock };
  }
};

const getAccreditationBadge = (statut: string) => {
  switch (statut) {
    case "ACCREDITE":
      return { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Accrédité" };
    case "EN_COURS":
      return { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock, label: "En cours" };
    case "NON_ACCREDITE":
      return { color: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle, label: "Non accrédité" };
    case "EXPIRE":
      return { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle, label: "Expiré" };
    case "REFUSE":
      return { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Refusé" };
    default:
      return { color: "bg-gray-100 text-gray-500 border-gray-200", icon: Clock, label: statut };
  }
};

function InfoItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            className="text-sm font-medium text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function EtablissementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [etablissement, setEtablissement] = useState<Etablissement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [criteresGrouped, setCriteresGrouped] = useState<Record<string, CritereEvaluation[]>>({});
  const [criteresTotal, setCriteresTotal] = useState(0);
  const [criteresObligatoires, setCriteresObligatoires] = useState(0);
  const [checkedCritereIds, setCheckedCritereIds] = useState<Set<string>>(new Set());
  const [pourcentage, setPourcentage] = useState(0);
  const [scoreTotal, setScoreTotal] = useState(0);
  const [scoreMaximum, setScoreMaximum] = useState(0);

  useEffect(() => {
    const fetchEtablissement = async () => {
      try {
        const response = await fetch(`/api/etablissements/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Établissement non trouvé");
          } else {
            setError("Erreur lors du chargement");
          }
          return;
        }
        const data = await response.json();
        setEtablissement(data);
      } catch {
        setError("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };

    fetchEtablissement();
  }, [id]);

  // Charger les critères et la progression quand l'établissement est chargé
  useEffect(() => {
    if (etablissement?.type) {
      // Charger les définitions des critères
      fetch(`/api/criteres-evaluation?type=${etablissement.type}`)
        .then((res) => res.json())
        .then((data: CriteresResponse) => {
          setCriteresGrouped(data.grouped);
          setCriteresTotal(data.total);
          setCriteresObligatoires(data.totalObligatoires);
        })
        .catch(console.error);

      // Charger les critères cochés et la progression
      fetch(`/api/etablissements/${id}/criteres`)
        .then((res) => res.json())
        .then((data) => {
          if (data.checkedCritereIds?.length > 0) {
            setCheckedCritereIds(new Set(data.checkedCritereIds));
          }
          setPourcentage(data.pourcentage || 0);
          setScoreTotal(data.scoreTotal || 0);
          setScoreMaximum(data.scoreMaximum || 0);
        })
        .catch(console.error);
    }
  }, [etablissement?.type, id]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet établissement ?")) return;
    try {
      const res = await fetch(`/api/etablissements/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/etablissements");
      }
    } catch {
      console.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !etablissement) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{error || "Établissement non trouvé"}</h3>
        <p className="text-muted-foreground mb-4">
          L&apos;établissement demandé n&apos;existe pas ou a été supprimé.
        </p>
        <Link href="/dashboard/etablissements">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  const statutBadge = getStatutBadge(etablissement.statut);
  const accreditationBadge = getAccreditationBadge(etablissement.statutAccreditation);
  const StatutIcon = statutBadge.icon;
  const AccredIcon = accreditationBadge.icon;

  const sousType =
    etablissement.type === "ESS" && etablissement.sousTypeESS
      ? SOUS_TYPES_ESS[etablissement.sousTypeESS as SousTypeESS]
      : etablissement.type === "EPVG" && etablissement.sousTypeEPVG
      ? SOUS_TYPES_EPVG[etablissement.sousTypeEPVG as SousTypeEPVG]
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/etablissements">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl ${
                etablissement.type === "ESS"
                  ? "bg-primary/10"
                  : "bg-secondary/50"
              }`}
            >
              {etablissement.type === "ESS" ? (
                <Hospital className="h-8 w-8 text-primary" />
              ) : (
                <Pill className="h-8 w-8 text-secondary-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {etablissement.raisonSociale}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {etablissement.sigle && (
                  <span className="text-muted-foreground">
                    ({etablissement.sigle})
                  </span>
                )}
                <Badge variant="outline">
                  {etablissement.type === "ESS"
                    ? "Établissement de Soins de Santé"
                    : "Établissement Pharmaceutique de Vente en Gros"}
                </Badge>
                {sousType && (
                  <Badge variant="secondary">{sousType}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${statutBadge.color}`}
                >
                  <StatutIcon className="h-3 w-3" />
                  {STATUTS_ETABLISSEMENT[etablissement.statut]}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${accreditationBadge.color}`}
                >
                  <AccredIcon className="h-3 w-3" />
                  {STATUTS_ACCREDITATION[etablissement.statutAccreditation]}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-14 md:ml-0">
          <Link href={`/dashboard/etablissements/${id}/modifier`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Identifiants */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Code</p>
              <p className="text-sm font-bold font-mono">{etablissement.code}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Identifiant RSSP
              </p>
              <p className="text-sm font-bold font-mono text-primary">
                {etablissement.numeroIdentifiantRSSP || "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Date identification
              </p>
              <p className="text-sm font-bold">
                {etablissement.dateIdentificationRSSP
                  ? new Date(etablissement.dateIdentificationRSSP).toLocaleDateString("fr-FR")
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        {etablissement.type === "ESS" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <BedDouble className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{etablissement.nombreLits ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Lits</p>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{etablissement.nombrePersonnel ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Personnel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {etablissement.type === "EPVG" && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <p className="text-sm font-bold">
                  {etablissement.sousTypeEPVG
                    ? SOUS_TYPES_EPVG[etablissement.sousTypeEPVG as SousTypeEPVG]
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoItem
              icon={MapPin}
              label="Province"
              value={etablissement.aireSante?.zoneSante?.province?.name}
            />
            <InfoItem
              icon={MapPin}
              label="Zone de Santé"
              value={etablissement.aireSante?.zoneSante?.name}
            />
            <InfoItem
              icon={MapPin}
              label="Aire de Santé"
              value={etablissement.aireSante?.name}
            />
            <Separator className="my-2" />
            <InfoItem icon={MapPin} label="Quartier" value={etablissement.quartier} />
            <InfoItem icon={MapPin} label="Avenue" value={etablissement.avenue} />
            <InfoItem icon={MapPin} label="Numéro" value={etablissement.numero} />
            <InfoItem icon={MapPin} label="Adresse" value={etablissement.adresse} />
            {etablissement.latitude && etablissement.longitude && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Coordonnées GPS</p>
                <p className="text-sm font-mono">
                  {etablissement.latitude?.toFixed(6)}, {etablissement.longitude?.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact & Responsable */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoItem
                icon={Phone}
                label="Téléphone principal"
                value={etablissement.telephone}
                href={etablissement.telephone ? `tel:${etablissement.telephone}` : undefined}
              />
              <InfoItem
                icon={Phone}
                label="Téléphone secondaire"
                value={etablissement.telephoneSecondaire}
                href={etablissement.telephoneSecondaire ? `tel:${etablissement.telephoneSecondaire}` : undefined}
              />
              <InfoItem
                icon={Mail}
                label="Email"
                value={etablissement.email}
                href={etablissement.email ? `mailto:${etablissement.email}` : undefined}
              />
              <InfoItem
                icon={Globe}
                label="Site web"
                value={etablissement.siteWeb}
                href={etablissement.siteWeb || undefined}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Responsable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoItem icon={User} label="Nom complet" value={etablissement.nomResponsable} />
              <InfoItem icon={Shield} label="Fonction" value={etablissement.fonctionResponsable} />
              <InfoItem
                icon={Phone}
                label="Téléphone"
                value={etablissement.telephoneResponsable}
                href={etablissement.telephoneResponsable ? `tel:${etablissement.telephoneResponsable}` : undefined}
              />
              <InfoItem
                icon={Mail}
                label="Email"
                value={etablissement.emailResponsable}
                href={etablissement.emailResponsable ? `mailto:${etablissement.emailResponsable}` : undefined}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informations légales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Informations légales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">RCCM</p>
              <p className="text-sm font-medium font-mono mt-1">
                {etablissement.numeroRCCM || "—"}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Id. Nat.</p>
              <p className="text-sm font-medium font-mono mt-1">
                {etablissement.numeroIdNat || "—"}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">N° Impôt</p>
              <p className="text-sm font-medium font-mono mt-1">
                {etablissement.numeroImpot || "—"}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Date de création</p>
              <p className="text-sm font-medium mt-1">
                {etablissement.dateCreation
                  ? new Date(etablissement.dateCreation).toLocaleDateString("fr-FR")
                  : "—"}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Date d&apos;ouverture</p>
              <p className="text-sm font-medium mt-1">
                {etablissement.dateOuverture
                  ? new Date(etablissement.dateOuverture).toLocaleDateString("fr-FR")
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression d'accréditation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Progression d&apos;accréditation
              </CardTitle>
              <CardDescription>
                Score de conformité basé sur les critères évalués
              </CardDescription>
            </div>
            <Link href={`/dashboard/etablissements/${id}/modifier`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-3 w-3" />
                Modifier les critères
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barre de progression principale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score global</span>
                <span className={`text-2xl font-bold ${
                  pourcentage >= 80 ? "text-green-600" :
                  pourcentage >= 50 ? "text-yellow-600" :
                  pourcentage > 0 ? "text-orange-600" :
                  "text-muted-foreground"
                }`}>
                  {pourcentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pourcentage >= 80 ? "bg-green-500" :
                    pourcentage >= 50 ? "bg-yellow-500" :
                    pourcentage > 0 ? "bg-orange-500" :
                    "bg-muted"
                  }`}
                  style={{ width: `${Math.min(pourcentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{scoreTotal} / {scoreMaximum} points</span>
                <span>{checkedCritereIds.size} / {criteresTotal} critères validés</span>
              </div>
            </div>

            {/* Indicateurs rapides */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold">{checkedCritereIds.size}</p>
                <p className="text-xs text-muted-foreground">Critères validés</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold">{criteresTotal - checkedCritereIds.size}</p>
                <p className="text-xs text-muted-foreground">Non validés</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold text-destructive">{criteresObligatoires}</p>
                <p className="text-xs text-muted-foreground">Obligatoires</p>
              </div>
            </div>

            {pourcentage === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-800 font-medium">
                  Aucun critère n&apos;a encore été évalué
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Cliquez sur &quot;Modifier les critères&quot; pour commencer l&apos;évaluation
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Détail des critères d'accréditation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Détail des critères
              </CardTitle>
              <CardDescription>
                {criteresTotal} critères applicables pour un{" "}
                {etablissement.type === "ESS"
                  ? "Établissement de Soins de Santé"
                  : "Établissement Pharmaceutique de Vente en Gros"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">{checkedCritereIds.size}/{criteresTotal} validés</Badge>
              <Badge variant="destructive">
                {criteresObligatoires} obligatoires
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(criteresGrouped).length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">
                Chargement des critères...
              </span>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(criteresGrouped).map(([categorie, criteres]) => {
                const nbChecked = criteres.filter((c) => checkedCritereIds.has(c.id)).length;
                const nbObligatoires = criteres.filter((c) => c.obligatoire).length;
                const catPct = criteres.length > 0 ? (nbChecked / criteres.length) * 100 : 0;
                return (
                  <AccordionItem key={categorie} value={categorie}>
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                      <div className="flex items-center gap-3 flex-1 mr-4">
                        <span>{categorie}</span>
                        <Badge
                          variant={nbChecked === criteres.length ? "default" : "outline"}
                          className="font-normal"
                        >
                          {nbChecked}/{criteres.length}
                        </Badge>
                        {nbObligatoires > 0 && (
                          <Badge
                            variant="destructive"
                            className="font-normal text-[10px] px-1.5 py-0"
                          >
                            {nbObligatoires} oblig.
                          </Badge>
                        )}
                        <div className="flex-1 max-w-[120px] ml-auto">
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className={`h-full rounded-full ${
                                catPct === 100 ? "bg-green-500" :
                                catPct >= 50 ? "bg-yellow-500" :
                                catPct > 0 ? "bg-orange-500" :
                                "bg-muted"
                              }`}
                              style={{ width: `${catPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {criteres.map((critere) => {
                          const isChecked = checkedCritereIds.has(critere.id);
                          return (
                            <div
                              key={critere.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${
                                isChecked
                                  ? "bg-green-50 border-green-200"
                                  : critere.obligatoire
                                  ? "bg-red-50 border-red-200"
                                  : "bg-muted/30 border-border"
                              }`}
                            >
                              <div
                                className={`mt-0.5 shrink-0 rounded-full p-1 ${
                                  isChecked
                                    ? "bg-green-100 text-green-600"
                                    : critere.obligatoire
                                    ? "bg-red-100 text-red-600"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isChecked ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-medium ${
                                    isChecked ? "text-green-800" : ""
                                  }`}>
                                    {critere.libelle}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 font-mono"
                                  >
                                    {critere.code}
                                  </Badge>
                                  {critere.obligatoire && (
                                    <Badge
                                      variant="destructive"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      Obligatoire
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    Pond. {critere.ponderation}
                                  </Badge>
                                  {isChecked && (
                                    <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200" variant="outline">
                                      Validé
                                    </Badge>
                                  )}
                                </div>
                                {critere.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {critere.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Métadonnées */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Créé le{" "}
                {new Date(etablissement.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Modifié le{" "}
                {new Date(etablissement.updatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <span className="font-mono">{etablissement.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
