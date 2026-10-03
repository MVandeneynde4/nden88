// Accès en lecture aux données, avec index pour les jointures fréquentes.
import "server-only";
import { isoDate } from "./calculs";
import { lireDb } from "./db";
import type { Database } from "./types";

export async function chargerDonnees() {
  const db = await lireDb();
  return { db, ...index(db), aujourdhui: isoDate(new Date()) };
}

export function index(db: Database) {
  const clients = new Map(db.clients.map((c) => [c.id, c]));
  const collaborateurs = new Map(db.collaborateurs.map((c) => [c.id, c]));
  const projets = new Map(db.projets.map((p) => [p.id, p]));
  return {
    client: (id: string) => clients.get(id),
    collaborateur: (id: string) => collaborateurs.get(id),
    projet: (id: string) => projets.get(id),
    nomCollaborateur: (id: string) => {
      const c = collaborateurs.get(id);
      return c ? `${c.prenom} ${c.nom}` : "—";
    },
  };
}

export function optionsClients(db: Database) {
  return [...db.clients]
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
    .map((c) => ({ valeur: c.id, libelle: c.nom }));
}

/** Collaborateurs actifs, plus éventuellement un inactif déjà sélectionné (édition). */
export function optionsCollaborateurs(db: Database, inclure?: string) {
  return db.collaborateurs
    .filter((c) => c.actif || c.id === inclure)
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
    .map((c) => ({ valeur: c.id, libelle: `${c.prenom} ${c.nom}${c.actif ? "" : " (inactif)"}` }));
}

/** Affaires, les plus récentes d'abord ; `ouvertes` exclut les affaires clôturées. */
export function optionsProjets(db: Database, { ouvertes = false, inclure }: { ouvertes?: boolean; inclure?: string } = {}) {
  return db.projets
    .filter((p) => !ouvertes || (p.statut !== "Terminé" && p.statut !== "Annulé") || p.id === inclure)
    .sort((a, b) => b.code.localeCompare(a.code))
    .map((p) => ({ valeur: p.id, libelle: `${p.code} — ${p.nom}` }));
}
