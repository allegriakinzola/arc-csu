"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  FileText,
  Hospital,
  Pill,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Plus,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface EvolutionAccreditation {
  mois: string;
  label: string;
  evaluations: number;
  scoreMoyen: number;
  accredites: number;
  enCours: number;
  nonAccredites: number;
}

interface EvolutionEtablissements {
  mois: string;
  label: string;
  total: number;
  ess: number;
  epvg: number;
}

interface StatsData {
  total: number;
  parType: { ESS: number; EPVG: number };
  parStatut: Record<string, number>;
  parAccreditation: Record<string, number>;
  accreditation: {
    totalEvalues: number;
    totalNonEvalues: number;
    pourcentageMoyen: number;
    totalEvaluations: number;
    tranches: {
      excellent: number;
      bon: number;
      faible: number;
      nonEvalue: number;
    };
  };
  evolutionAccreditation: EvolutionAccreditation[];
  evolutionEtablissements: EvolutionEtablissements[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/etablissements/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const accred = stats?.accreditation;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Bienvenue, {session?.user?.name || "Utilisateur"}!
        </h2>
        <p className="text-muted-foreground">
          Voici un aperçu de l&apos;activité de la plateforme ARC-CSU.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total établissements
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              enregistrés dans le système
            </p>
          </CardContent>
        </Card>
        <Link href="/dashboard/etablissements/en-attente">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En attente
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.parStatut.EN_ATTENTE ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                à examiner et approuver
              </p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ESS</CardTitle>
            <Hospital className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.parType.ESS ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Établissements de Soins de Santé
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPVG</CardTitle>
            <Pill className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-foreground">
              {stats?.parType.EPVG ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Établissements Pharmaceutiques
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Score moyen
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (accred?.pourcentageMoyen ?? 0) >= 80 ? "text-green-600" :
              (accred?.pourcentageMoyen ?? 0) >= 50 ? "text-yellow-600" :
              (accred?.pourcentageMoyen ?? 0) > 0 ? "text-orange-600" :
              "text-muted-foreground"
            }`}>
              {(accred?.pourcentageMoyen ?? 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              de conformité d&apos;accréditation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accréditation Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Statuts d'accréditation */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Accréditation des établissements
            </CardTitle>
            <CardDescription>
              Répartition par statut d&apos;accréditation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Barre de progression globale */}
              {stats && stats.total > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression globale</span>
                    <span className="font-medium">
                      {accred?.totalEvalues ?? 0} / {stats.total} évalués
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden flex">
                    {accred && stats.total > 0 && (
                      <>
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${(accred.tranches.excellent / stats.total) * 100}%` }}
                          title={`Excellent: ${accred.tranches.excellent}`}
                        />
                        <div
                          className="h-full bg-yellow-500 transition-all"
                          style={{ width: `${(accred.tranches.bon / stats.total) * 100}%` }}
                          title={`Bon: ${accred.tranches.bon}`}
                        />
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{ width: `${(accred.tranches.faible / stats.total) * 100}%` }}
                          title={`Faible: ${accred.tranches.faible}`}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Excellent ({accred?.tranches.excellent ?? 0})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Bon ({accred?.tranches.bon ?? 0})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Faible ({accred?.tranches.faible ?? 0})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      Non évalué ({accred?.tranches.nonEvalue ?? 0})
                    </span>
                  </div>
                </div>
              )}

              {/* Statuts d'accréditation détaillés */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-green-700">
                      {stats?.parAccreditation?.ACCREDITE ?? 0}
                    </p>
                    <p className="text-xs text-green-600">Accrédités</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-blue-700">
                      {stats?.parAccreditation?.EN_COURS ?? 0}
                    </p>
                    <p className="text-xs text-blue-600">En cours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <XCircle className="h-5 w-5 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-gray-600">
                      {stats?.parAccreditation?.NON_ACCREDITE ?? 0}
                    </p>
                    <p className="text-xs text-gray-500">Non accrédités</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-orange-700">
                      {stats?.parAccreditation?.EXPIRE ?? 0}
                    </p>
                    <p className="text-xs text-orange-600">Expirés</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-red-700">
                      {stats?.parAccreditation?.REFUSE ?? 0}
                    </p>
                    <p className="text-xs text-red-600">Refusés</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-lg font-bold">
                      {accred?.totalEvalues ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Évalués</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statuts des établissements */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Statuts des établissements
            </CardTitle>
            <CardDescription>
              Répartition par statut opérationnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: "ACTIF", label: "Actifs", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" },
                { key: "EN_ATTENTE", label: "En attente", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
                { key: "SUSPENDU", label: "Suspendus", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" },
                { key: "INACTIF", label: "Inactifs", color: "bg-gray-400", textColor: "text-gray-600", bgColor: "bg-gray-50" },
              ].map((item) => {
                const count = stats?.parStatut?.[item.key] ?? 0;
                const pct = stats && stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className={`font-bold ${item.textColor}`}>
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Score moyen d'accréditation */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Score moyen d&apos;accréditation</span>
                  <span className={`text-xl font-bold ${
                    (accred?.pourcentageMoyen ?? 0) >= 80 ? "text-green-600" :
                    (accred?.pourcentageMoyen ?? 0) >= 50 ? "text-yellow-600" :
                    (accred?.pourcentageMoyen ?? 0) > 0 ? "text-orange-600" :
                    "text-muted-foreground"
                  }`}>
                    {(accred?.pourcentageMoyen ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (accred?.pourcentageMoyen ?? 0) >= 80 ? "bg-green-500" :
                      (accred?.pourcentageMoyen ?? 0) >= 50 ? "bg-yellow-500" :
                      (accred?.pourcentageMoyen ?? 0) > 0 ? "bg-orange-500" :
                      "bg-muted"
                    }`}
                    style={{ width: `${Math.min(accred?.pourcentageMoyen ?? 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Basé sur {accred?.totalEvalues ?? 0} établissement(s) évalué(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques d'évolution */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Évolution du score d'accréditation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Évolution des accréditations
            </CardTitle>
            <CardDescription>
              Nombre d&apos;évaluations et score moyen sur 12 mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.evolutionAccreditation && stats.evolutionAccreditation.some((d) => d.evaluations > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.evolutionAccreditation}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEval" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    unit="%"
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="evaluations"
                    name="Évaluations"
                    stroke="#3b82f6"
                    fill="url(#colorEval)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="scoreMoyen"
                    name="Score moyen (%)"
                    stroke="#22c55e"
                    fill="url(#colorScore)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune donnée d&apos;évaluation</p>
                  <p className="text-xs mt-1">Les données apparaîtront après les premières évaluations</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résultats d'accréditation par mois */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5" />
              Résultats d&apos;accréditation par mois
            </CardTitle>
            <CardDescription>
              Répartition des résultats (accrédités, en cours, non accrédités)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.evolutionAccreditation && stats.evolutionAccreditation.some((d) => d.evaluations > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.evolutionAccreditation}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="accredites"
                    name="Accrédités"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    stackId="stack"
                  />
                  <Bar
                    dataKey="enCours"
                    name="En cours"
                    fill="#eab308"
                    radius={[0, 0, 0, 0]}
                    stackId="stack"
                  />
                  <Bar
                    dataKey="nonAccredites"
                    name="Non accrédités"
                    fill="#ef4444"
                    radius={[0, 0, 0, 0]}
                    stackId="stack"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune donnée d&apos;accréditation</p>
                  <p className="text-xs mt-1">Les données apparaîtront après les premières évaluations</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accédez rapidement aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/etablissements/nouveau">
              <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Nouvel établissement</p>
                  <p className="text-sm text-muted-foreground">
                    Enregistrer un nouvel ESS ou EPVG
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/etablissements">
              <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <Building2 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium">Gérer établissements</p>
                  <p className="text-sm text-muted-foreground">
                    Voir et modifier les établissements
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/carte">
              <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="p-2 rounded-lg bg-accent/20">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Carte sanitaire</p>
                  <p className="text-sm text-muted-foreground">
                    Visualiser sur la carte
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
