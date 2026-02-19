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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Search,
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Hospital,
  Pill,
  MapPin,
} from "lucide-react";
import {
  Etablissement,
  PaginatedResponse,
  STATUTS_ETABLISSEMENT,
  STATUTS_ACCREDITATION,
  SOUS_TYPES_ESS,
  SOUS_TYPES_EPVG,
} from "@/lib/types";

const getStatutBadgeColor = (statut: string) => {
  switch (statut) {
    case "ACTIF":
      return "bg-green-100 text-green-700";
    case "INACTIF":
      return "bg-gray-100 text-gray-500";
    case "SUSPENDU":
      return "bg-red-100 text-red-700";
    case "EN_ATTENTE":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

const getAccreditationBadgeColor = (statut: string) => {
  switch (statut) {
    case "ACCREDITE":
      return "bg-green-100 text-green-700";
    case "EN_COURS":
      return "bg-blue-100 text-blue-700";
    case "NON_ACCREDITE":
      return "bg-gray-100 text-gray-500";
    case "EXPIRE":
      return "bg-orange-100 text-orange-700";
    case "REFUSE":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

export default function EtablissementsPage() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchEtablissements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter) params.set("type", typeFilter);

      const response = await fetch(`/api/etablissements?${params}`);
      const data: PaginatedResponse<Etablissement> = await response.json();

      setEtablissements(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching etablissements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtablissements();
  }, [pagination.page, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchEtablissements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet établissement ?")) {
      return;
    }

    try {
      await fetch(`/api/etablissements/${id}`, { method: "DELETE" });
      fetchEtablissements();
    } catch (error) {
      console.error("Error deleting etablissement:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Établissements</h2>
          <p className="text-muted-foreground">
            Gérez les établissements de soins de santé (ESS) et pharmaceutiques (EPVG)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/etablissements/carte">
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Voir la carte
            </Button>
          </Link>
          <Link href="/dashboard/etablissements/nouveau">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel établissement
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">établissements enregistrés</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${
            typeFilter === "ESS" ? "border-primary" : ""
          }`}
          onClick={() => setTypeFilter(typeFilter === "ESS" ? "" : "ESS")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ESS</CardTitle>
            <Hospital className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {etablissements.filter((e) => e.type === "ESS").length}
            </div>
            <p className="text-xs text-muted-foreground">Établissements de Soins de Santé</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${
            typeFilter === "EPVG" ? "border-secondary" : ""
          }`}
          onClick={() => setTypeFilter(typeFilter === "EPVG" ? "" : "EPVG")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPVG</CardTitle>
            <Pill className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-foreground">
              {etablissements.filter((e) => e.type === "EPVG").length}
            </div>
            <p className="text-xs text-muted-foreground">Établissements Pharmaceutiques</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des établissements</CardTitle>
          <CardDescription>
            {pagination.total} établissement(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Rechercher
              </Button>
            </form>
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
                  ESS - Soins de Santé
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("EPVG")}>
                  EPVG - Pharmaceutique
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : etablissements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun établissement</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par ajouter un établissement
              </p>
              <Link href="/dashboard/etablissements/nouveau">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un établissement
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Établissement
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Localisation
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Statut
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Accréditation
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {etablissements.map((etablissement) => (
                      <tr
                        key={etablissement.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                etablissement.type === "ESS"
                                  ? "bg-primary/10"
                                  : "bg-secondary/50"
                              }`}
                            >
                              {etablissement.type === "ESS" ? (
                                <Hospital className="h-5 w-5 text-primary" />
                              ) : (
                                <Pill className="h-5 w-5 text-secondary-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{etablissement.raisonSociale}</p>
                              <p className="text-sm text-muted-foreground">
                                {etablissement.numeroIdentifiantRSSP || etablissement.code}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                etablissement.type === "ESS"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-secondary text-secondary-foreground"
                              }`}
                            >
                              {etablissement.type}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {etablissement.type === "ESS" && etablissement.sousTypeESS
                                ? SOUS_TYPES_ESS[etablissement.sousTypeESS]
                                : etablissement.type === "EPVG" && etablissement.sousTypeEPVG
                                ? SOUS_TYPES_EPVG[etablissement.sousTypeEPVG]
                                : "-"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p>{etablissement.aireSante?.zoneSante?.province?.name}</p>
                            <p className="text-muted-foreground">
                              {etablissement.aireSante?.zoneSante?.name}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutBadgeColor(
                              etablissement.statut
                            )}`}
                          >
                            {STATUTS_ETABLISSEMENT[etablissement.statut]}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAccreditationBadgeColor(
                              etablissement.statutAccreditation
                            )}`}
                          >
                            {STATUTS_ACCREDITATION[etablissement.statutAccreditation]}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/etablissements/${etablissement.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/etablissements/${etablissement.id}/modifier`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(etablissement.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} sur {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
