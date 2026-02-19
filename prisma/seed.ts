import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const provinces = [
  { code: "KIN", name: "Kinshasa" },
  { code: "KOC", name: "Kongo-Central" },
  { code: "KWO", name: "Kwango" },
  { code: "KWL", name: "Kwilu" },
  { code: "MAI", name: "Mai-Ndombe" },
  { code: "EQU", name: "Équateur" },
  { code: "SUD", name: "Sud-Ubangi" },
  { code: "NOR", name: "Nord-Ubangi" },
  { code: "MON", name: "Mongala" },
  { code: "TSH", name: "Tshuapa" },
  { code: "TAN", name: "Tanganyika" },
  { code: "HLO", name: "Haut-Lomami" },
  { code: "LUA", name: "Lualaba" },
  { code: "HKA", name: "Haut-Katanga" },
  { code: "KAS", name: "Kasaï" },
  { code: "KAC", name: "Kasaï-Central" },
  { code: "KAO", name: "Kasaï-Oriental" },
  { code: "LOM", name: "Lomami" },
  { code: "SAN", name: "Sankuru" },
  { code: "MAN", name: "Maniema" },
  { code: "SUK", name: "Sud-Kivu" },
  { code: "NOK", name: "Nord-Kivu" },
  { code: "ITO", name: "Ituri" },
  { code: "HUE", name: "Haut-Uélé" },
  { code: "BUE", name: "Bas-Uélé" },
  { code: "TSO", name: "Tshopo" },
];

const zonesSanteKinshasa = [
  { code: "ZS-KIN-BAN", name: "Bandalungwa" },
  { code: "ZS-KIN-BAR", name: "Barumbu" },
  { code: "ZS-KIN-BUM", name: "Bumbu" },
  { code: "ZS-KIN-GOM", name: "Gombe" },
  { code: "ZS-KIN-KAL", name: "Kalamu" },
  { code: "ZS-KIN-KAS", name: "Kasa-Vubu" },
  { code: "ZS-KIN-KIM", name: "Kimbanseke" },
  { code: "ZS-KIN-KIN", name: "Kinshasa" },
  { code: "ZS-KIN-KIS", name: "Kintambo" },
  { code: "ZS-KIN-LEM", name: "Lemba" },
  { code: "ZS-KIN-LIM", name: "Limete" },
  { code: "ZS-KIN-LIN", name: "Lingwala" },
  { code: "ZS-KIN-MAK", name: "Makala" },
  { code: "ZS-KIN-MAL", name: "Maluku" },
  { code: "ZS-KIN-MAS", name: "Masina" },
  { code: "ZS-KIN-MAT", name: "Matete" },
  { code: "ZS-KIN-MON", name: "Mont-Ngafula" },
  { code: "ZS-KIN-NGA", name: "Ngaba" },
  { code: "ZS-KIN-NGA2", name: "Ngaliema" },
  { code: "ZS-KIN-NGI", name: "Ngiri-Ngiri" },
  { code: "ZS-KIN-NJI", name: "Ndjili" },
  { code: "ZS-KIN-NSE", name: "Nsele" },
  { code: "ZS-KIN-SEL", name: "Selembao" },
];

