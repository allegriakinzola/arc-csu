"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Province,
  ZoneSante,
  AireSante,
  TypeEtablissement,
  SousTypeESS,
  SousTypeEPVG,
  SOUS_TYPES_ESS,
  SOUS_TYPES_EPVG,
} from "@/lib/types";

interface EtablissementFormProps {
  descenteId?: string;
  onSuccess?: (etablissement: any) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function EtablissementForm({
  descenteId,
  onSuccess,
  onCancel,
  showCancel = true,
}: EtablissementFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [zonesSante, setZonesSante] = useState<ZoneSante[]>([]);
  const [airesSante, setAiresSante] = useState<AireSante[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedZoneSante, setSelectedZoneSante] = useState("");

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
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetch("/api/provinces")
      .then((res) => res.json())
      .then(setProvinces)
      .catch(() => setError("Erreur lors du chargement des provinces"));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`/api/zones-sante?provinceId=${selectedProvince}`)
        .then((res) => res.json())
        .then(setZonesSante)
        .catch(() => setError("Erreur lors du chargement des zones de santé"));
    } else {
      setZonesSante([]);
      setAiresSante([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedZoneSante) {
      fetch(`/api/aires-sante?zoneSanteId=${selectedZoneSante}`)
        .then((res) => res.json())
        .then(setAiresSante)
        .catch(() => setError("Erreur lors du chargement des aires de santé"));
    } else {
      setAiresSante([]);
    }
  }, [selectedZoneSante]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        sousTypeESS: formData.sousTypeESS || undefined,
        sousTypeEPVG: formData.sousTypeEPVG || undefined,
        nombreLits: formData.nombreLits ? parseInt(formData.nombreLits) : undefined,
        nombrePersonnel: formData.nombrePersonnel ? parseInt(formData.nombrePersonnel) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        descenteId: descenteId || undefined,
      };

      const response = await fetch("/api/etablissements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création");
        return;
      }

      if (onSuccess) {
        onSuccess(data);
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raisonSociale">Raison sociale *</Label>
              <Input
                id="raisonSociale"
                value={formData.raisonSociale}
                onChange={(e) => handleChange("raisonSociale", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sigle">Sigle</Label>
              <Input
                id="sigle"
                value={formData.sigle}
                onChange={(e) => handleChange("sigle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="ESS">Établissement de Soins de Santé (ESS)</option>
                <option value="EPVG">Établissement Pharmaceutique de Vente en Gros (EPVG)</option>
              </select>
            </div>
          </div>

          {formData.type === "ESS" && (
            <div className="space-y-2">
              <Label htmlFor="sousTypeESS">Sous-type ESS</Label>
              <select
                id="sousTypeESS"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.sousTypeESS}
                onChange={(e) => handleChange("sousTypeESS", e.target.value)}
              >
                <option value="">Sélectionner un sous-type</option>
                {Object.entries(SOUS_TYPES_ESS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.type === "EPVG" && (
            <div className="space-y-2">
              <Label htmlFor="sousTypeEPVG">Sous-type EPVG</Label>
              <select
                id="sousTypeEPVG"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.sousTypeEPVG}
                onChange={(e) => handleChange("sousTypeEPVG", e.target.value)}
              >
                <option value="">Sélectionner un sous-type</option>
                {Object.entries(SOUS_TYPES_EPVG).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Localisation */}
      <Card>
        <CardHeader>
          <CardTitle>Localisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <select
                id="province"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                required
              >
                <option value="">Sélectionner une province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoneSante">Zone de santé *</Label>
              <select
                id="zoneSante"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedZoneSante}
                onChange={(e) => setSelectedZoneSante(e.target.value)}
                required
                disabled={!selectedProvince}
              >
                <option value="">Sélectionner une zone</option>
                {zonesSante.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aireSante">Aire de santé *</Label>
              <select
                id="aireSante"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.aireSanteId}
                onChange={(e) => handleChange("aireSanteId", e.target.value)}
                required
                disabled={!selectedZoneSante}
              >
                <option value="">Sélectionner une aire</option>
                {airesSante.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleChange("adresse", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quartier">Quartier</Label>
              <Input
                id="quartier"
                value={formData.quartier}
                onChange={(e) => handleChange("quartier", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
                placeholder="-4.3276"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
                placeholder="15.3136"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => handleChange("telephone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsable */}
      <Card>
        <CardHeader>
          <CardTitle>Responsable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomResponsable">Nom du responsable</Label>
              <Input
                id="nomResponsable"
                value={formData.nomResponsable}
                onChange={(e) => handleChange("nomResponsable", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fonctionResponsable">Fonction</Label>
              <Input
                id="fonctionResponsable"
                value={formData.fonctionResponsable}
                onChange={(e) => handleChange("fonctionResponsable", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacité (pour ESS) */}
      {formData.type === "ESS" && (
        <Card>
          <CardHeader>
            <CardTitle>Capacité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombreLits">Nombre de lits</Label>
                <Input
                  id="nombreLits"
                  type="number"
                  value={formData.nombreLits}
                  onChange={(e) => handleChange("nombreLits", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombrePersonnel">Nombre de personnel</Label>
                <Input
                  id="nombrePersonnel"
                  type="number"
                  value={formData.nombrePersonnel}
                  onChange={(e) => handleChange("nombrePersonnel", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {showCancel && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            "Créer l'établissement"
          )}
        </Button>
      </div>
    </form>
  );
}
