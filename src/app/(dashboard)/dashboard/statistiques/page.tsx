"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Building2,
  Hospital,
  Pill,
  Shield,
  TrendingUp,
  Filter,
  Loader2,
  BarChart3,
  MapPin,
  RefreshCw,
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

// Couleurs constantes ESS / EPVG
const ESS_COLOR = "#3b82f6"; // bleu
const ESS_COLOR_LIGHT = "#93c5fd";
const EPVG_COLOR = "#f97316"; // orange
const EPVG_COLOR_LIGHT = "#fdba74";

interface StatsData {
  totaux: { ess: number; epvg: number; total: number };
  accreditationParType: {
    ess: Record<string, number>;
    epvg: Record<string, number>;
  };
  provincesEtablissements: {
    province: string;
    code: string;
    total_ess: number;
    total_epvg: number;
    total: number;
  }[];
  provincesAccredites: {
    province: string;
    code: string;
    accredites_ess: number;
    accredites_epvg: number;
    total_accredites: number;
  }[];
  evolution: {
    mois: string;
    label: string;
    evalESS: number;
    evalEPVG: number;
    accreditesESS: number;
    accreditesEPVG: number;
    enCoursESS: number;
    enCoursEPVG: number;
    scoreMoyenESS: number;
    scoreMoyenEPVG: number;
  }[];
  tableauStatuts: Record<string, { ess: number; epvg: number }>;
}

