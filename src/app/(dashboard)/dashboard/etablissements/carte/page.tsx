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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Filter, Hospital, Pill, MapPin, List } from "lucide-react";
import MapContainer, { MapMarker } from "@/components/map/MapContainer";
import { Etablissement, SOUS_TYPES_ESS, SOUS_TYPES_EPVG } from "@/lib/types";

export default function CarteEtablissementsPage() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedEtablissement, setSelectedEtablissement] = useState<Etablissement | null>(null);

  const fetchEtablissements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "1000"); // Récupérer tous pour la carte
      if (typeFilter) params.set("type", typeFilter);

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

  // Convertir les établissements en markers pour la carte
  const markers: MapMarker[] = etablissements
    .filter((e) => e.latitude && e.longitude)
    .map((e) => ({
      id: e.id,
      latitude: e.latitude!,
      longitude: e.longitude!,
      title: e.raisonSociale,
      description: e.aireSante?.zoneSante?.province?.name || "",
      type: e.type,
    }));

  const handleMarkerClick = (marker: MapMarker) => {
    const etab = etablissements.find((e) => e.id === marker.id);
    if (etab) {
      setSelectedEtablissement(etab);
    }
  };

  const etablissementsAvecCoords = etablissements.filter(
    (e) => e.latitude && e.longitude
  ).length;
  const etablissementsSansCoords = etablissements.filter(
    (e) => !e.latitude || !e.longitude
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/etablissements">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Carte des établissements
            </h2>
            <p className="text-muted-foreground">
              Visualisez la répartition géographique des établissements
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/etablissements">
            <Button variant="outline">
              <List className="mr-2 h-4 w-4" />
              Vue liste
            </Button>
          </Link>
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{etablissements.length}</div>
            <p className="text-xs text-muted-foreground">établissements</p>
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
            <p className="text-xs text-muted-foreground">avec coordonnées GPS</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non cartographiés</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {etablissementsSansCoords}
            </div>
            <p className="text-xs text-muted-foreground">sans coordonnées GPS</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Légende</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span>ESS</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>EPVG</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Carte */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Carte interactive</CardTitle>
            <CardDescription>
              Cliquez sur un marqueur pour voir les détails
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[500px] flex items-center justify-center bg-muted rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <MapContainer
                markers={markers}
                center={[-4.4419, 15.2663]}
                zoom={11}
                height="500px"
                onMarkerClick={handleMarkerClick}
              />
            )}
          </CardContent>
        </Card>

        {/* Détails de l'établissement sélectionné */}
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
            <CardDescription>
              {selectedEtablissement
                ? "Établissement sélectionné"
                : "Sélectionnez un établissement sur la carte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEtablissement ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
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
                  <div>
                    <h3 className="font-semibold">
                      {selectedEtablissement.raisonSociale}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEtablissement.code}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        selectedEtablissement.type === "ESS"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedEtablissement.type}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Sous-type:</span>{" "}
                    {selectedEtablissement.type === "ESS" &&
                    selectedEtablissement.sousTypeESS
                      ? SOUS_TYPES_ESS[selectedEtablissement.sousTypeESS]
                      : selectedEtablissement.type === "EPVG" &&
                        selectedEtablissement.sousTypeEPVG
                      ? SOUS_TYPES_EPVG[selectedEtablissement.sousTypeEPVG]
                      : "-"}
                  </div>
                  <div>
                    <span className="font-medium">Province:</span>{" "}
                    {selectedEtablissement.aireSante?.zoneSante?.province?.name ||
                      "-"}
                  </div>
                  <div>
                    <span className="font-medium">Zone de Santé:</span>{" "}
                    {selectedEtablissement.aireSante?.zoneSante?.name || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Aire de Santé:</span>{" "}
                    {selectedEtablissement.aireSante?.name || "-"}
                  </div>
                  {selectedEtablissement.adresse && (
                    <div>
                      <span className="font-medium">Adresse:</span>{" "}
                      {selectedEtablissement.adresse}
                    </div>
                  )}
                  {selectedEtablissement.telephone && (
                    <div>
                      <span className="font-medium">Téléphone:</span>{" "}
                      {selectedEtablissement.telephone}
                    </div>
                  )}
                  {selectedEtablissement.latitude &&
                    selectedEtablissement.longitude && (
                      <div>
                        <span className="font-medium">Coordonnées:</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          {selectedEtablissement.latitude.toFixed(6)},{" "}
                          {selectedEtablissement.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                </div>

                <div className="pt-4 space-y-2">
                  <Link
                    href={`/dashboard/etablissements/${selectedEtablissement.id}`}
                  >
                    <Button className="w-full">Voir les détails complets</Button>
                  </Link>
                  <Link
                    href={`/dashboard/etablissements/${selectedEtablissement.id}/modifier`}
                  >
                    <Button variant="outline" className="w-full">
                      Modifier
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mb-4" />
                <p>Cliquez sur un marqueur de la carte pour afficher les détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
