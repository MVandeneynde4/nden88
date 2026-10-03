import type { Priorite, StatutPiece, StatutProjet, StatutTache } from "./types";

export type Ton = "gris" | "bleu" | "vert" | "orange" | "rouge" | "violet";

export const tonStatutProjet: Record<StatutProjet, Ton> = {
  Prospect: "violet",
  "En cours": "bleu",
  "En pause": "orange",
  Terminé: "vert",
  Annulé: "gris",
};

export const tonStatutTache: Record<StatutTache, Ton> = {
  "À faire": "gris",
  "En cours": "bleu",
  "En revue": "violet",
  Terminé: "vert",
};

export const tonPriorite: Record<Priorite, Ton> = {
  Basse: "gris",
  Normale: "bleu",
  Haute: "orange",
  Urgente: "rouge",
};

export const tonStatutPiece: Record<StatutPiece, Ton> = {
  Brouillon: "gris",
  Envoyé: "bleu",
  Accepté: "vert",
  Refusé: "rouge",
  Émise: "bleu",
  Payée: "vert",
  Annulée: "gris",
};
