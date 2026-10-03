import type { Metadata } from "next";
import { FormulaireProjet } from "@/components/formulaires/projet";
import { Carte, EnTete } from "@/components/ui";
import { ajouterJours } from "@/lib/calculs";
import { chargerDonnees, optionsClients, optionsCollaborateurs } from "@/lib/requetes";

export const metadata: Metadata = { title: "Nouvelle affaire" };

export default async function NouveauProjet({ searchParams }: PageProps<"/projets/nouveau">) {
  const { client } = (await searchParams) as Record<string, string | undefined>;
  const { db, aujourdhui } = await chargerDonnees();
  return (
    <>
      <EnTete
        titre="Nouvelle affaire"
        sousTitre="Le code d'affaire est attribué automatiquement à l'enregistrement."
        retour={{ href: "/projets", libelle: "Affaires" }}
      />
      <Carte className="max-w-4xl">
        <FormulaireProjet
          clients={optionsClients(db)}
          collaborateurs={optionsCollaborateurs(db)}
          defauts={{ clientId: client, dateDebut: aujourdhui, dateFin: ajouterJours(aujourdhui, 180) }}
        />
      </Carte>
    </>
  );
}
