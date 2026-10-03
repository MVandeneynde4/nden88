import { describe, expect, it } from "vitest";
import { heuresParSemaine, indicateurs } from "../indicateurs";
import { creerDonneesDemo } from "../seed";
import { schemaPiece, schemaProjet } from "../schemas";

const AUJOURDHUI = new Date(2026, 9, 3); // samedi 3 octobre 2026
const jour = "2026-10-03";

describe("jeu de démonstration", () => {
  const db = creerDonneesDemo(AUJOURDHUI);

  it("est déterministe", () => {
    expect(creerDonneesDemo(AUJOURDHUI)).toEqual(db);
  });

  it("n'a pas de référence orpheline", () => {
    const clients = new Set(db.clients.map((c) => c.id));
    const collabs = new Set(db.collaborateurs.map((c) => c.id));
    const projets = new Set(db.projets.map((p) => p.id));
    for (const p of db.projets) {
      expect(clients.has(p.clientId)).toBe(true);
      expect(collabs.has(p.chefProjetId)).toBe(true);
    }
    for (const t of db.taches) expect(projets.has(t.projetId) && collabs.has(t.assigneId)).toBe(true);
    for (const t of db.temps) expect(projets.has(t.projetId) && collabs.has(t.collaborateurId)).toBe(true);
    for (const p of db.pieces) expect(projets.has(p.projetId)).toBe(true);
  });

  it("ne saisit aucun temps le week-end ni dans le futur", () => {
    for (const t of db.temps) {
      const d = new Date(`${t.date}T12:00:00`);
      expect([0, 6]).not.toContain(d.getDay());
      expect(t.date < jour).toBe(true);
      expect(t.heures).toBeGreaterThan(0);
    }
  });

  it("passe la validation des formulaires", () => {
    for (const p of db.projets) expect(schemaProjet.safeParse(p).success).toBe(true);
    for (const p of db.pieces) expect(schemaPiece.safeParse(p).success).toBe(true);
  });
});

describe("indicateurs", () => {
  const db = creerDonneesDemo(AUJOURDHUI);
  const k = indicateurs(db, jour);

  it("compte les affaires et repère les factures échues", () => {
    expect(k.nbEnCours).toBe(db.projets.filter((p) => p.statut === "En cours").length);
    expect(k.retards.map((f) => f.numero)).toEqual(["F-2026-003"]);
    expect(k.retardTtc).toBe(16440); // (9 500 + 4 200) × 1,2
  });

  it("calcule le CA de l'année sur les seules factures émises ou payées", () => {
    // F-001 17 000 + F-002 18 500 + F-003 13 700 + F-004 11 900 + F-005 9 700 ; F-006 brouillon exclue
    expect(k.caAnnee).toBe(70800);
  });

  it("donne un taux de saisie plausible", () => {
    expect(k.tauxSaisie).toBeGreaterThan(50);
    expect(k.tauxSaisie).toBeLessThanOrEqual(110);
  });

  it("produit 8 semaines dont la dernière est la semaine courante", () => {
    const s = heuresParSemaine(db, jour);
    expect(s).toHaveLength(8);
    expect(s.at(-1)).toMatchObject({ debut: "2026-09-28", courante: true });
    expect(s.filter((x) => x.courante)).toHaveLength(1);
  });
});

describe("validation", () => {
  it("refuse une affaire qui se termine avant de commencer", () => {
    const r = schemaProjet.safeParse({
      nom: "Test", clientId: "c", chefProjetId: "x", domaine: "Structure", phase: "ESQ", statut: "Prospect",
      ville: "", dateDebut: "2026-10-10", dateFin: "2026-10-01", budgetHonoraires: "0", budgetHeures: "0", description: "",
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["dateFin"]);
  });

  it("refuse un statut de facture sur un devis", () => {
    const r = schemaPiece.safeParse({
      type: "devis", projetId: "p", objet: "Objet", date: "2026-10-01", echeance: "2026-10-31",
      statut: "Payée", tauxTva: "20", lignes: [{ designation: "x", quantite: "1", prixUnitaire: "10" }],
    });
    expect(r.success).toBe(false);
  });
});
