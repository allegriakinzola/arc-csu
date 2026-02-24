"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Eye, Building2, MapPin } from "lucide-react";
import { Etablissement, SOUS_TYPES_ESS, SOUS_TYPES_EPVG } from "@/lib/types";

export default function EtablissementsEnAttentePage() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchEtablissements();
  }, []);

  const fetchEtablissements = async () => {
    try {
      const response = await fetch("/api/etablissements?statut=EN_ATTENTE");
      const data = await response.json();
      setEtablissements(data.data || []);
    } catch {
      setError("Erreur lors du chargement des établissements");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Voulez-vous approuver cet établissement ?")) return;

    setActionLoading(id);
    try {
      const response = await fetch(`/api/etablissements/${id}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'approbation");
        return;
      }

      fetchEtablissements();
    } catch {
      alert("Erreur de connexion au serveur");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Voulez-vous rejeter cet établissement ?")) return;

    setActionLoading(id);
    try {
      const response = await fetch(`/api/etablissements/${id}/reject`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erreur lors du rejet");
        return;
      }

      fetchEtablissements();
    } catch {
      alert("Erreur de connexion au serveur");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Établissements en attente</h2>
        <p className="text-muted-foreground">
          Examinez et approuvez les établissements créés via les descentes
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {etablissements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucun établissement en attente</p>
              <p className="text-sm text-muted-foreground">
                Tous les établissements ont été traités
              </p>
            </CardContent>
          </Card>
        ) : (
          etablissements.map((etablissement) => {
            const sousType =
              etablissement.type === "ESS" && etablissement.sousTypeESS
                ? SOUS_TYPES_ESS[etablissement.sousTypeESS]
                : etablissement.type === "EPVG" && etablissement.sousTypeEPVG
                ? SOUS_TYPES_EPVG[etablissement.sousTypeEPVG]
                : null;

            return (
              <Card key={etablissement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          etablissement.type === "ESS"
                            ? "bg-primary/10"
                            : "bg-secondary/50"
                        }`}
                      >
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="mb-2">{etablissement.raisonSociale}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{etablissement.code}</Badge>
                          <Badge>
                            {etablissement.type === "ESS"
                              ? "Établissement de Soins de Santé"
                              : "Établissement Pharmaceutique de Vente en Gros"}
                          </Badge>
                          {sousType && <Badge variant="secondary">{sousType}</Badge>}
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                            En attente
                          </Badge>
                        </div>
                        {etablissement.aireSante && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {etablissement.aireSante.name},{" "}
                              {etablissement.aireSante.zoneSante?.name},{" "}
                              {etablissement.aireSante.zoneSante?.province?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/etablissements/${etablissement.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                      </Link>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(etablissement.id)}
                        disabled={actionLoading === etablissement.id}
                      >
                        {actionLoading === etablissement.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Approuver
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(etablissement.id)}
                        disabled={actionLoading === etablissement.id}
                      >
                        {actionLoading === etablissement.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {etablissement.adresse && (
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <strong>Adresse:</strong> {etablissement.adresse}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
