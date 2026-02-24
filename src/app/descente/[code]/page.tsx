"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { Descente } from "@/lib/types";
import { EtablissementFormComplete } from "@/components/forms/etablissement-form-complete";

export default function DescentePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [motDePasse, setMotDePasse] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [descente, setDescente] = useState<Descente | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      const response = await fetch("/api/descentes/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, motDePasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la vérification");
        return;
      }

      setDescente(data.descente);
      setIsAuthenticated(true);
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Collecte de données</CardTitle>
            <CardDescription>
              Entrez le mot de passe pour accéder au formulaire de descente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code de la descente</Label>
                <Input
                  id="code"
                  value={code}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Entrez le mot de passe"
                  required
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Accéder au formulaire"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{descente?.nom}</h1>
              <p className="text-sm text-muted-foreground">
                Code: {descente?.code} • Valide jusqu&apos;au{" "}
                {descente?.dateFin ? new Date(descente.dateFin).toLocaleDateString("fr-FR") : ""}
              </p>
            </div>
          </div>
          {descente?.description && (
            <p className="text-muted-foreground mt-3">{descente.description}</p>
          )}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6">
            {success}
          </div>
        )}

        <DescenteEtablissementForm 
          descenteId={descente?.id || ""} 
          onSuccess={() => {
            setSuccess("Établissement créé avec succès ! Il sera examiné par l'administration.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}

function DescenteEtablissementForm({ 
  descenteId, 
  onSuccess 
}: { 
  descenteId: string; 
  onSuccess: () => void;
}) {
  return (
    <EtablissementFormComplete 
      descenteId={descenteId}
      onSuccess={onSuccess}
      showCancel={false}
    />
  );
}
