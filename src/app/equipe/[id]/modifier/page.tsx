import { notFound } from "next/navigation";
import { FormulaireCollaborateur } from "@/components/formulaires/collaborateur";
import { Carte, EnTete } from "@/components/ui";
import { chargerDonnees } from "@/lib/requetes";

export default async function ModifierCollaborateur({ params }: PageProps<"/equipe/[id]/modifier">) {
  const { id } = await params;
  const { collaborateur } = await chargerDonnees();
  const c = collaborateur(id);
  if (!c) notFound();
  const nom = `${c.prenom} ${c.nom}`;
  return (
    <>
      <EnTete titre={`Modifier ${nom}`} retour={{ href: `/equipe/${c.id}`, libelle: nom }} />
      <Carte className="max-w-3xl">
        <FormulaireCollaborateur collaborateur={c} />
      </Carte>
    </>
  );
}
