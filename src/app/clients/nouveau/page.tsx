import type { Metadata } from "next";
import { FormulaireClient } from "@/components/formulaires/client";
import { Carte, EnTete } from "@/components/ui";

export const metadata: Metadata = { title: "Nouveau client" };

export default function NouveauClient() {
  return (
    <>
      <EnTete titre="Nouveau client" retour={{ href: "/clients", libelle: "Clients" }} />
      <Carte className="max-w-3xl">
        <FormulaireClient />
      </Carte>
    </>
  );
}