// ============================================
// CRITÈRES D'ACCRÉDITATION ESS
// (Établissements de Soins de Santé)
// Ref: Loi 18/035, Décret 22/14, Normes MSP 2019
// ============================================
const criteresESS = [
  // --- JURIDIQUE ET ADMINISTRATIF ---
  {
    code: "ESS-JUR-001",
    libelle: "Autorisation d'ouverture et de fonctionnement",
    description: "Dispose d'une autorisation d'ouverture délivrée par le Gouverneur de province (Art. 14, Loi 18/035)",
    categorie: "Juridique et Administratif",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "ESS-JUR-002",
    libelle: "Inscription au plan de couverture sanitaire",
    description: "Inscrit dans le plan de couverture sanitaire et intégré au système national d'information et de planification sanitaire (SNIS)",
    categorie: "Juridique et Administratif",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "ESS-JUR-003",
    libelle: "Enregistrement RCCM",
    description: "Possède un numéro valide au Registre du Commerce et du Crédit Mobilier",
    categorie: "Juridique et Administratif",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-JUR-004",
    libelle: "Identification nationale (Id. Nat.)",
    description: "Possède un numéro d'identification nationale en cours de validité",
    categorie: "Juridique et Administratif",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-JUR-005",
    libelle: "Numéro impôt",
    description: "En règle avec l'administration fiscale et possède un numéro impôt valide",
    categorie: "Juridique et Administratif",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-JUR-006",
    libelle: "Contrat avec le Fonds de Solidarité Santé",
    description: "Dispose d'un contrat validé par l'ARC-CSU avec le FSS dans le cadre de la CSU",
    categorie: "Juridique et Administratif",
    ponderation: 5,
    obligatoire: false,
  },
  // --- INFRASTRUCTURE ET LOCAUX ---
  {
    code: "ESS-INF-001",
    libelle: "Conformité de l'implantation",
    description: "Implanté dans une aire de santé définie conformément au plan de couverture sanitaire du MSP",
    categorie: "Infrastructure et Locaux",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "ESS-INF-002",
    libelle: "Bâtiment conforme aux normes de construction",
    description: "Construction respectant les normes du MSP : ventilation, éclairage naturel, accessibilité PMR, solidité structurelle",
    categorie: "Infrastructure et Locaux",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "ESS-INF-003",
    libelle: "Salle de consultation",
    description: "Dispose d'au moins une salle de consultation médicale équipée et permettant la confidentialité",
    categorie: "Infrastructure et Locaux",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-INF-004",
    libelle: "Salle de soins / pansements",
    description: "Dispose d'une salle de soins et pansements séparée et équipée",
    categorie: "Infrastructure et Locaux",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "ESS-INF-005",
    libelle: "Salle d'accouchement (maternité)",
    description: "Dispose d'une salle d'accouchement fonctionnelle avec table d'accouchement et matériel requis",
    categorie: "Infrastructure et Locaux",
    ponderation: 7,
    obligatoire: false,
  },
  {
    code: "ESS-INF-006",
    libelle: "Salle d'hospitalisation",
    description: "Dispose de lits d'hospitalisation conformes avec literie propre, moustiquaires, et espace minimum par lit",
    categorie: "Infrastructure et Locaux",
    ponderation: 6,
    obligatoire: false,
  },
  {
    code: "ESS-INF-007",
    libelle: "Laboratoire de base",
    description: "Dispose d'un laboratoire fonctionnel pour les analyses de base (paludisme, hémoglobine, urines, selles)",
    categorie: "Infrastructure et Locaux",
    ponderation: 6,
    obligatoire: false,
  },
  {
    code: "ESS-INF-008",
    libelle: "Pharmacie / dépôt de médicaments",
    description: "Dispose d'un espace de stockage sécurisé des médicaments avec conditions de conservation adéquates",
    categorie: "Infrastructure et Locaux",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-INF-009",
    libelle: "Point d'eau potable",
    description: "Dispose d'un point d'eau potable fonctionnel et accessible",
    categorie: "Infrastructure et Locaux",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-INF-010",
    libelle: "Installations sanitaires (latrines/toilettes)",
    description: "Dispose de latrines ou toilettes séparées (personnel/patients, hommes/femmes) en bon état",
    categorie: "Infrastructure et Locaux",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-INF-011",
    libelle: "Source d'énergie",
    description: "Dispose d'une source d'énergie fiable (électricité, groupe électrogène, panneau solaire)",
    categorie: "Infrastructure et Locaux",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-INF-012",
    libelle: "Salle d'attente pour les patients",
    description: "Dispose d'une salle ou espace d'attente couvert et aménagé pour les patients",
    categorie: "Infrastructure et Locaux",
    ponderation: 3,
    obligatoire: false,
  },
  {
    code: "ESS-INF-013",
    libelle: "Clôture et sécurisation du site",
    description: "Le site est clôturé ou délimité avec un accès contrôlé",
    categorie: "Infrastructure et Locaux",
    ponderation: 3,
    obligatoire: false,
  },
  // --- ÉQUIPEMENTS ET MATÉRIELS ---
  {
    code: "ESS-EQP-001",
    libelle: "Équipement de consultation de base",
    description: "Tensiomètre, thermomètre, stéthoscope, pèse-personne, toise, otoscope disponibles et fonctionnels",
    categorie: "Équipements et Matériels",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-EQP-002",
    libelle: "Table d'examen",
    description: "Dispose d'au moins une table d'examen en bon état dans chaque salle de consultation",
    categorie: "Équipements et Matériels",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-EQP-003",
    libelle: "Matériel de stérilisation",
    description: "Dispose d'un autoclave ou poupinel fonctionnel pour la stérilisation du matériel médical",
    categorie: "Équipements et Matériels",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-EQP-004",
    libelle: "Chaîne de froid (réfrigérateur vaccins)",
    description: "Dispose d'un réfrigérateur pour la conservation des vaccins et produits thermosensibles avec suivi de température",
    categorie: "Équipements et Matériels",
    ponderation: 6,
    obligatoire: false,
  },
  {
    code: "ESS-EQP-005",
    libelle: "Matériel d'urgence et de réanimation",
    description: "Dispose d'un kit d'urgence : ambu-bag, oxygène, matériel de perfusion, brancard",
    categorie: "Équipements et Matériels",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "ESS-EQP-006",
    libelle: "Matériel de laboratoire de base",
    description: "Microscope, centrifugeuse, réactifs de base disponibles et fonctionnels",
    categorie: "Équipements et Matériels",
    ponderation: 5,
    obligatoire: false,
  },
  {
    code: "ESS-EQP-007",
    libelle: "Lit d'hospitalisation normé",
    description: "Lits d'hospitalisation avec matelas, draps, moustiquaires en nombre suffisant par rapport à la capacité déclarée",
    categorie: "Équipements et Matériels",
    ponderation: 5,
    obligatoire: false,
  },
  {
    code: "ESS-EQP-008",
    libelle: "Ambulance ou moyen d'évacuation",
    description: "Dispose d'un véhicule d'évacuation sanitaire ou d'un partenariat formalisé pour les transferts",
    categorie: "Équipements et Matériels",
    ponderation: 4,
    obligatoire: false,
  },
  // --- PERSONNEL DE SANTÉ ---
  {
    code: "ESS-PER-001",
    libelle: "Médecin responsable qualifié",
    description: "Dirigé par un médecin diplômé inscrit à l'Ordre des Médecins ou un infirmier diplômé A1/A2 selon le niveau",
    categorie: "Personnel de Santé",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "ESS-PER-002",
    libelle: "Personnel infirmier suffisant",
    description: "Dispose d'infirmiers diplômés en nombre suffisant par rapport à la capacité et au volume d'activité",
    categorie: "Personnel de Santé",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "ESS-PER-003",
    libelle: "Personnel certifié ARC-CSU",
    description: "Le personnel clé dispose d'une certification délivrée par l'ARC-CSU attestant sa compétence pour la CSU",
    categorie: "Personnel de Santé",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-PER-004",
    libelle: "Sage-femme ou accoucheur qualifié",
    description: "Dispose d'au moins une sage-femme ou accoucheur diplômé pour les établissements offrant des soins maternels",
    categorie: "Personnel de Santé",
    ponderation: 6,
    obligatoire: false,
  },
  {
    code: "ESS-PER-005",
    libelle: "Technicien de laboratoire",
    description: "Dispose d'un technicien de laboratoire qualifié si l'établissement offre des services de laboratoire",
    categorie: "Personnel de Santé",
    ponderation: 5,
    obligatoire: false,
  },
  {
    code: "ESS-PER-006",
    libelle: "Formation continue du personnel",
    description: "Plan de formation continue documenté et mis en œuvre pour le personnel de santé",
    categorie: "Personnel de Santé",
    ponderation: 4,
    obligatoire: false,
  },
  {
    code: "ESS-PER-007",
    libelle: "Organigramme et fiches de poste",
    description: "Dispose d'un organigramme à jour et de fiches de poste pour chaque catégorie de personnel",
    categorie: "Personnel de Santé",
    ponderation: 3,
    obligatoire: false,
  },
  // --- QUALITÉ ET SÉCURITÉ DES SOINS ---
  {
    code: "ESS-QUA-001",
    libelle: "Protocoles thérapeutiques validés",
    description: "Applique les protocoles thérapeutiques validés par l'ARC-CSU pour la prise en charge standardisée",
    categorie: "Qualité et Sécurité des Soins",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "ESS-QUA-002",
    libelle: "Dossier médical patient",
    description: "Tient un dossier médical individuel pour chaque patient, conservé au minimum 10 ans (Art. 32-35, Loi 18/035)",
    categorie: "Qualité et Sécurité des Soins",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-QUA-003",
    libelle: "Registres de consultation et d'hospitalisation",
    description: "Tient à jour les registres de consultation, d'hospitalisation, d'accouchement et de vaccination",
    categorie: "Qualité et Sécurité des Soins",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "ESS-QUA-004",
    libelle: "Respect des droits des patients",
    description: "Respecte le droit à l'information, au consentement éclairé, à la dignité et à la non-discrimination (Art. 15-29)",
    categorie: "Qualité et Sécurité des Soins",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-QUA-005",
    libelle: "Tarification conforme CSU",
    description: "Applique les tarifs forfaitaires fixés par l'ARC-CSU pour les prestations dans le cadre de la CSU",
    categorie: "Qualité et Sécurité des Soins",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-QUA-006",
    libelle: "Système de référence et contre-référence",
    description: "Dispose d'un système fonctionnel de référence et de contre-référence avec les structures de niveau supérieur/inférieur",
    categorie: "Qualité et Sécurité des Soins",
    ponderation: 5,
    obligatoire: false,
  },
  {
    code: "ESS-QUA-007",
    libelle: "Comité de gestion ou d'assurance qualité",
    description: "Dispose d'un comité de gestion fonctionnel qui se réunit régulièrement pour l'amélioration de la qualité",
    categorie: "Qualité et Sécurité des Soins",
    ponderation: 4,
    obligatoire: false,
  },
  // --- HYGIÈNE ET PRÉVENTION DES INFECTIONS ---
  {
    code: "ESS-HYG-001",
    libelle: "Gestion des déchets biomédicaux",
    description: "Dispose d'un système de tri, collecte et élimination des déchets biomédicaux (poubelles codifiées, incinérateur ou fosse)",
    categorie: "Hygiène et Prévention des Infections",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "ESS-HYG-002",
    libelle: "Dispositifs de lavage des mains",
    description: "Points de lavage des mains avec eau et savon/SHA disponibles dans chaque zone de soins",
    categorie: "Hygiène et Prévention des Infections",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-HYG-003",
    libelle: "Équipements de protection individuelle",
    description: "Gants, masques, blouses, lunettes de protection disponibles en quantité suffisante",
    categorie: "Hygiène et Prévention des Infections",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "ESS-HYG-004",
    libelle: "Propreté générale des locaux",
    description: "Locaux maintenus propres avec un programme de nettoyage et désinfection documenté",
    categorie: "Hygiène et Prévention des Infections",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-HYG-005",
    libelle: "Prévention des infections nosocomiales",
    description: "Protocoles de prévention des infections nosocomiales documentés et appliqués (Art. 30, Loi 18/035)",
    categorie: "Hygiène et Prévention des Infections",
    ponderation: 6,
    obligatoire: true,
  },
  // --- MÉDICAMENTS ET PRODUITS ---
  {
    code: "ESS-MED-001",
    libelle: "Disponibilité des médicaments essentiels",
    description: "Dispose des médicaments essentiels conformément à la liste nationale des médicaments essentiels de la RDC",
    categorie: "Médicaments et Produits Pharmaceutiques",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "ESS-MED-002",
    libelle: "Conditions de stockage des médicaments",
    description: "Médicaments stockés dans un local sécurisé, ventilé, à l'abri de la lumière et de l'humidité",
    categorie: "Médicaments et Produits Pharmaceutiques",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-MED-003",
    libelle: "Gestion des stocks et traçabilité",
    description: "Tient un registre de gestion des stocks avec suivi des entrées/sorties, dates de péremption et numéros de lot",
    categorie: "Médicaments et Produits Pharmaceutiques",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "ESS-MED-004",
    libelle: "Absence de produits périmés/contrefaits",
    description: "Aucun médicament périmé, contrefait, falsifié ou altéré n'est détenu ni utilisé (Art. 131, Loi 18/035)",
    categorie: "Médicaments et Produits Pharmaceutiques",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "ESS-MED-005",
    libelle: "Approvisionnement via circuit officiel",
    description: "S'approvisionne uniquement auprès de sources autorisées et du système national d'approvisionnement (Art. 54)",
    categorie: "Médicaments et Produits Pharmaceutiques",
    ponderation: 7,
    obligatoire: true,
  },
  // --- SYSTÈME D'INFORMATION SANITAIRE ---
  {
    code: "ESS-SIS-001",
    libelle: "Rapports SNIS mensuels",
    description: "Transmet mensuellement les données au SNIS via les supports appropriés du Ministère de la Santé (Art. 44-47)",
    categorie: "Système d'Information Sanitaire",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "ESS-SIS-002",
    libelle: "Surveillance épidémiologique",
    description: "Participe à la surveillance épidémiologique et notifie les maladies à déclaration obligatoire",
    categorie: "Système d'Information Sanitaire",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "ESS-SIS-003",
    libelle: "Outils de collecte de données",
    description: "Dispose des outils standardisés de collecte de données (fiches, registres, canevas de rapport)",
    categorie: "Système d'Information Sanitaire",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "ESS-SIS-004",
    libelle: "Déclarations RSSP à jour",
    description: "Les déclarations mensuelles et trimestrielles RSSP sont soumises dans les délais requis",
    categorie: "Système d'Information Sanitaire",
    ponderation: 7,
    obligatoire: true,
  },
];

