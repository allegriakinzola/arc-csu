"use client";

import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Filter,
  Hospital,
  Pill,
  MapPin,
  Building2,
  Search,
  Eye,
  ExternalLink,
} from "lucide-react";
import MapContainer, { MapMarker } from "@/components/map/MapContainer";
import {
  Etablissement,
  Province,
  SOUS_TYPES_ESS,
  SOUS_TYPES_EPVG,
  STATUTS_ETABLISSEMENT,
  STATUTS_ACCREDITATION,
} from "@/lib/types";

export default function CartePage() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [provinceFilter, setProvinceFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEtablissement, setSelectedEtablissement] =
    useState<Etablissement | null>(null);

  // Charger les provinces
  useEffect(() => {
    fetch("/api/provinces")
      .then((res) => res.json())
      .then(setProvinces)
      .catch(console.error);
  }, []);

  const fetchEtablissements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "1000");
      if (typeFilter) params.set("type", typeFilter);
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/etablissements?${params}`);
      const data = await response.json();
      setEtablissements(data.data || []);
    } catch (error) {
      console.error("Error fetching etablissements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtablissements();
  }, [typeFilter]);

  // Filtrer par province côté client
  const filteredEtablissements = etablissements.filter((e) => {
    if (provinceFilter) {
      return e.aireSante?.zoneSante?.province?.id === provinceFilter;
    }
    return true;
  });

  // Convertir en markers
  const markers: MapMarker[] = filteredEtablissements
    .filter((e) => e.latitude && e.longitude)
    .map((e) => ({
      id: e.id,
      latitude: e.latitude!,
      longitude: e.longitude!,
      title: e.raisonSociale,
      description: `${e.aireSante?.zoneSante?.name || ""} - ${
        e.aireSante?.zoneSante?.province?.name || ""
      }`,
      type: e.type,
    }));

  const handleMarkerClick = (marker: MapMarker) => {
    const etab = etablissements.find((e) => e.id === marker.id);
    if (etab) {
      setSelectedEtablissement(etab);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEtablissements();
  };

  // Stats
  const totalEtablissements = filteredEtablissements.length;
  const etablissementsAvecCoords = filteredEtablissements.filter(
    (e) => e.latitude && e.longitude
  ).length;
  const etablissementsSansCoords = totalEtablissements - etablissementsAvecCoords;
  const totalESS = filteredEtablissements.filter((e) => e.type === "ESS").length;
  const totalEPVG = filteredEtablissements.filter((e) => e.type === "EPVG").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Carte des établissements
          </h2>
          <p className="text-muted-foreground">
            Visualisez la répartition géographique des établissements de santé
            et pharmaceutiques
          </p>
        </div>
        <Link href="/dashboard/etablissements">
          <Button variant="outline">
            <Building2 className="mr-2 h-4 w-4" />
            Liste des établissements
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un établissement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Rechercher
              </Button>
            </form>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {typeFilter || "Tous les types"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTypeFilter("")}>
                    Tous les types
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("ESS")}>
                    <Hospital className="mr-2 h-4 w-4 text-blue-600" />
                    ESS - Soins de Santé
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("EPVG")}>
                    <Pill className="mr-2 h-4 w-4 text-red-600" />
                    EPVG - Pharmaceutique
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    {provinceFilter
                      ? provinces.find((p) => p.id === provinceFilter)?.name
                      : "Toutes les provinces"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem onClick={() => setProvinceFilter("")}>
                    Toutes les provinces
                  </DropdownMenuItem>
                  {provinces.map((province) => (
                    <DropdownMenuItem
                      key={province.id}
                      onClick={() => setProvinceFilter(province.id)}
                    >
                      {province.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEtablissements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ESS</CardTitle>
            <Hospital className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalESS}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPVG</CardTitle>
            <Pill className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalEPVG}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartographiés</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {etablissementsAvecCoords}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non localisés</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {etablissementsSansCoords}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carte et détails */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Carte */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Carte interactive</CardTitle>
                <CardDescription>
                  {markers.length} établissement(s) affiché(s) sur la carte
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span>ESS</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span>EPVG</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[550px] flex items-center justify-center bg-muted rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <MapContainer
                markers={markers}
                center={[-4.4419, 15.2663]}
                zoom={6}
                height="550px"
                onMarkerClick={handleMarkerClick}
              />
            )}
          </CardContent>
        </Card>

        {/* Panneau de détails */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de l&apos;établissement</CardTitle>
            <CardDescription>
              {selectedEtablissement
                ? "Informations sur l'établissement sélectionné"
                : "Cliquez sur un marqueur pour voir les détails"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEtablissement ? (
              <div className="space-y-4">
                {/* En-tête */}
                <div className="flex items-start gap-3">
                  <div
                    className={`p-3 rounded-lg ${
                      selectedEtablissement.type === "ESS"
                        ? "bg-blue-100"
                        : "bg-red-100"
                    }`}
                  >
                    {selectedEtablissement.type === "ESS" ? (
                      <Hospital className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Pill className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg leading-tight">
                      {selectedEtablissement.raisonSociale}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEtablissement.numeroIdentifiantRSSP ||
                        selectedEtablissement.code}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedEtablissement.type === "ESS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedEtablissement.type}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedEtablissement.statut === "ACTIF"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUTS_ETABLISSEMENT[selectedEtablissement.statut]}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedEtablissement.statutAccreditation === "ACCREDITE"
                        ? "bg-green-100 text-green-700"
                        : selectedEtablissement.statutAccreditation === "EN_COURS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUTS_ACCREDITATION[selectedEtablissement.statutAccreditation]}
                  </span>
                </div>

                {/* Informations */}
                <div className="space-y-3 text-sm border-t pt-4">
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Sous-type:
                    </span>
                    <p>
                      {selectedEtablissement.type === "ESS" &&
                      selectedEtablissement.sousTypeESS
                        ? SOUS_TYPES_ESS[selectedEtablissement.sousTypeESS]
                        : selectedEtablissement.type === "EPVG" &&
                          selectedEtablissement.sousTypeEPVG
                        ? SOUS_TYPES_EPVG[selectedEtablissement.sousTypeEPVG]
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-muted-foreground">
                      Localisation:
                    </span>
                    <p>
                      {selectedEtablissement.aireSante?.zoneSante?.province?.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedEtablissement.aireSante?.zoneSante?.name} →{" "}
                      {selectedEtablissement.aireSante?.name}
                    </p>
                  </div>

                  {selectedEtablissement.adresse && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Adresse:
                      </span>
                      <p>
                        {[
                          selectedEtablissement.numero,
                          selectedEtablissement.avenue,
                          selectedEtablissement.quartier,
                        ]
                          .filter(Boolean)
                          .join(", ") || selectedEtablissement.adresse}
                      </p>
                    </div>
                  )}

                  {selectedEtablissement.telephone && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Téléphone:
                      </span>
                      <p>{selectedEtablissement.telephone}</p>
                    </div>
                  )}

                  {selectedEtablissement.email && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Email:
                      </span>
                      <p>{selectedEtablissement.email}</p>
                    </div>
                  )}

                  {selectedEtablissement.latitude &&
                    selectedEtablissement.longitude && (
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Coordonnées GPS:
                        </span>
                        <p className="font-mono text-xs">
                          {selectedEtablissement.latitude.toFixed(6)},{" "}
                          {selectedEtablissement.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-2 border-t">
                  <Link
                    href={`/dashboard/etablissements/${selectedEtablissement.id}`}
                  >
                    <Button className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir les détails complets
                    </Button>
                  </Link>
                  {selectedEtablissement.latitude &&
                    selectedEtablissement.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${selectedEtablissement.latitude},${selectedEtablissement.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ouvrir dans Google Maps
                        </Button>
                      </a>
                    )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center text-muted-foreground">
                <MapPin className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun établissement sélectionné</p>
                <p className="text-sm mt-1">
                  Cliquez sur un marqueur de la carte pour afficher ses
                  informations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
