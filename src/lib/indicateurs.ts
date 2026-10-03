// Indicateurs agrégés du tableau de bord. Fonctions pures (pas d'accès disque).
import { ajouterJours, arrondi2, consommationProjet, debutSemaine, montantsPiece } from "./calculs";
import type { Database, Piece } from "./types";

export const estFactureEmise = (p: Piece) =>
  p.type === "facture" && (p.statut === "Émise" || p.statut === "Payée");

export const estEnRetard = (p: Piece, aujourdhui: string) =>
  p.type === "facture" && p.statut === "Émise" && p.echeance < aujourdhui;

/** Montant HT facturé (factures émises ou payées) pour une affaire. */
export function factureHtProjet(db: Database, projetId: string): number {
  return arrondi2(
    db.pieces
      .filter((p) => p.projetId === projetId && estFactureEmise(p))
      .reduce((s, p) => s + montantsPiece(p).ht, 0),
  );
}

export function indicateurs(db: Database, aujourdhui: string) {
  const annee = aujourdhui.slice(0, 4);
  const enCours = db.projets.filter((p) => p.statut === "En cours");

  const facturesAnnee = db.pieces.filter((p) => estFactureEmise(p) && p.date.startsWith(annee));
  const caAnnee = arrondi2(facturesAnnee.reduce((s, p) => s + montantsPiece(p).ht, 0));

  const emises = db.pieces.filter((p) => p.type === "facture" && p.statut === "Émise");
  const enAttenteTtc = arrondi2(emises.reduce((s, p) => s + montantsPiece(p).ttc, 0));
  const retards = emises.filter((p) => estEnRetard(p, aujourdhui));
  const retardTtc = arrondi2(retards.reduce((s, p) => s + montantsPiece(p).ttc, 0));

  // Reste à facturer sur les affaires en cours = honoraires − facturé.
  const resteAFacturer = arrondi2(
    enCours.reduce((s, p) => s + Math.max(0, p.budgetHonoraires - factureHtProjet(db, p.id)), 0),
  );

  // Taux de saisie sur les 4 dernières semaines complètes (lundi → dimanche).
  const finPeriode = debutSemaine(aujourdhui); // lundi de la semaine courante, exclu
  const debutPeriode = ajouterJours(finPeriode, -28);
  const actifs = db.collaborateurs.filter((c) => c.actif);
  const heuresPeriode = db.temps
    .filter((t) => t.date >= debutPeriode && t.date < finPeriode)
    .reduce((s, t) => s + t.heures, 0);
  const capacite = actifs.reduce((s, c) => s + c.heuresHebdo * 4, 0);
  const tauxSaisie = capacite > 0 ? arrondi2((heuresPeriode / capacite) * 100) : 0;

  const tachesOuvertes = db.taches.filter((t) => t.statut !== "Terminé");
  const tachesEnRetard = tachesOuvertes.filter((t) => t.echeance < aujourdhui);
  const dans7Jours = ajouterJours(aujourdhui, 7);
  const tachesProches = tachesOuvertes
    .filter((t) => t.echeance >= aujourdhui && t.echeance <= dans7Jours)
    .sort((a, b) => a.echeance.localeCompare(b.echeance));

  const affaires = enCours
    .map((p) => {
      const conso = consommationProjet(p, db.temps, db.collaborateurs);
      const facture = factureHtProjet(db, p.id);
      return {
        projet: p,
        conso,
        facture,
        pctFacture: p.budgetHonoraires > 0 ? arrondi2((facture / p.budgetHonoraires) * 100) : 0,
        enRetard: p.dateFin < aujourdhui,
      };
    })
    .sort((a, b) => b.conso.pctHeures - a.conso.pctHeures);

  return {
    nbEnCours: enCours.length,
    nbProspects: db.projets.filter((p) => p.statut === "Prospect").length,
    caAnnee,
    enAttenteTtc,
    nbEmises: emises.length,
    retards,
    retardTtc,
    resteAFacturer,
    heuresPeriode: arrondi2(heuresPeriode),
    capacite,
    tauxSaisie,
    tachesEnRetard,
    tachesProches,
    affaires,
    alertes: affaires.filter((a) => a.conso.pctHeures > 100 || a.enRetard),
  };
}

/** Heures saisies par semaine sur les `n` dernières semaines (semaine courante incluse). */
export function heuresParSemaine(db: Database, aujourdhui: string, n = 8) {
  const courante = debutSemaine(aujourdhui);
  return Array.from({ length: n }, (_, i) => {
    const debut = ajouterJours(courante, -7 * (n - 1 - i));
    const fin = ajouterJours(debut, 7);
    const heures = db.temps
      .filter((t) => t.date >= debut && t.date < fin)
      .reduce((s, t) => s + t.heures, 0);
    return { debut, heures: arrondi2(heures), courante: debut === courante };
  });
}
