import type { Metadata } from "next";
import { FormulairePiece } from "@/components/formulaires/piece";
import { Carte, EnTete } from "@/components/ui";
import { ajouterJours } from "@/lib/calculs";
import { chargerDonnees, optionsProjets } from "@/lib/requetes";

export const metadata: Metadata = { title: "Nouvelle pièce" };

export default async function NouvellePiece({ searchParams }: PageProps<"/facturation/nouveau">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const type = sp.type === "facture" ? "facture" : "devis";
  const { db, aujourdhui } = await chargerDonnees();
  return (
    <>
      <EnTete
        titre={type === "devis" ? "Nouveau devis" : "Nouvelle facture"}
        sousTitre="Le numéro est attribué automatiquement à l'enregistrement."
        retour={{ href: "/facturation", libelle: "Facturation" }}
      />
      <Carte className="max-w-5xl">
        <FormulairePiece
          type={type}
          projets={optionsProjets(db, { ouvertes: true, inclure: sp.projet })}
          defauts={{ projetId: sp.projet, date: aujourdhui, echeance: ajouterJours(aujourdhui, 30) }}
        />
      </Carte>
    </>
  );
}