export default function StatistiquesPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateDebut) params.set("dateDebut", dateDebut);
      if (dateFin) params.set("dateFin", dateFin);
      const res = await fetch(`/api/statistiques?${params.toString()}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleReset = () => {
    setDateDebut("");
    setDateFin("");
  };

  const STATUT_LABELS: Record<string, string> = {
    ACCREDITE: "Accrédité",
    EN_COURS: "En cours",
    NON_ACCREDITE: "Non accrédité",
    EXPIRE: "Expiré",
    REFUSE: "Refusé",
    SUSPENDU: "Suspendu",
    ACTIF: "Actif",
    EN_ATTENTE: "En attente",
    INACTIF: "Inactif",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Statistiques
          </h2>
          <p className="text-muted-foreground">
            Analyse détaillée des établissements et accréditations
          </p>
        </div>

        {/* Filtres de période */}
        <Card className="p-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Période :</span>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="dateDebut" className="text-xs">
                Du
              </Label>
              <Input
                id="dateDebut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="h-8 w-[150px] text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="dateFin" className="text-xs">
                Au
              </Label>
              <Input
                id="dateFin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="h-8 w-[150px] text-sm"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <>
          {/* Cartes résumé */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totaux.total}</div>
                <div className="flex items-center gap-3 mt-2">
                  <Badge
                    className="text-xs"
                    style={{ backgroundColor: ESS_COLOR }}
                  >
                    <Hospital className="h-3 w-3 mr-1" />
                    {stats.totaux.ess} ESS
                  </Badge>
                  <Badge
                    className="text-xs"
                    style={{ backgroundColor: EPVG_COLOR }}
                  >
                    <Pill className="h-3 w-3 mr-1" />
                    {stats.totaux.epvg} EPVG
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Accrédités
                </CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(stats.accreditationParType.ess.ACCREDITE ?? 0) +
                    (stats.accreditationParType.epvg.ACCREDITE ?? 0)}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs" style={{ color: ESS_COLOR }}>
                    <span className="font-bold">
                      {stats.accreditationParType.ess.ACCREDITE ?? 0}
                    </span>{" "}
                    ESS
                  </span>
                  <span className="text-xs" style={{ color: EPVG_COLOR }}>
                    <span className="font-bold">
                      {stats.accreditationParType.epvg.ACCREDITE ?? 0}
                    </span>{" "}
                    EPVG
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux d&apos;accréditation
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {(() => {
                  const accESS =
                    stats.accreditationParType.ess.ACCREDITE ?? 0;
                  const accEPVG =
                    stats.accreditationParType.epvg.ACCREDITE ?? 0;
                  const totalAcc = accESS + accEPVG;
                  const pct =
                    stats.totaux.total > 0
                      ? ((totalAcc / stats.totaux.total) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <>
                      <div className="text-3xl font-bold">{pct}%</div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>
                          ESS:{" "}
                          {stats.totaux.ess > 0
                            ? (
                                (accESS / stats.totaux.ess) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </span>
                        <span>
                          EPVG:{" "}
                          {stats.totaux.epvg > 0
                            ? (
                                (accEPVG / stats.totaux.epvg) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Tableau récapitulatif accréditations ESS vs EPVG */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5" />
                Accréditations par type d&apos;établissement
              </CardTitle>
              <CardDescription>
                Comparaison ESS et EPVG par statut d&apos;accréditation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">
                        Type
                      </th>
                      {[
                        "ACCREDITE",
                        "EN_COURS",
                        "NON_ACCREDITE",
                        "EXPIRE",
                        "REFUSE",
                      ].map((s) => (
                        <th
                          key={s}
                          className="text-center py-3 px-4 font-semibold"
                        >
                          {STATUT_LABELS[s] || s}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-semibold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className="border-b"
                      style={{ backgroundColor: `${ESS_COLOR}10` }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ESS_COLOR }}
                          />
                          <Hospital
                            className="h-4 w-4"
                            style={{ color: ESS_COLOR }}
                          />
                          <span
                            className="font-semibold"
                            style={{ color: ESS_COLOR }}
                          >
                            ESS
                          </span>
                        </div>
                      </td>
                      {[
                        "ACCREDITE",
                        "EN_COURS",
                        "NON_ACCREDITE",
                        "EXPIRE",
                        "REFUSE",
                      ].map((s) => (
                        <td
                          key={s}
                          className="text-center py-3 px-4 font-medium"
                        >
                          {stats.accreditationParType.ess[s] ?? 0}
                        </td>
                      ))}
                      <td className="text-center py-3 px-4 font-bold">
                        {stats.totaux.ess}
                      </td>
                    </tr>
                    <tr
                      className="border-b"
                      style={{ backgroundColor: `${EPVG_COLOR}10` }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: EPVG_COLOR }}
                          />
                          <Pill
                            className="h-4 w-4"
                            style={{ color: EPVG_COLOR }}
                          />
                          <span
                            className="font-semibold"
                            style={{ color: EPVG_COLOR }}
                          >
                            EPVG
                          </span>
                        </div>
                      </td>
                      {[
                        "ACCREDITE",
                        "EN_COURS",
                        "NON_ACCREDITE",
                        "EXPIRE",
                        "REFUSE",
                      ].map((s) => (
                        <td
                          key={s}
                          className="text-center py-3 px-4 font-medium"
                        >
                          {stats.accreditationParType.epvg[s] ?? 0}
                        </td>
                      ))}
                      <td className="text-center py-3 px-4 font-bold">
                        {stats.totaux.epvg}
                      </td>
                    </tr>
                    <tr className="bg-muted/50 font-bold">
                      <td className="py-3 px-4">Total</td>
                      {[
                        "ACCREDITE",
                        "EN_COURS",
                        "NON_ACCREDITE",
                        "EXPIRE",
                        "REFUSE",
                      ].map((s) => (
                        <td key={s} className="text-center py-3 px-4">
                          {(stats.accreditationParType.ess[s] ?? 0) +
                            (stats.accreditationParType.epvg[s] ?? 0)}
                        </td>
                      ))}
                      <td className="text-center py-3 px-4">
                        {stats.totaux.total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tableau statuts opérationnels ESS vs EPVG */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5" />
                Statuts opérationnels par type
              </CardTitle>
              <CardDescription>
                Répartition des statuts pour ESS et EPVG
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">
                        Type
                      </th>
                      {Object.keys(stats.tableauStatuts).map((s) => (
                        <th
                          key={s}
                          className="text-center py-3 px-4 font-semibold"
                        >
                          {STATUT_LABELS[s] || s}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-semibold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className="border-b"
                      style={{ backgroundColor: `${ESS_COLOR}10` }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ESS_COLOR }}
                          />
                          <span
                            className="font-semibold"
                            style={{ color: ESS_COLOR }}
                          >
                            ESS
                          </span>
                        </div>
                      </td>
                      {Object.entries(stats.tableauStatuts).map(
                        ([s, counts]) => (
                          <td
                            key={s}
                            className="text-center py-3 px-4 font-medium"
                          >
                            {counts.ess}
                          </td>
                        )
                      )}
                      <td className="text-center py-3 px-4 font-bold">
                        {stats.totaux.ess}
                      </td>
                    </tr>
                    <tr
                      className="border-b"
                      style={{ backgroundColor: `${EPVG_COLOR}10` }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: EPVG_COLOR }}
                          />
                          <span
                            className="font-semibold"
                            style={{ color: EPVG_COLOR }}
                          >
                            EPVG
                          </span>
                        </div>
                      </td>
                      {Object.entries(stats.tableauStatuts).map(
                        ([s, counts]) => (
                          <td
                            key={s}
                            className="text-center py-3 px-4 font-medium"
                          >
                            {counts.epvg}
                          </td>
                        )
                      )}
                      <td className="text-center py-3 px-4 font-bold">
                        {stats.totaux.epvg}
                      </td>
                    </tr>
                    <tr className="bg-muted/50 font-bold">
                      <td className="py-3 px-4">Total</td>
                      {Object.entries(stats.tableauStatuts).map(
                        ([s, counts]) => (
                          <td key={s} className="text-center py-3 px-4">
                            {counts.ess + counts.epvg}
                          </td>
                        )
                      )}
                      <td className="text-center py-3 px-4">
                        {stats.totaux.total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Graphiques évolution */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Évolution des évaluations ESS vs EPVG */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5" />
                  Évolution des évaluations
                </CardTitle>
                <CardDescription>
                  Nombre d&apos;évaluations par mois{" "}
                  <Badge
                    variant="outline"
                    className="ml-1 text-[10px]"
                    style={{ color: ESS_COLOR, borderColor: ESS_COLOR }}
                  >
                    ESS
                  </Badge>{" "}
                  <Badge
                    variant="outline"
                    className="ml-1 text-[10px]"
                    style={{ color: EPVG_COLOR, borderColor: EPVG_COLOR }}
                  >
                    EPVG
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.evolution.some(
                  (d) => d.evalESS > 0 || d.evalEPVG > 0
                ) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.evolution}>
                      <defs>
                        <linearGradient
                          id="gradESS"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={ESS_COLOR}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={ESS_COLOR}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradEPVG"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={EPVG_COLOR}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={EPVG_COLOR}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
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
                      <Area
                        type="monotone"
                        dataKey="evalESS"
                        name="ESS"
                        stroke={ESS_COLOR}
                        fill="url(#gradESS)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="evalEPVG"
                        name="EPVG"
                        stroke={EPVG_COLOR}
                        fill="url(#gradEPVG)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucune donnée d&apos;évaluation</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score moyen ESS vs EPVG */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5" />
                  Score moyen d&apos;accréditation
                </CardTitle>
                <CardDescription>
                  Évolution du score moyen (%) par mois{" "}
                  <Badge
                    variant="outline"
                    className="ml-1 text-[10px]"
                    style={{ color: ESS_COLOR, borderColor: ESS_COLOR }}
                  >
                    ESS
                  </Badge>{" "}
                  <Badge
                    variant="outline"
                    className="ml-1 text-[10px]"
                    style={{ color: EPVG_COLOR, borderColor: EPVG_COLOR }}
                  >
                    EPVG
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.evolution.some(
                  (d) => d.scoreMoyenESS > 0 || d.scoreMoyenEPVG > 0
                ) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.evolution}>
                      <defs>
                        <linearGradient
                          id="gradScoreESS"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={ESS_COLOR}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={ESS_COLOR}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradScoreEPVG"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={EPVG_COLOR}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={EPVG_COLOR}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
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
                        type="monotone"
                        dataKey="scoreMoyenESS"
                        name="ESS"
                        stroke={ESS_COLOR}
                        fill="url(#gradScoreESS)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="scoreMoyenEPVG"
                        name="EPVG"
                        stroke={EPVG_COLOR}
                        fill="url(#gradScoreEPVG)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucune donnée de score</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Graphiques accréditations par mois ESS vs EPVG */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5" />
                Accréditations par mois
              </CardTitle>
              <CardDescription>
                Nombre d&apos;établissements accrédités par mois{" "}
                <Badge
                  variant="outline"
                  className="ml-1 text-[10px]"
                  style={{ color: ESS_COLOR, borderColor: ESS_COLOR }}
                >
                  ESS
                </Badge>{" "}
                <Badge
                  variant="outline"
                  className="ml-1 text-[10px]"
                  style={{ color: EPVG_COLOR, borderColor: EPVG_COLOR }}
                >
                  EPVG
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.evolution.some(
                (d) => d.accreditesESS > 0 || d.accreditesEPVG > 0
              ) ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.evolution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
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
                      dataKey="accreditesESS"
                      name="Accrédités ESS"
                      fill={ESS_COLOR}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="accreditesEPVG"
                      name="Accrédités EPVG"
                      fill={EPVG_COLOR}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="enCoursESS"
                      name="En cours ESS"
                      fill={ESS_COLOR_LIGHT}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="enCoursEPVG"
                      name="En cours EPVG"
                      fill={EPVG_COLOR_LIGHT}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      Aucune donnée d&apos;accréditation
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provinces */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Provinces avec le plus d'établissements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-5 w-5" />
                  Provinces — Plus d&apos;établissements
                </CardTitle>
                <CardDescription>
                  Classement des provinces par nombre d&apos;établissements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.provincesEtablissements.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={Math.max(250, stats.provincesEtablissements.length * 40)}>
                      <BarChart
                        data={stats.provincesEtablissements.slice(0, 15)}
                        layout="vertical"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10 }}
                          allowDecimals={false}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          type="category"
                          dataKey="province"
                          tick={{ fontSize: 10 }}
                          width={120}
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
                          dataKey="total_ess"
                          name="ESS"
                          fill={ESS_COLOR}
                          stackId="stack"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="total_epvg"
                          name="EPVG"
                          fill={EPVG_COLOR}
                          stackId="stack"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    {/* Tableau */}
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-semibold">
                              Province
                            </th>
                            <th
                              className="text-center py-2 px-3 font-semibold"
                              style={{ color: ESS_COLOR }}
                            >
                              ESS
                            </th>
                            <th
                              className="text-center py-2 px-3 font-semibold"
                              style={{ color: EPVG_COLOR }}
                            >
                              EPVG
                            </th>
                            <th className="text-center py-2 px-3 font-semibold">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.provincesEtablissements.map((p, i) => (
                            <tr
                              key={p.code}
                              className={
                                i % 2 === 0 ? "bg-muted/30" : ""
                              }
                            >
                              <td className="py-2 px-3 font-medium">
                                {p.province}
                              </td>
                              <td
                                className="text-center py-2 px-3"
                                style={{ color: ESS_COLOR }}
                              >
                                {p.total_ess}
                              </td>
                              <td
                                className="text-center py-2 px-3"
                                style={{ color: EPVG_COLOR }}
                              >
                                {p.total_epvg}
                              </td>
                              <td className="text-center py-2 px-3 font-bold">
                                {p.total}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Aucune donnée disponible
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provinces avec le plus d'accrédités */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5 text-green-600" />
                  Provinces — Plus d&apos;accrédités
                </CardTitle>
                <CardDescription>
                  Classement des provinces par nombre d&apos;établissements
                  accrédités
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.provincesAccredites.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={Math.max(250, stats.provincesAccredites.length * 40)}>
                      <BarChart
                        data={stats.provincesAccredites.slice(0, 15)}
                        layout="vertical"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10 }}
                          allowDecimals={false}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          type="category"
                          dataKey="province"
                          tick={{ fontSize: 10 }}
                          width={120}
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
                          dataKey="accredites_ess"
                          name="ESS accrédités"
                          fill={ESS_COLOR}
                          stackId="stack"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="accredites_epvg"
                          name="EPVG accrédités"
                          fill={EPVG_COLOR}
                          stackId="stack"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    {/* Tableau */}
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-semibold">
                              Province
                            </th>
                            <th
                              className="text-center py-2 px-3 font-semibold"
                              style={{ color: ESS_COLOR }}
                            >
                              ESS
                            </th>
                            <th
                              className="text-center py-2 px-3 font-semibold"
                              style={{ color: EPVG_COLOR }}
                            >
                              EPVG
                            </th>
                            <th className="text-center py-2 px-3 font-semibold">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.provincesAccredites.map((p, i) => (
                            <tr
                              key={p.code}
                              className={
                                i % 2 === 0 ? "bg-muted/30" : ""
                              }
                            >
                              <td className="py-2 px-3 font-medium">
                                {p.province}
                              </td>
                              <td
                                className="text-center py-2 px-3"
                                style={{ color: ESS_COLOR }}
                              >
                                {p.accredites_ess}
                              </td>
                              <td
                                className="text-center py-2 px-3"
                                style={{ color: EPVG_COLOR }}
                              >
                                {p.accredites_epvg}
                              </td>
                              <td className="text-center py-2 px-3 font-bold">
                                {p.total_accredites}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Aucun établissement accrédité
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">
            Erreur lors du chargement des statistiques
          </p>
        </div>
      )}
    </div>
  );
}
