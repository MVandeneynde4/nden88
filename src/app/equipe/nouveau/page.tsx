import type { Metadata } from "next";
import { FormulaireCollaborateur } from "@/components/formulaires/collaborateur";
import { Carte, EnTete } from "@/components/ui";

export const metadata: Metadata = { title: "Nouveau collaborateur" };

export default function NouveauCollaborateur() {
  return (
    <>
      <EnTete titre="Nouveau collaborateur" retour={{ href: "/equipe", libelle: "Équipe" }} />
      <Carte className="max-w-3xl">
        <FormulaireCollaborateur />
      </Carte>
    </>
  );
}
