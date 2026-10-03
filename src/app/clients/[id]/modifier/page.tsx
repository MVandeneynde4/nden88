import { notFound } from "next/navigation";
import { FormulaireClient } from "@/components/formulaires/client";
import { Carte, EnTete } from "@/components/ui";
import { chargerDonnees } from "@/lib/requetes";

export default async function ModifierClient({ params }: PageProps<"/clients/[id]/modifier">) {
  const { id } = await params;
  const { client } = await chargerDonnees();
  const c = client(id);
  if (!c) notFound();
  return (
    <>
      <EnTete titre={`Modifier ${c.nom}`} retour={{ href: `/clients/${c.id}`, libelle: c.nom }} />
      <Carte className="max-w-3xl">
        <FormulaireClient client={c} />
      </Carte>
    </>
  );
}
