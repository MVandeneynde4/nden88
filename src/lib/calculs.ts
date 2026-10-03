// Fonctions pures de calcul : sans accès aux données, donc testables unitairement
// et utilisables aussi bien côté serveur que côté client.
import type { LignePiece, Piece, Projet, SaisieTemps, Collaborateur, TypePiece } from "./types";

export function arrondi2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function totalLigne(l: LignePiece): number {
  return arrondi2(l.quantite * l.prixUnitaire);
}

export function montantsPiece(p: Pick<Piece, "lignes" | "tauxTva">) {
  const ht = arrondi2(p.lignes.reduce((s, l) => s + totalLigne(l), 0));
  const tva = arrondi2((ht * p.tauxTva) / 100);
  return { ht, tva, ttc: arrondi2(ht + tva) };
}

/** Prochain numéro chronologique pour l'année : D-2026-001, F-2026-002, AFF-2026-003… */
export function prochainNumero(prefixe: string, existants: string[], annee: number): string {
  const debut = `${prefixe}-${annee}-`;
  const max = existants
    .filter((n) => n.startsWith(debut))
    .map((n) => Number.parseInt(n.slice(debut.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 0);
  return `${debut}${String(max + 1).padStart(3, "0")}`;
}

export function prefixePiece(type: TypePiece): string {
  return type === "devis" ? "D" : "F";
}

export interface Consommation {
  heures: number;
  cout: number;
  /** Part du budget d'heures consommée, en % (0 si pas de budget). */
  pctHeures: number;
  /** Honoraires HT − coût consommé. */
  marge: number;
  pctMarge: number;
}

export function consommationProjet(
  projet: Pick<Projet, "id" | "budgetHeures" | "budgetHonoraires">,
  temps: SaisieTemps[],
  collaborateurs: Pick<Collaborateur, "id" | "coutHoraire">[],
): Consommation {
  const cout = new Map(collaborateurs.map((c) => [c.id, c.coutHoraire]));
  let heures = 0;
  let total = 0;
  for (const t of temps) {
    if (t.projetId !== projet.id) continue;
    heures += t.heures;
    total += t.heures * (cout.get(t.collaborateurId) ?? 0);
  }
  heures = arrondi2(heures);
  total = arrondi2(total);
  const marge = arrondi2(projet.budgetHonoraires - total);
  return {
    heures,
    cout: total,
    pctHeures: projet.budgetHeures > 0 ? arrondi2((heures / projet.budgetHeures) * 100) : 0,
    marge,
    pctMarge: projet.budgetHonoraires > 0 ? arrondi2((marge / projet.budgetHonoraires) * 100) : 0,
  };
}

// ---------- Dates (format ISO AAAA-MM-JJ, en heure locale) ----------

export function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${j}`;
}

export function parseIso(s: string): Date {
  const [a, m, j] = s.split("-").map(Number);
  return new Date(a, m - 1, j);
}

export function ajouterJours(s: string, n: number): string {
  const d = parseIso(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

/** Lundi de la semaine contenant la date donnée. */
export function debutSemaine(s: string): string {
  const d = parseIso(s);
  const decalage = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - decalage);
  return isoDate(d);
}

export function joursOuvresDuMois(annee: number, mois: number): number {
  let n = 0;
  const d = new Date(annee, mois, 1);
  while (d.getMonth() === mois) {
    const j = d.getDay();
    if (j !== 0 && j !== 6) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

// ---------- Formatage ----------

const fmtEuro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const fmtEuro0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const fmtNombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const fmtDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export const euros = (n: number) => fmtEuro.format(n);
export const eurosArrondis = (n: number) => fmtEuro0.format(n);
export const nombre = (n: number) => fmtNombre.format(n);
export const heures = (n: number) => `${fmtNombre.format(n)} h`;
export const dateCourte = (s: string) => (s ? fmtDate.format(parseIso(s)) : "—");