// ============================================
// CRITÈRES D'ACCRÉDITATION EPVG
// (Établissements Pharmaceutiques de Vente en Gros)
// Ref: Loi 18/035, Décret 22/14, Bonnes Pratiques de Distribution
// ============================================
const criteresEPVG = [
  // --- JURIDIQUE ET ADMINISTRATIF ---
  {
    code: "EPVG-JUR-001",
    libelle: "Autorisation d'ouverture et de fonctionnement",
    description: "Dispose d'une autorisation d'exploitation délivrée par l'autorité compétente pour la vente en gros pharmaceutique",
    categorie: "Juridique et Administratif",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "EPVG-JUR-002",
    libelle: "Inscription au plan de couverture sanitaire",
    description: "Inscrit dans le plan de couverture sanitaire et intégré au SNIS",
    categorie: "Juridique et Administratif",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "EPVG-JUR-003",
    libelle: "Enregistrement RCCM",
    description: "Possède un numéro valide au Registre du Commerce et du Crédit Mobilier",
    categorie: "Juridique et Administratif",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "EPVG-JUR-004",
    libelle: "Identification nationale (Id. Nat.)",
    description: "Possède un numéro d'identification nationale en cours de validité",
    categorie: "Juridique et Administratif",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "EPVG-JUR-005",
    libelle: "Numéro impôt",
    description: "En règle avec l'administration fiscale et possède un numéro impôt valide",
    categorie: "Juridique et Administratif",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "EPVG-JUR-006",
    libelle: "Autorisation d'importation/exportation",
    description: "Dispose des autorisations d'importation et/ou exportation de produits pharmaceutiques délivrées par l'autorité de réglementation (Art. 53)",
    categorie: "Juridique et Administratif",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-JUR-007",
    libelle: "Contrat avec le FSS/ARC-CSU",
    description: "Dispose d'un contrat validé par l'ARC-CSU pour la fourniture pharmaceutique dans le cadre de la CSU",
    categorie: "Juridique et Administratif",
    ponderation: 5,
    obligatoire: false,
  },
  // --- INFRASTRUCTURE ET LOCAUX ---
  {
    code: "EPVG-INF-001",
    libelle: "Entrepôt conforme aux normes",
    description: "Dispose d'un entrepôt de stockage conforme : surface suffisante, hauteur sous plafond, revêtement des sols et murs lavable",
    categorie: "Infrastructure et Locaux",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "EPVG-INF-002",
    libelle: "Zones de stockage séparées",
    description: "Dispose de zones distinctes : réception, stockage, préparation des commandes, expédition, quarantaine, produits retournés",
    categorie: "Infrastructure et Locaux",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-INF-003",
    libelle: "Zone de quarantaine sécurisée",
    description: "Dispose d'une zone de quarantaine identifiée et sécurisée pour les produits en attente de décision",
    categorie: "Infrastructure et Locaux",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-INF-004",
    libelle: "Zone pour produits à température contrôlée",
    description: "Dispose de chambres froides ou réfrigérateurs pour les produits nécessitant une conservation au froid (2-8°C)",
    categorie: "Infrastructure et Locaux",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-INF-005",
    libelle: "Zone pour stupéfiants et substances contrôlées",
    description: "Dispose d'un local sécurisé (coffre-fort ou armoire blindée) pour le stockage des stupéfiants et psychotropes",
    categorie: "Infrastructure et Locaux",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-INF-006",
    libelle: "Bureau administratif et documentation",
    description: "Dispose de bureaux pour l'administration, la gestion documentaire et l'archivage",
    categorie: "Infrastructure et Locaux",
    ponderation: 4,
    obligatoire: false,
  },
  {
    code: "EPVG-INF-007",
    libelle: "Quai de chargement/déchargement",
    description: "Dispose d'un quai ou zone de chargement/déchargement protégé des intempéries",
    categorie: "Infrastructure et Locaux",
    ponderation: 5,
    obligatoire: false,
  },
  {
    code: "EPVG-INF-008",
    libelle: "Sécurisation du site",
    description: "Site clôturé avec contrôle d'accès, système anti-intrusion et/ou gardiennage",
    categorie: "Infrastructure et Locaux",
    ponderation: 6,
    obligatoire: true,
  },
  // --- ÉQUIPEMENTS ---
  {
    code: "EPVG-EQP-001",
    libelle: "Système de contrôle de température et humidité",
    description: "Dispose de thermomètres/hygromètres calibrés dans toutes les zones de stockage avec enregistrement continu",
    categorie: "Équipements",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-EQP-002",
    libelle: "Système de ventilation/climatisation",
    description: "Système de ventilation ou climatisation maintenant la température entre 15-25°C dans les zones de stockage",
    categorie: "Équipements",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-EQP-003",
    libelle: "Groupe électrogène de secours",
    description: "Dispose d'un groupe électrogène fonctionnel pour assurer la continuité de la chaîne de froid en cas de coupure",
    categorie: "Équipements",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-EQP-004",
    libelle: "Rayonnages et palettes conformes",
    description: "Dispose de rayonnages métalliques et de palettes permettant le stockage organisé sans contact direct avec le sol",
    categorie: "Équipements",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "EPVG-EQP-005",
    libelle: "Matériel de manutention",
    description: "Dispose de chariots, transpalettes et autre matériel de manutention adapté",
    categorie: "Équipements",
    ponderation: 4,
    obligatoire: false,
  },
  {
    code: "EPVG-EQP-006",
    libelle: "Système informatique de gestion des stocks",
    description: "Dispose d'un logiciel de gestion des stocks permettant la traçabilité complète des lots",
    categorie: "Équipements",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "EPVG-EQP-007",
    libelle: "Extincteurs et système anti-incendie",
    description: "Dispose d'extincteurs vérifiés et d'un système de détection/lutte anti-incendie",
    categorie: "Équipements",
    ponderation: 5,
    obligatoire: true,
  },
  // --- PERSONNEL ---
  {
    code: "EPVG-PER-001",
    libelle: "Pharmacien responsable diplômé",
    description: "Dirigé par un pharmacien diplômé inscrit à l'Ordre des Pharmaciens, présent ou joignable en permanence",
    categorie: "Personnel",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "EPVG-PER-002",
    libelle: "Personnel technique qualifié",
    description: "Dispose de préparateurs en pharmacie ou assistants qualifiés en nombre suffisant pour le volume d'activité",
    categorie: "Personnel",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-PER-003",
    libelle: "Personnel certifié ARC-CSU",
    description: "Le personnel clé dispose d'une certification ARC-CSU attestant sa compétence pour la CSU",
    categorie: "Personnel",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-PER-004",
    libelle: "Responsable assurance qualité",
    description: "Dispose d'un responsable assurance qualité identifié avec formation appropriée",
    categorie: "Personnel",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "EPVG-PER-005",
    libelle: "Formation continue du personnel",
    description: "Plan de formation continue sur les BPD, la pharmacovigilance et la gestion des produits pharmaceutiques",
    categorie: "Personnel",
    ponderation: 5,
    obligatoire: false,
  },
  {
    code: "EPVG-PER-006",
    libelle: "Fiches de poste et organigramme",
    description: "Dispose d'un organigramme à jour et de fiches de poste définissant les responsabilités",
    categorie: "Personnel",
    ponderation: 3,
    obligatoire: false,
  },
  // --- BONNES PRATIQUES DE DISTRIBUTION ---
  {
    code: "EPVG-BPD-001",
    libelle: "Manuel de Bonnes Pratiques de Distribution",
    description: "Dispose d'un manuel BPD documenté, approuvé et accessible à tout le personnel",
    categorie: "Bonnes Pratiques de Distribution",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-BPD-002",
    libelle: "Procédures opératoires standardisées (POS)",
    description: "Dispose de POS pour : réception, stockage, préparation commandes, expédition, rappels, retours, réclamations",
    categorie: "Bonnes Pratiques de Distribution",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-BPD-003",
    libelle: "Traçabilité complète des lots",
    description: "Système de traçabilité permettant de suivre chaque lot depuis la réception jusqu'à la distribution au client",
    categorie: "Bonnes Pratiques de Distribution",
    ponderation: 9,
    obligatoire: true,
  },
  {
    code: "EPVG-BPD-004",
    libelle: "Gestion FEFO/FIFO",
    description: "Applique la règle FEFO (First Expired First Out) pour la rotation des stocks",
    categorie: "Bonnes Pratiques de Distribution",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-BPD-005",
    libelle: "Système de rappel des produits",
    description: "Dispose d'une procédure de rappel efficace permettant de retirer un produit du marché dans les 24h",
    categorie: "Bonnes Pratiques de Distribution",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-BPD-006",
    libelle: "Vérification des clients autorisés",
    description: "Vérifie que les clients sont autorisés à acheter des produits pharmaceutiques avant toute vente",
    categorie: "Bonnes Pratiques de Distribution",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-BPD-007",
    libelle: "Transport conforme",
    description: "Les conditions de transport maintiennent l'intégrité des produits (température, protection physique)",
    categorie: "Bonnes Pratiques de Distribution",
    ponderation: 7,
    obligatoire: true,
  },
  // --- QUALITÉ ET CONFORMITÉ PRODUITS ---
  {
    code: "EPVG-QUA-001",
    libelle: "Produits avec AMM valide",
    description: "Tous les médicaments distribués disposent d'une Autorisation de Mise sur le Marché (AMM) valide en RDC",
    categorie: "Qualité et Conformité des Produits",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "EPVG-QUA-002",
    libelle: "Absence de produits contrefaits/périmés",
    description: "Aucun produit contrefait, falsifié, altéré ou périmé n'est détenu ni distribué (Art. 131, Loi 18/035)",
    categorie: "Qualité et Conformité des Produits",
    ponderation: 10,
    obligatoire: true,
  },
  {
    code: "EPVG-QUA-003",
    libelle: "Contrôle qualité à la réception",
    description: "Procédure de vérification à la réception : identité, quantité, intégrité, certificat d'analyse, conditions de transport",
    categorie: "Qualité et Conformité des Produits",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-QUA-004",
    libelle: "Pharmacovigilance",
    description: "Système de déclaration des effets indésirables et de pharmacovigilance conforme à la réglementation",
    categorie: "Qualité et Conformité des Produits",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "EPVG-QUA-005",
    libelle: "Gestion des produits non conformes",
    description: "Procédure documentée de gestion des produits non conformes : isolement, investigation, destruction sécurisée",
    categorie: "Qualité et Conformité des Produits",
    ponderation: 7,
    obligatoire: true,
  },
  {
    code: "EPVG-QUA-006",
    libelle: "Respect de la réglementation publicitaire",
    description: "Publicité des médicaments conforme à la réglementation : uniquement auprès du personnel médical (Art. 55-56)",
    categorie: "Qualité et Conformité des Produits",
    ponderation: 5,
    obligatoire: true,
  },
  // --- SYSTÈME D'INFORMATION ---
  {
    code: "EPVG-SIS-001",
    libelle: "Rapports d'activité périodiques",
    description: "Transmet les rapports d'activité aux autorités compétentes dans les délais requis",
    categorie: "Système d'Information",
    ponderation: 6,
    obligatoire: true,
  },
  {
    code: "EPVG-SIS-002",
    libelle: "Registre des stupéfiants et psychotropes",
    description: "Tient un registre spécial pour les stupéfiants et psychotropes avec suivi rigoureux des entrées/sorties",
    categorie: "Système d'Information",
    ponderation: 8,
    obligatoire: true,
  },
  {
    code: "EPVG-SIS-003",
    libelle: "Archivage documentaire",
    description: "Archive les documents (bons de commande, factures, certificats, PV de destruction) pendant au moins 5 ans",
    categorie: "Système d'Information",
    ponderation: 5,
    obligatoire: true,
  },
  {
    code: "EPVG-SIS-004",
    libelle: "Déclarations RSSP à jour",
    description: "Les déclarations mensuelles et trimestrielles RSSP sont soumises dans les délais requis",
    categorie: "Système d'Information",
    ponderation: 7,
    obligatoire: true,
  },
];

