import type { Metadata } from "next";
import { FormulaireTache } from "@/components/formulaires/tache";
import { Carte, EnTete } from "@/components/ui";
import { ajouterJours } from "@/lib/calculs";
import { chargerDonnees, optionsCollaborateurs, optionsProjets } from "@/lib/requetes";

export const metadata: Metadata = { title: "Nouvelle tâche" };

export default async function NouvelleTache({ searchParams }: PageProps<"/taches/nouvelle">) {
  const { projet } = (await searchParams) as Record<string, string | undefined>;
  const { db, aujourdhui } = await chargerDonnees();
  const retour = projet ? `/projets/${projet}` : "/taches";
  return (
    <>
      <EnTete titre="Nouvelle tâche" retour={{ href: retour, libelle: "Retour" }} />
      <Carte className="max-w-3xl">
        <FormulaireTache
          projets={optionsProjets(db, { ouvertes: true })}
          collaborateurs={optionsCollaborateurs(db)}
          defauts={{ projetId: projet, echeance: ajouterJours(aujourdhui, 7) }}
          retour={retour}
        />
      </Carte>
    </>
  );
}
