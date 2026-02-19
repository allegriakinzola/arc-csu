export type TypeEtablissement = "ESS" | "EPVG";

export type StatutEtablissement = "ACTIF" | "INACTIF" | "SUSPENDU" | "EN_ATTENTE";

export type StatutAccreditation = "NON_ACCREDITE" | "EN_COURS" | "ACCREDITE" | "EXPIRE" | "REFUSE";

export type SousTypeESS =
  | "HOPITAL_GENERAL"
  | "HOPITAL_SPECIALISE"
  | "CLINIQUE"
  | "CENTRE_SANTE"
  | "CENTRE_SANTE_REFERENCE"
  | "POSTE_SANTE"
  | "DISPENSAIRE"
  | "CABINET_MEDICAL"
  | "LABORATOIRE"
  | "CENTRE_IMAGERIE"
  | "AUTRE";

export type SousTypeEPVG =
  | "GROSSISTE_REPARTITEUR"
  | "DISTRIBUTEUR"
  | "IMPORTATEUR"
  | "FABRICANT"
  | "DEPOT_PHARMACEUTIQUE"
  | "CENTRALE_ACHAT"
  | "AUTRE";

export interface Province {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    zonesSante: number;
  };
}

export interface ZoneSante {
  id: string;
  code: string;
  name: string;
  description?: string;
  provinceId: string;
  province?: Province;
  createdAt: string;
  updatedAt: string;
  _count?: {
    airesSante: number;
  };
}

export interface AireSante {
  id: string;
  code: string;
  name: string;
  description?: string;
  zoneSanteId: string;
  zoneSante?: ZoneSante;
  createdAt: string;
  updatedAt: string;
  _count?: {
    etablissements: number;
  };
}

export interface Etablissement {
  id: string;
  code: string;
  raisonSociale: string;
  sigle?: string;
  type: TypeEtablissement;
  sousTypeESS?: SousTypeESS;
  sousTypeEPVG?: SousTypeEPVG;
  statut: StatutEtablissement;
  statutAccreditation: StatutAccreditation;
  aireSanteId: string;
  aireSante?: AireSante;
  adresse?: string;
  quartier?: string;
  avenue?: string;
  numero?: string;
  coordonneesGPS?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  telephoneSecondaire?: string;
  email?: string;
  siteWeb?: string;
  nomResponsable?: string;
  fonctionResponsable?: string;
  telephoneResponsable?: string;
  emailResponsable?: string;
  numeroRCCM?: string;
  numeroIdNat?: string;
  numeroImpot?: string;
  dateCreation?: string;
  dateOuverture?: string;
  nombreLits?: number;
  nombrePersonnel?: number;
  numeroIdentifiantRSSP?: string;
  dateIdentificationRSSP?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CritereEvaluation {
  id: string;
  code: string;
  libelle: string;
  description?: string;
  categorie: string;
  ponderation: number;
  obligatoire: boolean;
  actif: boolean;
  typeEtablissement?: TypeEtablissement;
  createdAt: string;
  updatedAt: string;
}

export interface CriteresResponse {
  data: CritereEvaluation[];
  grouped: Record<string, CritereEvaluation[]>;
  total: number;
  totalObligatoires: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const SOUS_TYPES_ESS: Record<SousTypeESS, string> = {
  HOPITAL_GENERAL: "Hôpital Général",
  HOPITAL_SPECIALISE: "Hôpital Spécialisé",
  CLINIQUE: "Clinique",
  CENTRE_SANTE: "Centre de Santé",
  CENTRE_SANTE_REFERENCE: "Centre de Santé de Référence",
  POSTE_SANTE: "Poste de Santé",
  DISPENSAIRE: "Dispensaire",
  CABINET_MEDICAL: "Cabinet Médical",
  LABORATOIRE: "Laboratoire",
  CENTRE_IMAGERIE: "Centre d'Imagerie",
  AUTRE: "Autre",
};

export const SOUS_TYPES_EPVG: Record<SousTypeEPVG, string> = {
  GROSSISTE_REPARTITEUR: "Grossiste Répartiteur",
  DISTRIBUTEUR: "Distributeur",
  IMPORTATEUR: "Importateur",
  FABRICANT: "Fabricant",
  DEPOT_PHARMACEUTIQUE: "Dépôt Pharmaceutique",
  CENTRALE_ACHAT: "Centrale d'Achat",
  AUTRE: "Autre",
};

export const STATUTS_ETABLISSEMENT: Record<StatutEtablissement, string> = {
  ACTIF: "Actif",
  INACTIF: "Inactif",
  SUSPENDU: "Suspendu",
  EN_ATTENTE: "En attente",
};

export const STATUTS_ACCREDITATION: Record<StatutAccreditation, string> = {
  NON_ACCREDITE: "Non accrédité",
  EN_COURS: "En cours",
  ACCREDITE: "Accrédité",
  EXPIRE: "Expiré",
  REFUSE: "Refusé",
};
