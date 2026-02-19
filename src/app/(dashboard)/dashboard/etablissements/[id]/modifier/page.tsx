"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Loader2, Hospital, Pill, MapPin } from "lucide-react";
import {
  Province,
  ZoneSante,
  AireSante,
  TypeEtablissement,
  SousTypeESS,
  SousTypeEPVG,
  Etablissement,
  CritereEvaluation,
  CriteresResponse,
  SOUS_TYPES_ESS,
  SOUS_TYPES_EPVG,
} from "@/lib/types";
import MapContainer from "@/components/map/MapContainer";

export default function ModifierEtablissementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // Données géographiques
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [zonesSante, setZonesSante] = useState<ZoneSante[]>([]);
  const [airesSante, setAiresSante] = useState<AireSante[]>([]);

  // Sélections
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedZoneSante, setSelectedZoneSante] = useState("");

  // Coordonnées GPS sélectionnées sur la carte
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // Flag pour empêcher les cascading resets pendant le chargement initial
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Critères d'accréditation
  const [criteresGrouped, setCriteresGrouped] = useState<Record<string, CritereEvaluation[]>>({});
  const [criteresTotal, setCriteresTotal] = useState(0);
  const [criteresObligatoires, setCriteresObligatoires] = useState(0);
  const [checkedCriteres, setCheckedCriteres] = useState<Set<string>>(new Set());
  const [loadingCriteres, setLoadingCriteres] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    code: "",
    raisonSociale: "",
    sigle: "",
    type: "" as TypeEtablissement | "",
    sousTypeESS: "" as SousTypeESS | "",
    sousTypeEPVG: "" as SousTypeEPVG | "",
    aireSanteId: "",
    adresse: "",
    quartier: "",
    avenue: "",
    numero: "",
    coordonneesGPS: "",
    latitude: "",
    longitude: "",
    telephone: "",
    telephoneSecondaire: "",
    email: "",
    siteWeb: "",
    nomResponsable: "",
    fonctionResponsable: "",
    telephoneResponsable: "",
    emailResponsable: "",
    numeroRCCM: "",
    numeroIdNat: "",
    numeroImpot: "",
    dateCreation: "",
    dateOuverture: "",
    nombreLits: "",
    nombrePersonnel: "",
  });

  // Charger l'établissement existant et les provinces
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les provinces ET l'établissement en parallèle
        const [provincesRes, etablissementRes] = await Promise.all([
          fetch("/api/provinces"),
          fetch(`/api/etablissements/${id}`),
        ]);

        const provincesData = await provincesRes.json();
        setProvinces(provincesData);

        if (!etablissementRes.ok) {
          setError("Établissement non trouvé");
          setLoadingData(false);
          return;
        }

        const etab: Etablissement & {
          aireSante?: AireSante & {
            zoneSante?: ZoneSante & { province?: Province };
          };
        } = await etablissementRes.json();

        // Pré-remplir le formulaire
        const formatDate = (d?: string | null) => {
          if (!d) return "";
          return new Date(d).toISOString().split("T")[0];
        };

        setFormData({
          code: etab.code || "",
          raisonSociale: etab.raisonSociale || "",
          sigle: etab.sigle || "",
          type: etab.type || "",
          sousTypeESS: (etab.sousTypeESS as SousTypeESS) || "",
          sousTypeEPVG: (etab.sousTypeEPVG as SousTypeEPVG) || "",
          aireSanteId: etab.aireSanteId || "",
          adresse: etab.adresse || "",
          quartier: etab.quartier || "",
          avenue: etab.avenue || "",
          numero: etab.numero || "",
          coordonneesGPS: etab.coordonneesGPS || "",
          latitude: etab.latitude?.toString() || "",
          longitude: etab.longitude?.toString() || "",
          telephone: etab.telephone || "",
          telephoneSecondaire: etab.telephoneSecondaire || "",
          email: etab.email || "",
          siteWeb: etab.siteWeb || "",
          nomResponsable: etab.nomResponsable || "",
          fonctionResponsable: etab.fonctionResponsable || "",
          telephoneResponsable: etab.telephoneResponsable || "",
          emailResponsable: etab.emailResponsable || "",
          numeroRCCM: etab.numeroRCCM || "",
          numeroIdNat: etab.numeroIdNat || "",
          numeroImpot: etab.numeroImpot || "",
          dateCreation: formatDate(etab.dateCreation),
          dateOuverture: formatDate(etab.dateOuverture),
          nombreLits: etab.nombreLits?.toString() || "",
          nombrePersonnel: etab.nombrePersonnel?.toString() || "",
        });

        // Pré-remplir les coordonnées sur la carte
        if (etab.latitude && etab.longitude) {
          setSelectedPosition([etab.latitude, etab.longitude]);
        }

        // Pré-remplir la hiérarchie géographique
        const provinceId = etab.aireSante?.zoneSante?.province?.id;
        const zoneSanteId = etab.aireSante?.zoneSante?.id;

        if (provinceId) {
          setSelectedProvince(provinceId);

          // Charger les zones de santé de cette province
          const zonesRes = await fetch(
            `/api/zones-sante?provinceId=${provinceId}`
          );
          const zonesData = await zonesRes.json();
          setZonesSante(zonesData);

          if (zoneSanteId) {
            setSelectedZoneSante(zoneSanteId);

            // Charger les aires de santé de cette zone
            const airesRes = await fetch(
              `/api/aires-sante?zoneSanteId=${zoneSanteId}`
            );
            const airesData = await airesRes.json();
            setAiresSante(airesData);
          }
        }

        // Charger les critères déjà cochés pour cet établissement
        const criteresRes = await fetch(`/api/etablissements/${id}/criteres`);
        if (criteresRes.ok) {
          const criteresData = await criteresRes.json();
          if (criteresData.checkedCritereIds?.length > 0) {
            setCheckedCriteres(new Set(criteresData.checkedCritereIds));
          }
        }

        setInitialLoaded(true);
      } catch {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id]);

  // Charger les zones de santé quand une province est sélectionnée (sauf au chargement initial)
  useEffect(() => {
    if (!initialLoaded) return;
    if (selectedProvince) {
      fetch(`/api/zones-sante?provinceId=${selectedProvince}`)
        .then((res) => res.json())
        .then(setZonesSante)
        .catch(console.error);
      setSelectedZoneSante("");
      setAiresSante([]);
      setFormData((prev) => ({ ...prev, aireSanteId: "" }));
    } else {
      setZonesSante([]);
      setAiresSante([]);
    }
  }, [selectedProvince, initialLoaded]);

  // Charger les aires de santé quand une zone est sélectionnée (sauf au chargement initial)
  useEffect(() => {
    if (!initialLoaded) return;
    if (selectedZoneSante) {
      fetch(`/api/aires-sante?zoneSanteId=${selectedZoneSante}`)
        .then((res) => res.json())
        .then(setAiresSante)
        .catch(console.error);
      setFormData((prev) => ({ ...prev, aireSanteId: "" }));
    } else {
      setAiresSante([]);
    }
  }, [selectedZoneSante, initialLoaded]);

  // Charger les critères d'accréditation quand le type change
  useEffect(() => {
    if (formData.type) {
      setLoadingCriteres(true);
      fetch(`/api/criteres-evaluation?type=${formData.type}`)
        .then((res) => res.json())
        .then((data: CriteresResponse) => {
          setCriteresGrouped(data.grouped);
          setCriteresTotal(data.total);
          setCriteresObligatoires(data.totalObligatoires);
        })
        .catch(console.error)
        .finally(() => setLoadingCriteres(false));
    } else {
      setCriteresGrouped({});
      setCriteresTotal(0);
      setCriteresObligatoires(0);
      setCheckedCriteres(new Set());
    }
  }, [formData.type]);

  const toggleCritere = (critereId: string) => {
    setCheckedCriteres((prev) => {
      const next = new Set(prev);
      if (next.has(critereId)) {
        next.delete(critereId);
      } else {
        next.add(critereId);
      }
      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/etablissements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          raisonSociale: formData.raisonSociale,
          sigle: formData.sigle || null,
          type: formData.type,
          sousTypeESS: formData.type === "ESS" ? formData.sousTypeESS || null : null,
          sousTypeEPVG: formData.type === "EPVG" ? formData.sousTypeEPVG || null : null,
          aireSanteId: formData.aireSanteId,
          adresse: formData.adresse || null,
          quartier: formData.quartier || null,
          avenue: formData.avenue || null,
          numero: formData.numero || null,
          coordonneesGPS: formData.coordonneesGPS || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          telephone: formData.telephone || null,
          telephoneSecondaire: formData.telephoneSecondaire || null,
          email: formData.email || null,
          siteWeb: formData.siteWeb || null,
          nomResponsable: formData.nomResponsable || null,
          fonctionResponsable: formData.fonctionResponsable || null,
          telephoneResponsable: formData.telephoneResponsable || null,
          emailResponsable: formData.emailResponsable || null,
          numeroRCCM: formData.numeroRCCM || null,
          numeroIdNat: formData.numeroIdNat || null,
          numeroImpot: formData.numeroImpot || null,
          dateCreation: formData.dateCreation || null,
          dateOuverture: formData.dateOuverture || null,
          nombreLits: formData.nombreLits ? parseInt(formData.nombreLits) : null,
          nombrePersonnel: formData.nombrePersonnel
            ? parseInt(formData.nombrePersonnel)
            : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la modification");
      }

      // Sauvegarder les critères cochés
      await fetch(`/api/etablissements/${id}/criteres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkedCritereIds: Array.from(checkedCriteres),
        }),
      });

      router.push(`/dashboard/etablissements/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !formData.raisonSociale) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h3 className="text-lg font-medium">{error}</h3>
        <Link href="/dashboard/etablissements" className="mt-4">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/etablissements/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Modifier l&apos;établissement
          </h2>
          <p className="text-muted-foreground">
            {formData.raisonSociale}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 text-sm text-white bg-destructive rounded-md">
            {error}
          </div>
        )}

        {/* Type d'établissement */}
        <Card>
          <CardHeader>
            <CardTitle>Type d&apos;établissement</CardTitle>
            <CardDescription>
              Sélectionnez le type d&apos;établissement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.type === "ESS"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    type: "ESS",
                    sousTypeEPVG: "",
                  }))
                }
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Hospital className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">ESS</h3>
                    <p className="text-sm text-muted-foreground">
                      Établissement de Soins de Santé
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.type === "EPVG"
                    ? "border-secondary bg-secondary/5"
                    : "border-border hover:border-secondary/50"
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    type: "EPVG",
                    sousTypeESS: "",
                  }))
                }
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <Pill className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">EPVG</h3>
                    <p className="text-sm text-muted-foreground">
                      Établissement Pharmaceutique de Vente en Gros
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {formData.type && (
              <div className="mt-4">
                <Label htmlFor="sousType">Sous-type</Label>
                <select
                  id="sousType"
                  name={formData.type === "ESS" ? "sousTypeESS" : "sousTypeEPVG"}
                  value={
                    formData.type === "ESS"
                      ? formData.sousTypeESS
                      : formData.sousTypeEPVG
                  }
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="">Sélectionner un sous-type</option>
                  {formData.type === "ESS"
                    ? Object.entries(SOUS_TYPES_ESS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))
                    : Object.entries(SOUS_TYPES_EPVG).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Informations de base de l&apos;établissement
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ex: ESS-KIN-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raisonSociale">Raison sociale *</Label>
              <Input
                id="raisonSociale"
                name="raisonSociale"
                value={formData.raisonSociale}
                onChange={handleChange}
                placeholder="Nom complet de l'établissement"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sigle">Sigle</Label>
              <Input
                id="sigle"
                name="sigle"
                value={formData.sigle}
                onChange={handleChange}
                placeholder="Ex: HGK"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+243 XXX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@etablissement.cd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteWeb">Site web</Label>
              <Input
                id="siteWeb"
                name="siteWeb"
                value={formData.siteWeb}
                onChange={handleChange}
                placeholder="https://www.etablissement.cd"
              />
            </div>
          </CardContent>
        </Card>

        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
            <CardDescription>
              Catégorisation sectorielle et adresse de l&apos;établissement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <select
                  id="province"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="">Sélectionner une province</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneSante">Zone de Santé *</Label>
                <select
                  id="zoneSante"
                  value={selectedZoneSante}
                  onChange={(e) => setSelectedZoneSante(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                  disabled={!selectedProvince}
                >
                  <option value="">Sélectionner une zone</option>
                  {zonesSante.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aireSanteId">Aire de Santé *</Label>
                <select
                  id="aireSanteId"
                  name="aireSanteId"
                  value={formData.aireSanteId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                  disabled={!selectedZoneSante}
                >
                  <option value="">Sélectionner une aire</option>
                  {airesSante.map((aire) => (
                    <option key={aire.id} value={aire.id}>
                      {aire.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quartier">Quartier</Label>
                <Input
                  id="quartier"
                  name="quartier"
                  value={formData.quartier}
                  onChange={handleChange}
                  placeholder="Nom du quartier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avenue">Avenue</Label>
                <Input
                  id="avenue"
                  name="avenue"
                  value={formData.avenue}
                  onChange={handleChange}
                  placeholder="Nom de l'avenue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="N°"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordonneesGPS">Coordonnées GPS (texte)</Label>
                <Input
                  id="coordonneesGPS"
                  name="coordonneesGPS"
                  value={formData.coordonneesGPS}
                  onChange={handleChange}
                  placeholder="-4.3217, 15.3125"
                />
              </div>
            </div>

            {/* Carte pour sélectionner les coordonnées */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Sélectionner la position sur la carte
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Cliquez sur la carte pour modifier les coordonnées GPS
              </p>
              <MapContainer
                center={
                  selectedPosition
                    ? [selectedPosition[0], selectedPosition[1]]
                    : [-4.4419, 15.2663]
                }
                zoom={selectedPosition ? 14 : 12}
                height="350px"
                selectedPosition={selectedPosition}
                onMapClick={(lat, lng) => {
                  setSelectedPosition([lat, lng]);
                  setFormData((prev) => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                    coordonneesGPS: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                  }));
                }}
              />
              {selectedPosition && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700 font-medium">
                    Position sélectionnée :
                  </p>
                  <p className="text-sm text-green-600">
                    Latitude: {selectedPosition[0].toFixed(6)} | Longitude:{" "}
                    {selectedPosition[1].toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responsable */}
        <Card>
          <CardHeader>
            <CardTitle>Responsable</CardTitle>
            <CardDescription>
              Informations sur le responsable de l&apos;établissement
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomResponsable">Nom complet</Label>
              <Input
                id="nomResponsable"
                name="nomResponsable"
                value={formData.nomResponsable}
                onChange={handleChange}
                placeholder="Nom du responsable"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fonctionResponsable">Fonction</Label>
              <Input
                id="fonctionResponsable"
                name="fonctionResponsable"
                value={formData.fonctionResponsable}
                onChange={handleChange}
                placeholder="Ex: Directeur Général"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephoneResponsable">Téléphone</Label>
              <Input
                id="telephoneResponsable"
                name="telephoneResponsable"
                value={formData.telephoneResponsable}
                onChange={handleChange}
                placeholder="+243 XXX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailResponsable">Email</Label>
              <Input
                id="emailResponsable"
                name="emailResponsable"
                type="email"
                value={formData.emailResponsable}
                onChange={handleChange}
                placeholder="responsable@etablissement.cd"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations légales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations légales</CardTitle>
            <CardDescription>
              Documents et informations administratives
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroRCCM">Numéro RCCM</Label>
              <Input
                id="numeroRCCM"
                name="numeroRCCM"
                value={formData.numeroRCCM}
                onChange={handleChange}
                placeholder="Registre de Commerce"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroIdNat">Numéro Id. Nat.</Label>
              <Input
                id="numeroIdNat"
                name="numeroIdNat"
                value={formData.numeroIdNat}
                onChange={handleChange}
                placeholder="Identification Nationale"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroImpot">Numéro Impôt</Label>
              <Input
                id="numeroImpot"
                name="numeroImpot"
                value={formData.numeroImpot}
                onChange={handleChange}
                placeholder="Numéro fiscal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateCreation">Date de création</Label>
              <Input
                id="dateCreation"
                name="dateCreation"
                type="date"
                value={formData.dateCreation}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOuverture">Date d&apos;ouverture</Label>
              <Input
                id="dateOuverture"
                name="dateOuverture"
                type="date"
                value={formData.dateOuverture}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Capacité (pour ESS) */}
        {formData.type === "ESS" && (
          <Card>
            <CardHeader>
              <CardTitle>Capacité</CardTitle>
              <CardDescription>
                Informations sur la capacité de l&apos;établissement
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombreLits">Nombre de lits</Label>
                <Input
                  id="nombreLits"
                  name="nombreLits"
                  type="number"
                  value={formData.nombreLits}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombrePersonnel">Nombre de personnel</Label>
                <Input
                  id="nombrePersonnel"
                  name="nombrePersonnel"
                  type="number"
                  value={formData.nombrePersonnel}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critères d'accréditation */}
        {formData.type && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Critères d&apos;accréditation</CardTitle>
                  <CardDescription>
                    Critères requis pour l&apos;accréditation{" "}
                    {formData.type === "ESS"
                      ? "d'un Établissement de Soins de Santé"
                      : "d'un Établissement Pharmaceutique de Vente en Gros"}
                  </CardDescription>
                </div>
                {criteresTotal > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="default">
                      {checkedCriteres.size}/{criteresTotal} cochés
                    </Badge>
                    <Badge variant="destructive">
                      {criteresObligatoires} obligatoires
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingCriteres ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Chargement des critères...
                  </span>
                </div>
              ) : Object.keys(criteresGrouped).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucun critère trouvé.
                </p>
              ) : (
                <Accordion
                  type="multiple"
                  defaultValue={Object.keys(criteresGrouped)}
                  className="w-full"
                >
                  {Object.entries(criteresGrouped).map(
                    ([categorie, criteres]) => (
                      <AccordionItem key={categorie} value={categorie}>
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                          <div className="flex items-center gap-3">
                            <span>{categorie}</span>
                            <Badge variant="outline" className="font-normal">
                              {
                                criteres.filter((c) =>
                                  checkedCriteres.has(c.id)
                                ).length
                              }
                              /{criteres.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {criteres.map((critere) => (
                              <div
                                key={critere.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                  checkedCriteres.has(critere.id)
                                    ? "bg-primary/5 border-primary/20"
                                    : "bg-muted/30 border-border"
                                }`}
                              >
                                <Checkbox
                                  id={`edit-${critere.id}`}
                                  checked={checkedCriteres.has(critere.id)}
                                  onCheckedChange={() =>
                                    toggleCritere(critere.id)
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <label
                                      htmlFor={`edit-${critere.id}`}
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      {critere.libelle}
                                    </label>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0"
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
                                  </div>
                                  {critere.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {critere.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )}
                </Accordion>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/dashboard/etablissements/${id}`}>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading || !formData.type}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