async function main() {
  console.log("🌱 Début du seeding...");

  // Créer les provinces
  console.log("📍 Création des 26 provinces de la RDC...");
  for (const province of provinces) {
    await prisma.province.upsert({
      where: { code: province.code },
      update: {},
      create: province,
    });
  }
  console.log(`✅ ${provinces.length} provinces créées`);

  // Récupérer Kinshasa
  const kinshasa = await prisma.province.findUnique({
    where: { code: "KIN" },
  });

  if (kinshasa) {
    // Créer les zones de santé de Kinshasa
    console.log("🏥 Création des zones de santé de Kinshasa...");
    for (const zone of zonesSanteKinshasa) {
      const createdZone = await prisma.zoneSante.upsert({
        where: { code: zone.code },
        update: {},
        create: {
          ...zone,
          provinceId: kinshasa.id,
        },
      });

      // Créer quelques aires de santé pour chaque zone
      const aires = [
        { code: `${zone.code}-AS1`, name: `${zone.name} Centre` },
        { code: `${zone.code}-AS2`, name: `${zone.name} Nord` },
        { code: `${zone.code}-AS3`, name: `${zone.name} Sud` },
      ];

      for (const aire of aires) {
        await prisma.aireSante.upsert({
          where: { code: aire.code },
          update: {},
          create: {
            ...aire,
            zoneSanteId: createdZone.id,
          },
        });
      }
    }
    console.log(`✅ ${zonesSanteKinshasa.length} zones de santé créées avec leurs aires`);
  }

  // Créer les critères d'accréditation ESS
  console.log("📋 Création des critères d'accréditation ESS...");
  for (const critere of criteresESS) {
    await prisma.critereEvaluation.upsert({
      where: { code: critere.code },
      update: {
        libelle: critere.libelle,
        description: critere.description,
        categorie: critere.categorie,
        ponderation: critere.ponderation,
        obligatoire: critere.obligatoire,
      },
      create: {
        ...critere,
        typeEtablissement: "ESS",
      },
    });
  }
  console.log(`✅ ${criteresESS.length} critères ESS créés`);

  // Créer les critères d'accréditation EPVG
  console.log("📋 Création des critères d'accréditation EPVG...");
  for (const critere of criteresEPVG) {
    await prisma.critereEvaluation.upsert({
      where: { code: critere.code },
      update: {
        libelle: critere.libelle,
        description: critere.description,
        categorie: critere.categorie,
        ponderation: critere.ponderation,
        obligatoire: critere.obligatoire,
      },
      create: {
        ...critere,
        typeEtablissement: "EPVG",
      },
    });
  }
  console.log(`✅ ${criteresEPVG.length} critères EPVG créés`);

  // Créer un utilisateur admin par défaut
  console.log("👤 Vérification de l'utilisateur admin...");
  const adminExists = await prisma.user.findUnique({
    where: { email: "admin@arccsu.gouv.cd" },
  });

  if (!adminExists) {
    console.log("⚠️ Aucun admin trouvé. Créez un compte via /register puis modifiez son rôle.");
  }

  console.log("🎉 Seeding terminé avec succès!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
