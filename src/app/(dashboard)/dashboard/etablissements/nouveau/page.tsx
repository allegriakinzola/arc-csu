"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EtablissementFormComplete } from "@/components/forms/etablissement-form-complete";

export default function NouvelEtablissementPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/etablissements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Nouvel établissement
          </h2>
          <p className="text-muted-foreground">
            Enregistrer un nouvel établissement dans le système ARC-CSU
          </p>
        </div>
      </div>

      <EtablissementFormComplete
        onSuccess={(etablissement) => {
          router.push(`/dashboard/etablissements/${etablissement.id}`);
        }}
        onCancel={() => {
          router.push("/dashboard/etablissements");
        }}
      />
    </div>
  );
}
