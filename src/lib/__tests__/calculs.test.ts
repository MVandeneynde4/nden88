import { describe, expect, it } from "vitest";
import {
  ajouterJours,
  consommationProjet,
  debutSemaine,
  joursOuvresDuMois,
  montantsPiece,
  prochainNumero,
} from "../calculs";

describe("montantsPiece", () => {
  it("calcule HT, TVA et TTC en arrondissant au centime", () => {
    const m = montantsPiece({
      tauxTva: 20,
      lignes: [
        { designation: "Phase APS", quantite: 1, prixUnitaire: 1234.56 },
        { designation: "Visas", quantite: 3, prixUnitaire: 33.333 },
      ],
    });
    expect(m).toEqual({ ht: 1334.56, tva: 266.91, ttc: 1601.47 });
  });

  it("renvoie zéro sans ligne", () => {
    expect(montantsPiece({ tauxTva: 20, lignes: [] })).toEqual({ ht: 0, tva: 0, ttc: 0 });
  });
});

describe("prochainNumero", () => {
  it("incrémente le plus grand numéro de l'année et ignore les autres années", () => {
    const existants = ["F-2026-001", "F-2026-007", "F-2025-042", "D-2026-010"];
    expect(prochainNumero("F", existants, 2026)).toBe("F-2026-008");
    expect(prochainNumero("D", existants, 2026)).toBe("D-2026-011");
    expect(prochainNumero("F", existants, 2027)).toBe("F-2027-001");
  });

  it("ne confond pas des préfixes qui se recouvrent", () => {
    expect(prochainNumero("AFF", ["AFF-2026-003", "AFFX-2026-099"], 2026)).toBe("AFF-2026-004");
  });
});

describe("dates", () => {
  it("trouve le lundi de la semaine", () => {
    expect(debutSemaine("2026-10-03")).toBe("2026-09-28"); // samedi
    expect(debutSemaine("2026-10-04")).toBe("2026-09-28"); // dimanche
    expect(debutSemaine("2026-09-28")).toBe("2026-09-28"); // lundi
  });

  it("ajoute des jours en franchissant les mois et le changement d'heure", () => {
    expect(ajouterJours("2026-10-24", 7)).toBe("2026-10-31");
    expect(ajouterJours("2026-10-31", 1)).toBe("2026-11-01");
    expect(ajouterJours("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("compte les jours ouvrés d'un mois", () => {
    expect(joursOuvresDuMois(2026, 9)).toBe(22); // octobre 2026
  });
});

describe("consommationProjet", () => {
  const projet = { id: "p1", budgetHeures: 100, budgetHonoraires: 10000 };
  const collaborateurs = [
    { id: "a", coutHoraire: 50 },
    { id: "b", coutHoraire: 80 },
  ];
  const t = (collaborateurId: string, projetId: string, heures: number) => ({
    id: Math.random().toString(),
    collaborateurId,
    projetId,
    heures,
    date: "2026-10-01",
    description: "",
  });

  it("agrège les heures et le coût de revient du seul projet concerné", () => {
    const c = consommationProjet(projet, [t("a", "p1", 10), t("b", "p1", 5), t("a", "p2", 99)], collaborateurs);
    expect(c.heures).toBe(15);
    expect(c.cout).toBe(900);
    expect(c.pctHeures).toBe(15);
    expect(c.marge).toBe(9100);
    expect(c.pctMarge).toBe(91);
  });

  it("supporte un budget nul sans division par zéro", () => {
    const c = consommationProjet({ id: "p1", budgetHeures: 0, budgetHonoraires: 0 }, [t("a", "p1", 2)], collaborateurs);
    expect(c.pctHeures).toBe(0);
    expect(c.pctMarge).toBe(0);
    expect(c.marge).toBe(-100);
  });
});
