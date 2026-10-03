// Modèle de données du bureau d'études.
// Les dates sont stockées au format ISO "AAAA-MM-JJ".

export const TYPES_CLIENT = ["Public", "Privé", "Particulier"] as const;
export type TypeClient = (typeof TYPES_CLIENT)[number];

export interface Client {
  id: string;
  nom: string;
  type: TypeClient;
  contact: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  notes: string;
  creeLe: string;
}

export const POSTES = [
  "Directeur technique",
  "Chef de projet",
  "Ingénieur structure",
  "Ingénieur fluides",
  "Ingénieur électricité",
  "Ingénieur VRD",
  "Projeteur",
  "Dessinateur",
  "Économiste",
  "Assistant(e)",
] as const;
export type Poste = (typeof POSTES)[number];

export interface Collaborateur {
  id: string;
  prenom: string;
  nom: string;
  poste: Poste;
  email: string;
  telephone: string;
  /** Coût horaire chargé en € HT, utilisé pour calculer le coût consommé des affaires. */
  coutHoraire: number;
  /** Heures contractuelles par semaine, utilisées pour le taux d'occupation. */
  heuresHebdo: number;
  actif: boolean;
}

export const DOMAINES = [
  "Structure",
  "Fluides / CVC",
  "Électricité",
  "VRD",
  "Thermique / RE2020",
  "Économie de la construction",
  "OPC",
  "Pluridisciplinaire",
] as const;
export type Domaine = (typeof DOMAINES)[number];

/** Phases de mission de maîtrise d'œuvre (loi MOP). */
export const PHASES = ["ESQ", "APS", "APD", "PRO", "DCE", "ACT", "VISA", "DET", "AOR"] as const;
export type Phase = (typeof PHASES)[number];

export const PHASE_LIBELLES: Record<Phase, string> = {
  ESQ: "Esquisse",
  APS: "Avant-projet sommaire",
  APD: "Avant-projet définitif",
  PRO: "Projet",
  DCE: "Dossier de consultation",
  ACT: "Assistance contrats de travaux",
  VISA: "Visa des études d'exécution",
  DET: "Direction de l'exécution",
  AOR: "Assistance aux opérations de réception",
};

export const STATUTS_PROJET = ["Prospect", "En cours", "En pause", "Terminé", "Annulé"] as const;
export type StatutProjet = (typeof STATUTS_PROJET)[number];

export interface Projet {
  id: string;
  /** Référence de l'affaire, ex. AFF-2026-004. */
  code: string;
  nom: string;
  clientId: string;
  chefProjetId: string;
  domaine: Domaine;
  phase: Phase;
  statut: StatutProjet;
  ville: string;
  dateDebut: string;
  dateFin: string;
  /** Montant des honoraires en € HT. */
  budgetHonoraires: number;
  budgetHeures: number;
  description: string;
}

export const STATUTS_TACHE = ["À faire", "En cours", "En revue", "Terminé"] as const;
export type StatutTache = (typeof STATUTS_TACHE)[number];

export const PRIORITES = ["Basse", "Normale", "Haute", "Urgente"] as const;
export type Priorite = (typeof PRIORITES)[number];

export interface Tache {
  id: string;
  projetId: string;
  titre: string;
  description: string;
  assigneId: string;
  statut: StatutTache;
  priorite: Priorite;
  echeance: string;
  heuresEstimees: number;
}

export interface SaisieTemps {
  id: string;
  collaborateurId: string;
  projetId: string;
  date: string;
  heures: number;
  description: string;
}

export const TYPES_PIECE = ["devis", "facture"] as const;
export type TypePiece = (typeof TYPES_PIECE)[number];

export const STATUTS_DEVIS = ["Brouillon", "Envoyé", "Accepté", "Refusé"] as const;
export const STATUTS_FACTURE = ["Brouillon", "Émise", "Payée", "Annulée"] as const;
export type StatutDevis = (typeof STATUTS_DEVIS)[number];
export type StatutFacture = (typeof STATUTS_FACTURE)[number];
export type StatutPiece = StatutDevis | StatutFacture;

export interface LignePiece {
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Piece {
  id: string;
  type: TypePiece;
  /** Numéro chronologique, ex. D-2026-003 ou F-2026-012. */
  numero: string;
  projetId: string;
  objet: string;
  date: string;
  echeance: string;
  statut: StatutPiece;
  tauxTva: number;
  lignes: LignePiece[];
}

export interface Database {
  clients: Client[];
  collaborateurs: Collaborateur[];
  projets: Projet[];
  taches: Tache[];
  temps: SaisieTemps[];
  pieces: Piece[];
}
