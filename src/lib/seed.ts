// Jeu de données de démonstration, généré au premier lancement.
// Les dates sont calculées par rapport au jour de génération pour que
// le tableau de bord présente des données récentes.
import { ajouterJours, isoDate, parseIso } from "./calculs";
import type {
  Client,
  Collaborateur,
  Database,
  Piece,
  Projet,
  SaisieTemps,
  Tache,
} from "./types";

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function aleatoire(graine: number) {
  let a = graine;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function creerDonneesDemo(aujourdhui: Date = new Date()): Database {
  const rnd = aleatoire(42);
  const jour = isoDate(aujourdhui);
  const annee = aujourdhui.getFullYear();
  const j = (n: number) => ajouterJours(jour, n);

  const clients: Client[] = [
    { id: "cli-1", nom: "Ville de Lyon — Direction du patrimoine", type: "Public", contact: "Claire Martin", email: "c.martin@mairie-lyon.fr", telephone: "04 72 10 30 30", adresse: "1 place de la Comédie", ville: "Lyon", notes: "Marchés publics, procédure MAPA.", creeLe: j(-400) },
    { id: "cli-2", nom: "Immobilière Rhône-Alpes", type: "Privé", contact: "Thomas Girard", email: "t.girard@ira-promotion.fr", telephone: "04 78 42 11 90", adresse: "24 rue de la République", ville: "Lyon", notes: "Promoteur, logements collectifs.", creeLe: j(-300) },
    { id: "cli-3", nom: "Département de l'Isère", type: "Public", contact: "Sophie Bernard", email: "s.bernard@isere.fr", telephone: "04 76 00 38 38", adresse: "7 rue Fantin-Latour", ville: "Grenoble", notes: "", creeLe: j(-250) },
    { id: "cli-4", nom: "Logistique Saône SAS", type: "Privé", contact: "Marc Dubois", email: "m.dubois@logisaone.fr", telephone: "04 74 65 20 10", adresse: "ZI Nord, 12 allée des Entrepôts", ville: "Villefranche-sur-Saône", notes: "Plateformes logistiques.", creeLe: j(-180) },
    { id: "cli-5", nom: "M. et Mme Lefèvre", type: "Particulier", contact: "Julien Lefèvre", email: "julien.lefevre@email.fr", telephone: "06 12 34 56 78", adresse: "8 chemin des Vignes", ville: "Écully", notes: "Extension maison individuelle.", creeLe: j(-60) },
    { id: "cli-6", nom: "Clinique du Parc", type: "Privé", contact: "Dr. Nadia Rousseau", email: "direction@clinique-parc.fr", telephone: "04 72 55 66 77", adresse: "155 boulevard Stalingrad", ville: "Villeurbanne", notes: "", creeLe: j(-30) },
  ];

  const collaborateurs: Collaborateur[] = [
    { id: "col-1", prenom: "Antoine", nom: "Moreau", poste: "Directeur technique", email: "a.moreau@be-nden.fr", telephone: "06 10 00 00 01", coutHoraire: 85, heuresHebdo: 39, actif: true },
    { id: "col-2", prenom: "Camille", nom: "Laurent", poste: "Chef de projet", email: "c.laurent@be-nden.fr", telephone: "06 10 00 00 02", coutHoraire: 70, heuresHebdo: 39, actif: true },
    { id: "col-3", prenom: "Hugo", nom: "Petit", poste: "Ingénieur structure", email: "h.petit@be-nden.fr", telephone: "06 10 00 00 03", coutHoraire: 60, heuresHebdo: 35, actif: true },
    { id: "col-4", prenom: "Léa", nom: "Garnier", poste: "Ingénieur fluides", email: "l.garnier@be-nden.fr", telephone: "06 10 00 00 04", coutHoraire: 58, heuresHebdo: 35, actif: true },
    { id: "col-5", prenom: "Mehdi", nom: "Benali", poste: "Projeteur", email: "m.benali@be-nden.fr", telephone: "06 10 00 00 05", coutHoraire: 48, heuresHebdo: 35, actif: true },
    { id: "col-6", prenom: "Inès", nom: "Fontaine", poste: "Ingénieur VRD", email: "i.fontaine@be-nden.fr", telephone: "06 10 00 00 06", coutHoraire: 55, heuresHebdo: 35, actif: true },
    { id: "col-7", prenom: "Paul", nom: "Roux", poste: "Dessinateur", email: "p.roux@be-nden.fr", telephone: "06 10 00 00 07", coutHoraire: 42, heuresHebdo: 35, actif: true },
  ];

  const projets: Projet[] = [
    { id: "prj-1", code: `AFF-${annee}-001`, nom: "Groupe scolaire Gerland — extension", clientId: "cli-1", chefProjetId: "col-2", domaine: "Structure", phase: "PRO", statut: "En cours", ville: "Lyon 7e", dateDebut: j(-150), dateFin: j(90), budgetHonoraires: 68000, budgetHeures: 950, description: "Extension R+2 de 6 classes, structure bois-béton. Mission de base + EXE partielle." },
    { id: "prj-2", code: `AFF-${annee}-002`, nom: "Résidence Les Terrasses — 48 logements", clientId: "cli-2", chefProjetId: "col-1", domaine: "Pluridisciplinaire", phase: "DET", statut: "En cours", ville: "Villeurbanne", dateDebut: j(-320), dateFin: j(120), budgetHonoraires: 142000, budgetHeures: 2100, description: "Logements collectifs R+5 sur parking enterré. Lots structure, fluides et thermique RE2020." },
    { id: "prj-3", code: `AFF-${annee}-003`, nom: "Pont de la RD 1075 — réhabilitation", clientId: "cli-3", chefProjetId: "col-3", domaine: "Structure", phase: "APD", statut: "En cours", ville: "Voreppe", dateDebut: j(-90), dateFin: j(10), budgetHonoraires: 54000, budgetHeures: 700, description: "Diagnostic et réparation d'un ouvrage d'art en béton précontraint." },
    { id: "prj-4", code: `AFF-${annee}-004`, nom: "Plateforme logistique Arnas — 22 000 m²", clientId: "cli-4", chefProjetId: "col-2", domaine: "VRD", phase: "DCE", statut: "En cours", ville: "Arnas", dateDebut: j(-60), dateFin: j(150), budgetHonoraires: 96000, budgetHeures: 1300, description: "VRD, voiries lourdes, gestion des eaux pluviales et bassins de rétention." },
    { id: "prj-5", code: `AFF-${annee}-005`, nom: "Extension maison Lefèvre", clientId: "cli-5", chefProjetId: "col-3", domaine: "Structure", phase: "APS", statut: "En cours", ville: "Écully", dateDebut: j(-20), dateFin: j(40), budgetHonoraires: 4800, budgetHeures: 60, description: "Extension ossature bois de 35 m² avec ouverture de mur porteur." },
    { id: "prj-6", code: `AFF-${annee}-006`, nom: "Clinique du Parc — rénovation CVC bloc opératoire", clientId: "cli-6", chefProjetId: "col-4", domaine: "Fluides / CVC", phase: "ESQ", statut: "Prospect", ville: "Villeurbanne", dateDebut: j(10), dateFin: j(240), budgetHonoraires: 38000, budgetHeures: 480, description: "Remplacement CTA, traitement d'air ISO 5 des salles d'opération." },
    { id: "prj-7", code: `AFF-${annee - 1}-014`, nom: "Gymnase Jean Macé — mise en accessibilité", clientId: "cli-1", chefProjetId: "col-1", domaine: "Pluridisciplinaire", phase: "AOR", statut: "Terminé", ville: "Lyon 7e", dateDebut: j(-420), dateFin: j(-35), budgetHonoraires: 29000, budgetHeures: 380, description: "Ascenseur, rampes, sanitaires PMR." },
    { id: "prj-8", code: `AFF-${annee}-007`, nom: "Collège de Vif — audit énergétique", clientId: "cli-3", chefProjetId: "col-4", domaine: "Thermique / RE2020", phase: "ESQ", statut: "En pause", ville: "Vif", dateDebut: j(-45), dateFin: j(60), budgetHonoraires: 12500, budgetHeures: 160, description: "Audit et scénarios de rénovation (décret tertiaire). En attente des relevés." },
  ];

  const taches: Tache[] = [];
  const modeles: [string, string, Tache["statut"], Tache["priorite"], number, number][] = [
    // projetId, titre, statut, priorité, échéance (jours), heures estimées
    ["prj-1", "Note de calcul descente de charges", "Terminé", "Haute", -30, 24],
    ["prj-1", "Plans de coffrage R+1", "En cours", "Haute", 5, 40],
    ["prj-1", "Plans de coffrage R+2", "À faire", "Normale", 20, 40],
    ["prj-1", "Vérification sismique", "En revue", "Haute", 2, 16],
    ["prj-2", "Visa plans EXE gros œuvre bâtiment B", "En cours", "Urgente", 1, 12],
    ["prj-2", "Compte rendu de chantier hebdomadaire", "À faire", "Normale", 3, 4],
    ["prj-2", "Réception réseaux CVC parking", "À faire", "Haute", 12, 8],
    ["prj-2", "Étude RE2020 — mise à jour finale", "Terminé", "Normale", -10, 20],
    ["prj-3", "Inspection détaillée tablier", "Terminé", "Haute", -40, 30],
    ["prj-3", "Recalcul précontrainte", "En cours", "Urgente", -2, 36],
    ["prj-3", "Estimation APD", "À faire", "Haute", 8, 16],
    ["prj-4", "Profil en long voiries", "En cours", "Normale", 7, 24],
    ["prj-4", "Dimensionnement bassin de rétention", "En revue", "Haute", 4, 18],
    ["prj-4", "CCTP lot VRD", "À faire", "Normale", 25, 30],
    ["prj-4", "DPGF lot VRD", "À faire", "Normale", 28, 14],
    ["prj-5", "Relevé sur site", "Terminé", "Normale", -12, 4],
    ["prj-5", "Dimensionnement linteau ouverture", "En cours", "Haute", 6, 6],
    ["prj-6", "Visite technique bloc opératoire", "À faire", "Normale", 14, 6],
    ["prj-6", "Proposition d'honoraires", "En cours", "Haute", 4, 5],
    ["prj-8", "Relance relevés énergétiques", "À faire", "Basse", -5, 1],
  ];
  const assignes: Record<string, string[]> = {
    "prj-1": ["col-3", "col-5", "col-7"],
    "prj-2": ["col-1", "col-4", "col-2"],
    "prj-3": ["col-3", "col-5"],
    "prj-4": ["col-6", "col-7", "col-2"],
    "prj-5": ["col-3"],
    "prj-6": ["col-4"],
    "prj-8": ["col-4"],
  };
  modeles.forEach(([projetId, titre, statut, priorite, jours, h], i) => {
    const pool = assignes[projetId];
    taches.push({
      id: `tac-${i + 1}`,
      projetId,
      titre,
      description: "",
      assigneId: pool[i % pool.length],
      statut,
      priorite,
      echeance: j(jours),
      heuresEstimees: h,
    });
  });

  // Saisies de temps sur les 10 dernières semaines (jours ouvrés uniquement).
  const temps: SaisieTemps[] = [];
  const affectations: Record<string, string[]> = {
    "col-1": ["prj-2", "prj-7", "prj-1"],
    "col-2": ["prj-1", "prj-4", "prj-2"],
    "col-3": ["prj-1", "prj-3", "prj-5"],
    "col-4": ["prj-2", "prj-6", "prj-8"],
    "col-5": ["prj-1", "prj-3"],
    "col-6": ["prj-4"],
    "col-7": ["prj-1", "prj-4"],
  };
  const libelles = ["Calculs", "Plans", "Réunion", "Synthèse", "Visite de chantier", "Rédaction", "Métrés"];
  let n = 0;
  for (let k = 70; k >= 1; k--) {
    const date = j(-k);
    const js = parseIso(date).getDay();
    if (js === 0 || js === 6) continue;
    for (const [colId, prjs] of Object.entries(affectations)) {
      const actifs = prjs.filter((p) => {
        const pr = projets.find((x) => x.id === p)!;
        return pr.dateDebut <= date && (pr.statut !== "Terminé" || pr.dateFin >= date) && pr.statut !== "Prospect";
      });
      if (actifs.length === 0 || rnd() < 0.08) continue; // absences / congés
      let reste = 7 + Math.round(rnd() * 2) / 2 - 0.5;
      actifs.forEach((p, idx) => {
        if (reste <= 0) return;
        const h = idx === actifs.length - 1 ? reste : Math.max(0.5, Math.round(rnd() * reste * 2) / 2);
        reste -= h;
        temps.push({
          id: `tps-${++n}`,
          collaborateurId: colId,
          projetId: p,
          date,
          heures: h,
          description: libelles[Math.floor(rnd() * libelles.length)],
        });
      });
    }
  }

  const pieces: Piece[] = [
    { id: "pie-1", type: "devis", numero: `D-${annee}-001`, projetId: "prj-1", objet: "Mission de maîtrise d'œuvre structure", date: j(-160), echeance: j(-130), statut: "Accepté", tauxTva: 20, lignes: [{ designation: "Phases ESQ à PRO", quantite: 1, prixUnitaire: 38000 }, { designation: "Phases DCE à AOR", quantite: 1, prixUnitaire: 30000 }] },
    { id: "pie-2", type: "facture", numero: `F-${annee}-001`, projetId: "prj-1", objet: "Acompte phases ESQ / APS", date: j(-100), echeance: j(-70), statut: "Payée", tauxTva: 20, lignes: [{ designation: "Phase ESQ", quantite: 1, prixUnitaire: 6800 }, { designation: "Phase APS", quantite: 1, prixUnitaire: 10200 }] },
    { id: "pie-3", type: "facture", numero: `F-${annee}-002`, projetId: "prj-2", objet: "Situation n°6 — DET", date: j(-55), echeance: j(-25), statut: "Payée", tauxTva: 20, lignes: [{ designation: "DET — avancement 40 %", quantite: 1, prixUnitaire: 18500 }] },
    { id: "pie-4", type: "facture", numero: `F-${annee}-003`, projetId: "prj-3", objet: "Diagnostic ouvrage", date: j(-45), echeance: j(-15), statut: "Émise", tauxTva: 20, lignes: [{ designation: "Inspection détaillée", quantite: 1, prixUnitaire: 9500 }, { designation: "Rapport de diagnostic", quantite: 1, prixUnitaire: 4200 }] },
    { id: "pie-5", type: "facture", numero: `F-${annee}-004`, projetId: "prj-1", objet: "Phase APD", date: j(-20), echeance: j(10), statut: "Émise", tauxTva: 20, lignes: [{ designation: "Phase APD", quantite: 1, prixUnitaire: 11900 }] },
    { id: "pie-6", type: "facture", numero: `F-${annee}-005`, projetId: "prj-2", objet: "Situation n°7 — DET", date: j(-8), echeance: j(22), statut: "Émise", tauxTva: 20, lignes: [{ designation: "DET — avancement 55 %", quantite: 1, prixUnitaire: 7000 }, { designation: "Visas complémentaires", quantite: 6, prixUnitaire: 450 }] },
    { id: "pie-7", type: "devis", numero: `D-${annee}-002`, projetId: "prj-5", objet: "Étude structure extension", date: j(-25), echeance: j(5), statut: "Accepté", tauxTva: 20, lignes: [{ designation: "Relevé et note de calcul", quantite: 1, prixUnitaire: 2900 }, { designation: "Plans d'exécution", quantite: 1, prixUnitaire: 1900 }] },
    { id: "pie-8", type: "devis", numero: `D-${annee}-003`, projetId: "prj-6", objet: "Rénovation CVC bloc opératoire", date: j(-3), echeance: j(27), statut: "Envoyé", tauxTva: 20, lignes: [{ designation: "Études ESQ à PRO", quantite: 1, prixUnitaire: 21000 }, { designation: "DCE, ACT", quantite: 1, prixUnitaire: 7000 }, { designation: "DET, AOR", quantite: 1, prixUnitaire: 10000 }] },
    { id: "pie-9", type: "facture", numero: `F-${annee}-006`, projetId: "prj-4", objet: "Phases AVP / PRO", date: j(-2), echeance: j(28), statut: "Brouillon", tauxTva: 20, lignes: [{ designation: "AVP VRD", quantite: 1, prixUnitaire: 14400 }, { designation: "PRO VRD", quantite: 1, prixUnitaire: 19200 }] },
  ];

  return { clients, collaborateurs, projets, taches, temps, pieces };
}
