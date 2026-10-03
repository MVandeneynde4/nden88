import { z } from "zod";
import {
  DOMAINES,
  PHASES,
  POSTES,
  PRIORITES,
  STATUTS_DEVIS,
  STATUTS_FACTURE,
  STATUTS_PROJET,
  STATUTS_TACHE,
  TYPES_CLIENT,
  TYPES_PIECE,
} from "./types";

const texte = (min = 0, msg = "Champ obligatoire") =>
  z.string().trim().min(min, msg).max(2000, "Texte trop long");

const obligatoire = (nom: string) => z.string().trim().min(1, `${nom} obligatoire`);

const dateIso = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide");

const nombrePositif = (msg = "Doit être un nombre positif") =>
  z.coerce.number({ error: "Nombre invalide" }).min(0, msg);

const choix = <T extends readonly [string, ...string[]]>(valeurs: T) =>
  z.enum(valeurs, { error: "Valeur invalide" });

export const schemaClient = z.object({
  nom: texte(2, "Le nom doit contenir au moins 2 caractères"),
  type: choix(TYPES_CLIENT),
  contact: texte(),
  email: z.union([z.literal(""), z.email("Adresse e-mail invalide")]),
  telephone: texte(),
  adresse: texte(),
  ville: texte(),
  notes: texte(),
});

export const schemaCollaborateur = z.object({
  prenom: texte(1, "Prénom obligatoire"),
  nom: texte(1, "Nom obligatoire"),
  poste: choix(POSTES),
  email: z.union([z.literal(""), z.email("Adresse e-mail invalide")]),
  telephone: texte(),
  coutHoraire: nombrePositif(),
  heuresHebdo: z.coerce.number({ error: "Nombre invalide" }).min(1, "Minimum 1 h").max(60, "Maximum 60 h"),
  actif: z.boolean(),
});

export const schemaProjet = z
  .object({
    nom: texte(3, "Le nom doit contenir au moins 3 caractères"),
    clientId: obligatoire("Client"),
    chefProjetId: obligatoire("Chef de projet"),
    domaine: choix(DOMAINES),
    phase: choix(PHASES),
    statut: choix(STATUTS_PROJET),
    ville: texte(),
    dateDebut: dateIso,
    dateFin: dateIso,
    budgetHonoraires: nombrePositif(),
    budgetHeures: nombrePositif(),
    description: texte(),
  })
  .refine((p) => p.dateFin >= p.dateDebut, {
    message: "La date de fin doit suivre la date de début",
    path: ["dateFin"],
  });

export const schemaTache = z.object({
  projetId: obligatoire("Affaire"),
  titre: texte(2, "Titre obligatoire"),
  description: texte(),
  assigneId: obligatoire("Responsable"),
  statut: choix(STATUTS_TACHE),
  priorite: choix(PRIORITES),
  echeance: dateIso,
  heuresEstimees: nombrePositif(),
});

export const schemaTemps = z.object({
  collaborateurId: obligatoire("Collaborateur"),
  projetId: obligatoire("Affaire"),
  date: dateIso,
  heures: z.coerce
    .number({ error: "Nombre invalide" })
    .min(0.25, "Minimum 0,25 h")
    .max(24, "Maximum 24 h"),
  description: texte(),
});

export const schemaLigne = z.object({
  designation: texte(1, "Désignation obligatoire"),
  quantite: z.coerce.number({ error: "Quantité invalide" }).positive("Quantité > 0"),
  prixUnitaire: nombrePositif("Prix invalide"),
});

export const schemaPiece = z
  .object({
    type: choix(TYPES_PIECE),
    projetId: obligatoire("Affaire"),
    objet: texte(2, "Objet obligatoire"),
    date: dateIso,
    echeance: dateIso,
    statut: z.string(),
    tauxTva: z.coerce.number({ error: "Taux invalide" }).min(0).max(100),
    lignes: z.array(schemaLigne).min(1, "Ajoutez au moins une ligne"),
  })
  .refine(
    (p) =>
      (p.type === "devis" ? (STATUTS_DEVIS as readonly string[]) : (STATUTS_FACTURE as readonly string[])).includes(
        p.statut,
      ),
    { message: "Statut invalide pour ce type de pièce", path: ["statut"] },
  )
  .refine((p) => p.echeance >= p.date, {
    message: "L'échéance doit suivre la date",
    path: ["echeance"],
  });
