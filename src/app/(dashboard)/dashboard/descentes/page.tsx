"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Copy, ExternalLink, Calendar, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Descente, STATUTS_DESCENTE } from "@/lib/types";

function DescenteCard({ 
  descente, 
  onCopy 
}: { 
  descente: Descente & { _count?: { etablissements: number } }; 
  onCopy: (text: string) => void;
}) {
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/descente/${descente.code}`);
  }, [descente.code]);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "ACTIVE":
        return { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
      case "EXPIREE":
        return { color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock };
      case "ANNULEE":
        return { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle };
      default:
        return { color: "bg-gray-100 text-gray-500 border-gray-200", icon: Clock };
    }
  };

  const statutBadge = getStatutBadge(descente.statut);
  const StatutIcon = statutBadge.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle>{descente.nom}</CardTitle>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${statutBadge.color}`}
              >
                <StatutIcon className="h-3 w-3" />
                {STATUTS_DESCENTE[descente.statut]}
              </span>
            </div>
            {descente.description && (
              <p className="text-sm text-muted-foreground">{descente.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Code:</span>
              <code className="px-2 py-1 bg-gray-100 rounded text-primary font-mono">
                {descente.code}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onCopy(descente.code)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Du {new Date(descente.dateDebut).toLocaleDateString("fr-FR")} au{" "}
                {new Date(descente.dateFin).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {descente._count?.etablissements || 0} établissement(s) créé(s)
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(publicUrl, "_blank");
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir le lien public
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCopy(publicUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground break-all">
              {publicUrl}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DescentesPage() {
  const [descentes, setDescentes] = useState<Descente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDescentes();
  }, []);

  const fetchDescentes = async () => {
    try {
      const response = await fetch("/api/descentes");
      const data = await response.json();
      setDescentes(data);
    } catch {
      setError("Erreur lors du chargement des descentes");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Descentes</h2>
          <p className="text-muted-foreground">
            Gérez les campagnes de collecte de données sur le terrain
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle descente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle descente</DialogTitle>
              <DialogDescription>
                Créez une campagne de collecte de données avec un code et un mot de passe
              </DialogDescription>
            </DialogHeader>
            <CreateDescenteForm
              onSuccess={() => {
                setShowCreateDialog(false);
                fetchDescentes();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {descentes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucune descente</p>
              <p className="text-sm text-muted-foreground">
                Créez votre première campagne de collecte de données
              </p>
            </CardContent>
          </Card>
        ) : (
          descentes.map((descente) => (
            <DescenteCard
              key={descente.id}
              descente={descente}
              onCopy={copyToClipboard}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CreateDescenteForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    nom: "",
    description: "",
    motDePasse: "",
    dateDebut: "",
    dateFin: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/descentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création");
        return;
      }

      onSuccess();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="DESC-2026-01"
            required
          />
          <p className="text-xs text-muted-foreground">
            Code unique pour identifier la descente
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Collecte Kinshasa Q1 2026"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description de la campagne de collecte..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motDePasse">Mot de passe *</Label>
        <Input
          id="motDePasse"
          type="password"
          value={formData.motDePasse}
          onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
          placeholder="Mot de passe sécurisé"
          required
        />
        <p className="text-xs text-muted-foreground">
          Les agents devront entrer ce mot de passe pour accéder au formulaire
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateDebut">Date de début *</Label>
          <Input
            id="dateDebut"
            type="date"
            value={formData.dateDebut}
            onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateFin">Date de fin *</Label>
          <Input
            id="dateFin"
            type="date"
            value={formData.dateFin}
            onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            "Créer la descente"
          )}
        </Button>
      </div>
    </form>
  );
}
