/** Erreur fonctionnelle dont le message peut être montré tel quel à l'utilisateur. */
export class ErreurMetier extends Error {}

export function messageErreur(e: unknown): string {
  if (e instanceof ErreurMetier) return e.message;
  console.error(e);
  return "Une erreur inattendue est survenue. Réessayez.";
}

export interface EtatAction {
  erreur?: string;
}
