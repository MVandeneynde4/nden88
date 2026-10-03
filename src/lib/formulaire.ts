// Utilitaires partagés par les Server Actions et les formulaires clients.
import type { z } from "zod";

export interface EtatFormulaire {
  /** Erreurs par champ, affichées sous chaque champ. */
  erreurs?: Record<string, string[] | undefined>;
  /** Erreur générale, affichée en haut du formulaire. */
  message?: string;
  /** Valeurs soumises, réinjectées pour ne pas perdre la saisie en cas d'erreur. */
  valeurs?: Record<string, string>;
}

export const etatInitial: EtatFormulaire = {};

/** Convertit un FormData en objet de chaînes (les champs multiples sont ignorés). */
export function versObjet(fd: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [cle, valeur] of fd.entries()) {
    if (typeof valeur === "string" && !(cle in obj)) obj[cle] = valeur;
  }
  return obj;
}

export function erreursZod(erreur: z.ZodError): EtatFormulaire["erreurs"] {
  const res: Record<string, string[]> = {};
  for (const issue of erreur.issues) {
    const cle = issue.path.map(String).join(".") || "_";
    (res[cle] ??= []).push(issue.message);
  }
  return res;
}
